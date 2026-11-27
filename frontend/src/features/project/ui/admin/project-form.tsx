"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useState } from "react";
import { clearDraft, useSaveDraftOnExpire, useStoredDraft } from "@/features/auth/hooks/use-session-draft";
import { SkillPicker } from "@/features/skill/ui/skill-picker";
import { adminQueryKeys, isApiError, unwrapApiResult } from "@/shared/libs/api";
import type { ProjectDetailResponse, ProjectSaveRequest } from "@/shared/_generated";
import { EditorPlaceholder } from "@/shared/components/admin/editor-placeholder";
import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { AdminPanel } from "@/shared/components/admin/panel";
import { AdminLoading } from "@/shared/components/admin/state";
import { checkSlug, SlugField, type SlugStatus } from "@/shared/components/admin/slug-field";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { AlertDanger, Checkbox, FormLabel, FormMessage, Textarea, TextField } from "@/shared/components/form";
import { SLUG_PATTERN, toSlug } from "@/shared/utils";
import { createProjectAction, updateProjectAction } from "@/shared/_controllers/project/project.action";
import { type GalleryItem, GalleryUploader } from "./gallery-uploader";

// Figma 관리자 · 프로젝트 작성 / 수정. 본문 에디터는 이미지 기능을 숨기고, 이미지는 갤러리에서만 관리한다.
const MarkdownEditor = dynamic(() => import("@/shared/components/markdown-editor/markdown-editor"), {
  ssr: false,
  loading: () => <EditorPlaceholder />,
});

type Field = "title" | "slug" | "summary" | "startDate" | "endDate" | "githubUrl" | "demoUrl" | "skills" | "content";
type Errors = Partial<Record<Field, string>>;

const DATE_PATTERN = /^(\d{4})\.(\d{2})\.(\d{2})$/;

/** "2026.07.02" → "2026-07-02" (형식이 틀리면 null) */
function parseDate(text: string) {
  const match = DATE_PATTERN.exec(text.trim());
  if (!match) return null;
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

const toDotted = (iso: string | null) => (iso ? iso.replaceAll("-", ".") : "");
const isUrl = (text: string) => /^https?:\/\/\S+$/.test(text);

function toGalleryItems(project?: ProjectDetailResponse): GalleryItem[] {
  return (project?.images ?? []).map((image) => ({
    key: String(image.imageId),
    imageId: image.imageId,
    url: image.url,
    caption: image.caption ?? "",
    fileName: decodeURIComponent(image.url.split("/").pop() ?? `image-${image.imageId}`),
  }));
}

/** 401로 로그인이 끊겼을 때 보관하는 작성 중 내용 (갤러리는 올라간 이미지만) */
type ProjectDraft = {
  title: string;
  slug: string;
  slugTouched: boolean;
  summary: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
  githubUrl: string;
  repoPrivate: boolean;
  demoUrl: string;
  noSite: boolean;
  skillIds: number[];
  gallery: GalleryItem[];
  content: string;
};

// 보관된 초안이 있으면 그것을 폼의 초기값으로 쓴다(다시 로그인한 뒤 복원).
export function ProjectForm({ project }: { project?: ProjectDetailResponse }) {
  const draftKey = project ? `project:${project.projectId}` : "project:new";
  const { ready, draft } = useStoredDraft<ProjectDraft>(draftKey);
  if (!ready) return <AdminLoading />;
  return <ProjectFormBody project={project} draftKey={draftKey} draft={draft} />;
}

type ProjectFormBodyProps = { project?: ProjectDetailResponse; draftKey: string; draft: ProjectDraft | null };

function ProjectFormBody(props: ProjectFormBodyProps) {
  const { project, draftKey, draft } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(project);
  // 폼 값은 초안 보관 단위(ProjectDraft)와 같은 묶음 하나로 둔다. 초기값은 보관된 초안 → 저장된 프로젝트 순이고,
  // 슬러그만 저장된 값이 초안보다 먼저다(수정할 때는 슬러그를 바꿀 수 없다).
  const [form, setForm] = useState<ProjectDraft>(() => ({
    title: draft?.title ?? project?.title ?? "",
    slug: project?.slug ?? draft?.slug ?? "",
    slugTouched: draft?.slugTouched ?? isEdit,
    summary: draft?.summary ?? project?.summary ?? "",
    startDate: draft?.startDate ?? toDotted(project?.startDate ?? null),
    endDate: draft?.endDate ?? toDotted(project?.endDate ?? null),
    ongoing: draft?.ongoing ?? (project ? project.endDate === null : false),
    githubUrl: draft?.githubUrl ?? project?.githubUrl ?? "",
    repoPrivate: draft?.repoPrivate ?? project?.repoPrivate ?? false,
    demoUrl: draft?.demoUrl ?? project?.demoUrl ?? "",
    // 사이트 없음: 수정할 때는 저장된 주소가 없으면 체크된 채로 연다. 체크를 풀면 입력해 둔 주소가 돌아온다.
    noSite: draft?.noSite ?? (project ? project.demoUrl === null : false),
    skillIds: draft?.skillIds ?? project?.skills.map((skill) => skill.skillId) ?? [],
    gallery: draft?.gallery ?? toGalleryItems(project),
    content: draft?.content ?? project?.content ?? "",
  }));
  const { title, slug, slugTouched, summary, startDate, endDate, ongoing, githubUrl, repoPrivate, demoUrl, noSite } =
    form;
  const { skillIds, gallery, content } = form;
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(isEdit ? "available" : "idle");
  const setField = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  // 갤러리 업로드는 올라갈 때마다 이전 목록을 받아 고치므로(함수형 업데이트) 같은 모양으로 넘긴다.
  const setGallery: Dispatch<SetStateAction<GalleryItem[]>> = (next) =>
    setForm((current) => ({ ...current, gallery: typeof next === "function" ? next(current.gallery) : next }));
  // 올리는 중이던 이미지는 다시 올려야 하므로 빼고 보관한다.
  useSaveDraftOnExpire<ProjectDraft>(draftKey, { ...form, gallery: gallery.filter((item) => item.imageId !== null) });
  const [errors, setErrors] = useState<Errors>({});

  const save = useMutation({
    mutationFn: async (request: ProjectSaveRequest) =>
      unwrapApiResult(await (project ? updateProjectAction(project.projectId, request) : createProjectAction(request))),
    onSuccess: async () => {
      clearDraft(draftKey);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects.all }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.all }),
      ]);
      router.push("/admin/projects");
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) setSlugStatus("taken");
    },
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const start = parseDate(startDate);
    const end = ongoing ? null : parseDate(endDate);
    const next: Errors = {};
    if (!title.trim()) next.title = "제목을 입력해 주세요.";
    if (!slug) next.slug = "슬러그를 입력해 주세요.";
    else if (!SLUG_PATTERN.test(slug)) next.slug = "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.";
    if (!summary.trim()) next.summary = "요약을 입력해 주세요.";
    if (!start) next.startDate = "YYYY.MM.DD 형식으로 입력해 주세요.";
    if (!ongoing && !end) next.endDate = "종료일을 입력하거나 진행 중을 골라 주세요.";
    else if (start && end && end < start) next.endDate = "종료일이 시작일보다 빨라요.";
    if (!repoPrivate && githubUrl && !isUrl(githubUrl)) next.githubUrl = "https://로 시작하는 주소를 입력해 주세요.";
    if (!noSite && !demoUrl.trim()) next.demoUrl = "사이트 주소를 입력하거나 사이트 없음을 골라 주세요.";
    else if (!noSite && !isUrl(demoUrl.trim())) next.demoUrl = "https://로 시작하는 주소를 입력해 주세요.";
    if (skillIds.length === 0) next.skills = "기술 스택을 하나 이상 골라 주세요.";
    if (!content.trim()) next.content = "본문을 입력해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !start) return;
    if (gallery.some((item) => item.imageId === null)) return;

    if (!isEdit && slugStatus !== "available") {
      setSlugStatus("checking");
      // 401이면 만료 오버레이가 열리므로 "사용 중"으로 표시하지 않는다.
      const available = await checkSlug("project", slug).catch((error) =>
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
      startDate: start,
      endDate: end,
      // 비공개 레포는 주소를 공개하지 않으므로 저장하지 않는다(Figma: 비공개라 주소를 노출하지 않아요).
      githubUrl: repoPrivate ? null : githubUrl.trim() || null,
      // 사이트 없음이면 null로 저장하고, 공개 화면은 사이트 바로가기 버튼을 숨긴다.
      demoUrl: noSite ? null : demoUrl.trim(),
      repoPrivate,
      skillIds,
      images: gallery.flatMap((item) =>
        item.imageId === null ? [] : [{ imageId: item.imageId, url: item.url, caption: item.caption.trim() || null }],
      ),
    });
  }

  const uploading = gallery.some((item) => item.imageId === null);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <AdminPageHeader
        title={isEdit ? "프로젝트 수정" : "새 프로젝트"}
        back={{ href: "/admin/projects", label: "프로젝트 목록" }}
        actions={
          <>
            <ButtonCompact href="/admin/projects" className="h-11 px-4">
              취소
            </ButtonCompact>
            <Button type="submit" size="M" disabled={save.isPending || uploading || slugStatus === "checking"}>
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
        <Field label="제목" id="project-title" required error={errors.title}>
          <TextField
            id="project-title"
            value={title}
            invalid={Boolean(errors.title)}
            placeholder="프로젝트 제목"
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
        </Field>
        <SlugField
          type="project"
          value={slug}
          onChange={(value) => setForm((current) => ({ ...current, slug: value, slugTouched: true }))}
          status={slugStatus}
          onStatusChange={setSlugStatus}
          locked={isEdit}
          error={errors.slug}
        />
        <Field label="요약" id="project-summary" required error={errors.summary}>
          <Textarea
            id="project-summary"
            value={summary}
            invalid={Boolean(errors.summary)}
            placeholder="카드와 목록에 보이는 요약 문장"
            onChange={(event) => setField("summary", event.target.value)}
            className="min-h-[98px]"
          />
        </Field>
        <div className="grid grid-cols-2 gap-x-4 gap-y-[22px]">
          <Field label="시작일" id="project-start" required error={errors.startDate}>
            <TextField
              id="project-start"
              value={startDate}
              invalid={Boolean(errors.startDate)}
              placeholder="YYYY.MM.DD"
              inputMode="numeric"
              onChange={(event) => setField("startDate", event.target.value)}
            />
          </Field>
          <Field label="종료일" id="project-end" error={errors.endDate}>
            <TextField
              id="project-end"
              value={ongoing ? "" : endDate}
              disabled={ongoing}
              invalid={Boolean(errors.endDate)}
              placeholder={ongoing ? "진행 중이면 비워 둬요" : "YYYY.MM.DD"}
              inputMode="numeric"
              onChange={(event) => setField("endDate", event.target.value)}
            />
            <Checkbox checked={ongoing} onChange={(event) => setField("ongoing", event.target.checked)}>
              진행 중 (종료일 없음)
            </Checkbox>
          </Field>
          <Field label="GitHub 주소" id="project-github" error={errors.githubUrl}>
            <TextField
              id="project-github"
              type="url"
              value={repoPrivate ? "" : githubUrl}
              disabled={repoPrivate}
              invalid={Boolean(errors.githubUrl)}
              placeholder={repoPrivate ? "비공개라 주소를 노출하지 않아요" : "https://github.com/..."}
              onChange={(event) => setField("githubUrl", event.target.value)}
            />
            <Checkbox checked={repoPrivate} onChange={(event) => setField("repoPrivate", event.target.checked)}>
              비공개 레포지토리
            </Checkbox>
          </Field>
          <Field label="사이트 주소" id="project-demo" error={errors.demoUrl}>
            <TextField
              id="project-demo"
              type="url"
              value={noSite ? "" : demoUrl}
              disabled={noSite}
              invalid={Boolean(errors.demoUrl)}
              placeholder={noSite ? "사이트가 없는 프로젝트예요" : "https://..."}
              onChange={(event) => setField("demoUrl", event.target.value)}
            />
            <Checkbox checked={noSite} onChange={(event) => setField("noSite", event.target.checked)}>
              사이트 없음
            </Checkbox>
          </Field>
        </div>
      </AdminPanel>

      <SkillPicker
        value={skillIds}
        onChange={(ids) => setField("skillIds", ids)}
        error={errors.skills}
        help="눌러서 선택하거나 해제해요. 선택한 기술은 카드·상세 상단 태그로 보여요. 목록에 없는 기술은 [기술 스택] 메뉴에서 추가해요."
      />

      <GalleryUploader value={gallery} onChange={setGallery} />

      <div className="flex flex-col gap-2.5">
        <MarkdownEditor
          value={content}
          onChange={(markdown) => setField("content", markdown)}
          kind="project"
          invalid={Boolean(errors.content)}
        />
        {errors.content && <FormMessage status="error">{errors.content}</FormMessage>}
      </div>
    </form>
  );
}

type FieldProps = { label: string; id: string; required?: boolean; error?: string; children: ReactNode };

function Field(props: FieldProps) {
  const { label, id, required, error, children } = props;
  return (
    <div className="flex flex-col gap-2">
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>
      {children}
      {error && <FormMessage status="error">{error}</FormMessage>}
    </div>
  );
}
