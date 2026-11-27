"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { clearDraft, useSaveDraftOnExpire, useStoredDraft } from "@/features/auth/hooks/use-session-draft";
import { SkillPicker } from "@/features/skill/ui/skill-picker";
import { adminQueryKeys, isApiError, unwrapApiResult } from "@/shared/libs/api";
import type { UpdatePostRequestDto } from "@/shared/_generated";
import type { PostEditView, PostMediaView } from "@/shared/_controllers/post";
import { prepareImage } from "@/shared/libs/upload/upload-image";
import { EditorPlaceholder } from "@/shared/components/admin/editor-placeholder";
import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { AdminPanel } from "@/shared/components/admin/panel";
import { AdminLoading } from "@/shared/components/admin/state";
import { checkSlug, SlugField, type SlugStatus } from "@/shared/components/admin/slug-field";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { AlertDanger, FormLabel, FormMessage, Textarea, TextField } from "@/shared/components/form";
import { SLUG_PATTERN, toSlug } from "@/shared/utils";
import { createPostAction, updatePostAction, uploadPostImageAction } from "@/shared/_controllers/post/post.action";

// Figma 관리자 · 게시글 작성 / 수정. 상태는 컴포넌트 state, 검증은 등록할 때 직접 한다(설계 문서 2절).
// 본문 이미지는 올릴 때마다 Spring이 id를 준다. 저장할 때 본문에 남아 있는 이미지의 id만 보내 게시글에 연결한다
// (지운 이미지는 연결되지 않고, 연결되지 않은 이미지는 Spring 스케줄러가 정리한다).
// 수정은 Spring PATCH 방식이다: 불러온 값과 비교해 바뀐 필드만 보내고, 바뀐 게 없으면 요청하지 않는다.
const MarkdownEditor = dynamic(() => import("@/shared/components/markdown-editor/markdown-editor"), {
  ssr: false,
  loading: () => <EditorPlaceholder />,
});

type Errors = Partial<Record<"title" | "slug" | "summary" | "skills" | "content", string>>;

type PostFormProps = { post?: PostEditView };

/** 401로 로그인이 끊겼을 때 보관하는 작성 중 내용 */
type PostDraft = {
  title: string;
  slug: string;
  slugTouched: boolean;
  summary: string;
  skillIds: number[];
  content: string;
  /** 이 글에 넣었던 이미지(기존 + 새로 올린 것). 저장할 때 본문에 남은 것만 보낸다. */
  medias: PostMediaView[];
};

/** 본문에 남아 있는 이미지의 id (본문에 처음 나오는 순서) */
function mediaIdsInContent(content: string, medias: PostMediaView[]) {
  return medias
    .filter((media) => content.includes(media.url))
    .sort((a, b) => content.indexOf(a.url) - content.indexOf(b.url))
    .map((media) => media.id);
}

const sameIds = (a: number[], b: number[]) => a.join() === b.join();

/** 저장된 글과 비교해 바뀐 필드만 모은다(Spring PATCH). */
function toPostChanges(
  post: PostEditView,
  next: Omit<PostDraft, "slug" | "slugTouched" | "medias"> & { postMediaIds: number[] },
) {
  const changes: UpdatePostRequestDto = {};
  if (next.title !== post.title) changes.postTitle = next.title;
  if (next.summary !== post.summary) changes.postSummary = next.summary;
  if (next.content !== post.content) changes.postContent = next.content;
  if (!sameIds(next.skillIds, post.skillIds)) changes.skillIds = next.skillIds;
  const savedMediaIds = mediaIdsInContent(post.content, post.medias);
  if (!sameIds(next.postMediaIds, savedMediaIds)) changes.postMediaIds = next.postMediaIds;
  return changes;
}

// 보관된 초안이 있으면 그것을 폼의 초기값으로 쓴다(다시 로그인한 뒤 복원).
export function PostForm({ post }: PostFormProps) {
  const draftKey = post ? `post:${post.postId}` : "post:new";
  const { ready, draft } = useStoredDraft<PostDraft>(draftKey);
  if (!ready) return <AdminLoading />;
  return <PostFormBody post={post} draftKey={draftKey} draft={draft} />;
}

function PostFormBody(props: PostFormProps & { draftKey: string; draft: PostDraft | null }) {
  const { post, draftKey, draft } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(post);
  // 폼 값은 초안 보관 단위(PostDraft)와 같은 묶음 하나로 둔다. 초기값은 보관된 초안 → 저장된 글 순이고,
  // 슬러그만 저장된 값이 초안보다 먼저다(수정할 때는 슬러그를 바꿀 수 없다).
  const [form, setForm] = useState<PostDraft>(() => ({
    title: draft?.title ?? post?.title ?? "",
    slug: post?.slug ?? draft?.slug ?? "",
    slugTouched: draft?.slugTouched ?? isEdit,
    summary: draft?.summary ?? post?.summary ?? "",
    skillIds: draft?.skillIds ?? post?.skillIds ?? [],
    content: draft?.content ?? post?.content ?? "",
    medias: draft?.medias ?? post?.medias ?? [],
  }));
  const { title, slug, slugTouched, summary, skillIds, content } = form;
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(isEdit ? "available" : "idle");
  const [errors, setErrors] = useState<Errors>({});
  const setField = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  useSaveDraftOnExpire<PostDraft>(draftKey, form);

  // 에디터가 이미지를 올릴 때 부른다. 브라우저에서 WebP로 바꾼 뒤 올리고, 받은 id를 기억한다.
  async function uploadImage(file: File) {
    const image = new FormData();
    image.append("image", await prepareImage(file, "post"));
    const media = unwrapApiResult(await uploadPostImageAction(image));
    setForm((current) => ({ ...current, medias: [...current.medias, media] }));
    return { url: media.url };
  }

  const save = useMutation({
    mutationFn: async (fields: Omit<PostDraft, "slugTouched" | "medias"> & { postMediaIds: number[] }) => {
      if (!post) {
        unwrapApiResult(
          await createPostAction({
            postTitle: fields.title,
            postSlug: fields.slug,
            postSummary: fields.summary,
            postContent: fields.content,
            skillIds: fields.skillIds,
            postMediaIds: fields.postMediaIds,
          }),
        );
        return;
      }
      const changes = toPostChanges(post, fields);
      if (Object.keys(changes).length > 0) unwrapApiResult(await updatePostAction(post.postId, changes));
    },
    onSuccess: async () => {
      clearDraft(draftKey);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.posts.all }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.all }),
      ]);
      router.push("/admin/posts");
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) setSlugStatus("taken");
    },
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = "제목을 입력해 주세요.";
    else if (title.trim().length > 100) next.title = "제목은 100자까지 쓸 수 있어요.";
    if (!slug) next.slug = "슬러그를 입력해 주세요.";
    else if (!SLUG_PATTERN.test(slug)) next.slug = "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.";
    if (!summary.trim()) next.summary = "요약을 입력해 주세요.";
    else if (summary.trim().length > 200) next.summary = "요약은 200자까지 쓸 수 있어요.";
    if (skillIds.length === 0) next.skills = "기술 스택을 하나 이상 골라 주세요.";
    else if (skillIds.length > 20) next.skills = "기술 스택은 20개까지 고를 수 있어요.";
    if (!content.trim()) next.content = "본문을 입력해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // 중복 확인을 누르지 않았으면 등록할 때 한 번 확인한다.
    if (!isEdit && slugStatus !== "available") {
      setSlugStatus("checking");
      // 401이면 만료 오버레이가 열리므로 "사용 중"으로 표시하지 않는다.
      const available = await checkSlug("post", slug).catch((error) =>
        isApiError(error) && error.status === 401 ? null : false,
      );
      if (available === null) return setSlugStatus("idle");
      setSlugStatus(available ? "available" : "taken");
      if (!available) return;
    }
    save.mutate({
      title: title.trim(),
      slug,
      summary: summary.trim(),
      content,
      skillIds,
      postMediaIds: mediaIdsInContent(content, form.medias),
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <AdminPageHeader
        title={isEdit ? "게시글 수정" : "새 게시글"}
        back={{ href: "/admin/posts", label: "게시글 목록" }}
        actions={
          <>
            <ButtonCompact href="/admin/posts" className="h-11 px-4">
              취소
            </ButtonCompact>
            <Button type="submit" size="M" disabled={save.isPending || slugStatus === "checking"}>
              {isEdit ? "저장하기" : "등록하기"}
            </Button>
          </>
        }
      />
      {draft && !save.isSuccess && (
        <FormMessage status="success">로그인이 끊기기 전에 쓰던 내용을 복원했어요.</FormMessage>
      )}
      {save.error && !(isApiError(save.error) && [401, 409].includes(save.error.status ?? 0)) && (
        <AlertDanger>{save.error.message}</AlertDanger>
      )}

      <AdminPanel className="flex flex-col gap-[22px]">
        <div className="flex flex-col gap-2">
          <FormLabel htmlFor="post-title" required>
            제목
          </FormLabel>
          <TextField
            id="post-title"
            value={title}
            invalid={Boolean(errors.title)}
            placeholder="게시글 제목"
            onChange={(event) => {
              const next = event.target.value;
              setForm((current) => ({
                ...current,
                title: next,
                slug: current.slugTouched ? current.slug : toSlug(next),
              }));
              if (!slugTouched) setSlugStatus("idle");
            }}
          />
          {errors.title && <FormMessage status="error">{errors.title}</FormMessage>}
        </div>
        <SlugField
          type="post"
          value={slug}
          onChange={(value) => setForm((current) => ({ ...current, slug: value, slugTouched: true }))}
          status={slugStatus}
          onStatusChange={setSlugStatus}
          locked={isEdit}
          error={errors.slug}
        />
        <div className="flex flex-col gap-2">
          <FormLabel htmlFor="post-summary" required>
            요약
          </FormLabel>
          <Textarea
            id="post-summary"
            value={summary}
            invalid={Boolean(errors.summary)}
            placeholder="목록과 메인에 보이는 요약 문장"
            onChange={(event) => setField("summary", event.target.value)}
            className="min-h-[98px]"
          />
          {errors.summary && <FormMessage status="error">{errors.summary}</FormMessage>}
        </div>
      </AdminPanel>

      <SkillPicker value={skillIds} onChange={(ids) => setField("skillIds", ids)} error={errors.skills} />

      <div className="flex flex-col gap-2.5">
        <MarkdownEditor
          value={content}
          onChange={(markdown) => setField("content", markdown)}
          kind="post"
          uploadImage={uploadImage}
          invalid={Boolean(errors.content)}
        />
        {errors.content && <FormMessage status="error">{errors.content}</FormMessage>}
        <FormMessage status="help">
          이미지는 툴바의 이미지 버튼으로 올리거나 본문에 끌어다 놓아 넣어요. 본문 첫 번째 이미지가 목록 썸네일로
          쓰여요.
        </FormMessage>
      </div>
    </form>
  );
}
