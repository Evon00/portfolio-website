"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { clearDraft, useSaveDraftOnExpire, useStoredDraft } from "@/features/auth/hooks/use-session-draft";
import { SkillPicker } from "@/features/skill/ui/skill-picker";
import { adminQueryKeys, isApiError, unwrapApiResult } from "@/shared/libs/api";
import type { PostDetailResponse, PostSaveRequest } from "@/shared/_controllers/_legacy-types";
import { EditorPlaceholder } from "@/shared/components/admin/editor-placeholder";
import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { AdminPanel } from "@/shared/components/admin/panel";
import { AdminLoading } from "@/shared/components/admin/state";
import { checkSlug, SlugField, type SlugStatus } from "@/shared/components/admin/slug-field";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { AlertDanger, FormLabel, FormMessage, Textarea, TextField } from "@/shared/components/form";
import { SLUG_PATTERN, toSlug } from "@/shared/utils";
import { createPostAction, updatePostAction } from "@/shared/_controllers/post/post.action";

// Figma 관리자 · 게시글 작성 / 수정. 상태는 컴포넌트 state, 검증은 등록할 때 직접 한다(설계 문서 2절).
const MarkdownEditor = dynamic(() => import("@/shared/components/markdown-editor/markdown-editor"), {
  ssr: false,
  loading: () => <EditorPlaceholder />,
});

type Errors = Partial<Record<"title" | "slug" | "summary" | "skills" | "content", string>>;

type PostFormProps = { post?: PostDetailResponse };

/** 401로 로그인이 끊겼을 때 보관하는 작성 중 내용 */
type PostDraft = {
  title: string;
  slug: string;
  slugTouched: boolean;
  summary: string;
  skillIds: number[];
  content: string;
};

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
    skillIds: draft?.skillIds ?? post?.skills.map((skill) => skill.skillId) ?? [],
    content: draft?.content ?? post?.content ?? "",
  }));
  const { title, slug, slugTouched, summary, skillIds, content } = form;
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(isEdit ? "available" : "idle");
  const [errors, setErrors] = useState<Errors>({});
  const setField = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  useSaveDraftOnExpire<PostDraft>(draftKey, form);

  const save = useMutation({
    mutationFn: async (request: PostSaveRequest) =>
      unwrapApiResult(await (post ? updatePostAction(post.postId, request) : createPostAction(request))),
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
    if (!slug) next.slug = "슬러그를 입력해 주세요.";
    else if (!SLUG_PATTERN.test(slug)) next.slug = "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.";
    if (!summary.trim()) next.summary = "요약을 입력해 주세요.";
    if (skillIds.length === 0) next.skills = "기술 스택을 하나 이상 골라 주세요.";
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
    save.mutate({ title: title.trim(), slug, summary: summary.trim(), content, skillIds });
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
