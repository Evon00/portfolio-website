"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useState } from "react";
import { clearDraft, useSaveDraftOnExpire, useStoredDraft } from "@/features/auth/hooks/use-session-draft";
import { SkillPicker } from "@/features/skill/ui/skill-picker";
import { adminQueryKeys, isApiError, unwrapApiResult } from "@/shared/libs/api";
import type { CreateProjectRequestDto, UpdateProjectRequestDto } from "@/shared/_generated";
import type { ProjectEditView } from "@/shared/_controllers/project";
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
// 저장은 multipart다: data(JSON) + files(새 이미지). 수정은 Spring PATCH 방식대로 바뀐 필드만 보내고, 바뀐 게 없으면 요청하지 않는다.
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

// Spring 검증과 같은 한도
const MAX_LENGTH = { title: 100, summary: 200, url: 300 } as const;
const MAX_SKILLS = 20;

function toGalleryItems(project?: ProjectEditView): GalleryItem[] {
  return (project?.images ?? []).map((image) => ({
    key: String(image.id),
    mediaId: image.id,
    url: image.url,
    caption: image.caption ?? "",
    fileName: image.fileName,
  }));
}

/** 저장할 값. 빈 주소·종료일은 ""(없음)로 다룬다. */
type ProjectValues = {
  title: string;
  summary: string;
  content: string;
  startDate: string;
  endDate: string;
  githubUrl: string;
  repoPrivate: boolean;
  demoUrl: string;
  skillIds: number[];
  gallery: GalleryItem[];
};

/** 갤러리 → Spring projectMedias + files. 저장된 이미지는 id로, 새 이미지는 files 순서(fileIndex)로 가리킨다. 첫 장이 대표. */
function toProjectMedias(gallery: GalleryItem[]) {
  const files: File[] = [];
  const medias = gallery.map((item, index) => {
    const meta = { projectMediaCaption: item.caption.trim() || undefined, projectMediaIsImportant: index === 0 };
    if (item.mediaId !== null) return { projectMediaId: item.mediaId, ...meta };
    if (item.file) files.push(item.file);
    return { fileIndex: files.length - 1, ...meta };
  });
  return { medias, files };
}

/** 갤러리가 바뀌었는지 비교하는 값(이미지와 순서, 설명) */
const galleryKey = (gallery: GalleryItem[]) =>
  JSON.stringify(gallery.map((item) => [item.mediaId ?? item.key, item.caption.trim()]));

/** 불러온 프로젝트와 비교해 바뀐 필드만 모은다(Spring PATCH: 보내지 않은 필드는 기존 값 유지, ""는 지움). */
function toProjectChanges(project: ProjectEditView, values: ProjectValues) {
  const changes: UpdateProjectRequestDto = {};
  if (values.title !== project.title) changes.projectTitle = values.title;
  if (values.summary !== project.summary) changes.projectSummary = values.summary;
  if (values.content !== project.content) changes.projectContent = values.content;
  if (values.startDate !== project.startDate) changes.projectStartDate = values.startDate;
  if (values.endDate !== (project.endDate ?? "")) changes.projectEndDate = values.endDate;
  if (values.githubUrl !== (project.githubUrl ?? "")) changes.projectGithubUrl = values.githubUrl;
  if (values.repoPrivate !== project.repoPrivate) changes.projectGithubIsPublic = !values.repoPrivate;
  if (values.demoUrl !== (project.demoUrl ?? "")) changes.projectUrl = values.demoUrl;
  if (values.skillIds.join() !== project.skillIds.join()) changes.skillIds = values.skillIds;
  let files: File[] = [];
  if (galleryKey(values.gallery) !== galleryKey(toGalleryItems(project))) {
    const media = toProjectMedias(values.gallery);
    changes.projectMedias = media.medias;
    files = media.files;
  }
  return { changes, files };
}

/** 등록 요청. 갤러리는 모두 새 이미지다. */
function toCreateRequest(slug: string, values: ProjectValues) {
  const files = values.gallery.flatMap((item) => (item.file ? [item.file] : []));
  const data: CreateProjectRequestDto = {
    projectTitle: values.title,
    projectSlug: slug,
    projectSummary: values.summary,
    projectContent: values.content,
    projectStartDate: values.startDate,
    projectEndDate: values.endDate || undefined,
    projectGithubUrl: values.githubUrl || undefined,
    projectGithubIsPublic: !values.repoPrivate,
    projectUrl: values.demoUrl || undefined,
    skillIds: values.skillIds,
    projectMedias: files.map((_, index) => ({
      fileIndex: index,
      projectMediaCaption: values.gallery[index].caption.trim() || undefined,
      projectMediaIsImportant: index === 0,
    })),
  };
  return { data, files };
}

/** 서버 액션으로 넘기는 본문: data(JSON 문자열) + files */
function toFormData(data: object, files: File[]) {
  const form = new FormData();
  form.append("data", JSON.stringify(data));
  for (const file of files) form.append("files", file);
  return form;
}

/** 401로 로그인이 끊겼을 때 보관하는 작성 중 내용 (갤러리는 저장된 이미지만) */
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
export function ProjectForm({ project }: { project?: ProjectEditView }) {
  const draftKey = project ? `project:${project.projectId}` : "project:new";
  const { ready, draft } = useStoredDraft<ProjectDraft>(draftKey);
  if (!ready) return <AdminLoading />;
  return <ProjectFormBody project={project} draftKey={draftKey} draft={draft} />;
}

type ProjectFormBodyProps = { project?: ProjectEditView; draftKey: string; draft: ProjectDraft | null };

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
    skillIds: draft?.skillIds ?? project?.skillIds ?? [],
    gallery: draft?.gallery ?? toGalleryItems(project),
    content: draft?.content ?? project?.content ?? "",
  }));
  const { title, slug, slugTouched, summary, startDate, endDate, ongoing, githubUrl, repoPrivate, demoUrl, noSite } =
    form;
  const { skillIds, gallery, content } = form;
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(isEdit ? "available" : "idle");
  const setField = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  // 갤러리는 이미지 변환이 끝날 때 이전 목록을 받아 고치므로(함수형 업데이트) 같은 모양으로 넘긴다.
  const setGallery: Dispatch<SetStateAction<GalleryItem[]>> = (next) =>
    setForm((current) => ({ ...current, gallery: typeof next === "function" ? next(current.gallery) : next }));
  // 새로 고른 이미지(파일)는 보관할 수 없어 빼고, 저장된 이미지만 보관한다.
  useSaveDraftOnExpire<ProjectDraft>(draftKey, { ...form, gallery: gallery.filter((item) => item.mediaId !== null) });
  const [errors, setErrors] = useState<Errors>({});

  const save = useMutation({
    mutationFn: async (values: ProjectValues) => {
      if (project) {
        const { changes, files } = toProjectChanges(project, values);
        if (Object.keys(changes).length === 0) return;
        unwrapApiResult(await updateProjectAction(project.projectId, toFormData(changes, files)));
        return;
      }
      const { data, files } = toCreateRequest(slug, values);
      unwrapApiResult(await createProjectAction(toFormData(data, files)));
    },
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
    else if (title.trim().length > MAX_LENGTH.title) next.title = `제목은 ${MAX_LENGTH.title}자까지 쓸 수 있어요.`;
    if (!slug) next.slug = "슬러그를 입력해 주세요.";
    else if (!SLUG_PATTERN.test(slug)) next.slug = "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.";
    if (!summary.trim()) next.summary = "요약을 입력해 주세요.";
    else if (summary.trim().length > MAX_LENGTH.summary)
      next.summary = `요약은 ${MAX_LENGTH.summary}자까지 쓸 수 있어요.`;
    if (!start) next.startDate = "YYYY.MM.DD 형식으로 입력해 주세요.";
    if (!ongoing && !end) next.endDate = "종료일을 입력하거나 진행 중을 골라 주세요.";
    else if (start && end && end < start) next.endDate = "종료일이 시작일보다 빨라요.";
    if (!repoPrivate && githubUrl.trim() && !isUrl(githubUrl.trim()))
      next.githubUrl = "https://로 시작하는 주소를 입력해 주세요.";
    else if (!repoPrivate && githubUrl.trim().length > MAX_LENGTH.url)
      next.githubUrl = `GitHub 주소는 ${MAX_LENGTH.url}자까지 쓸 수 있어요.`;
    if (!noSite && !demoUrl.trim()) next.demoUrl = "사이트 주소를 입력하거나 사이트 없음을 골라 주세요.";
    else if (!noSite && !isUrl(demoUrl.trim())) next.demoUrl = "https://로 시작하는 주소를 입력해 주세요.";
    else if (!noSite && demoUrl.trim().length > MAX_LENGTH.url)
      next.demoUrl = `사이트 주소는 ${MAX_LENGTH.url}자까지 쓸 수 있어요.`;
    if (skillIds.length === 0) next.skills = "기술 스택을 하나 이상 골라 주세요.";
    else if (skillIds.length > MAX_SKILLS) next.skills = `기술 스택은 ${MAX_SKILLS}개까지 고를 수 있어요.`;
    if (!content.trim()) next.content = "본문을 입력해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !start) return;

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
      summary: summary.trim(),
      content,
      startDate: start,
      endDate: end ?? "",
      // 비공개 레포는 주소를 공개하지 않으므로 저장하지 않는다(Figma: 비공개라 주소를 노출하지 않아요).
      githubUrl: repoPrivate ? "" : githubUrl.trim(),
      repoPrivate,
      // 사이트 없음이면 주소를 저장하지 않고, 공개 화면은 사이트 바로가기 버튼을 숨긴다.
      demoUrl: noSite ? "" : demoUrl.trim(),
      skillIds,
      gallery,
    });
  }

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
