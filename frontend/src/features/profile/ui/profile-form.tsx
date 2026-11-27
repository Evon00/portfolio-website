"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { useImageUpload } from "@/shared/libs/upload/use-image-upload";
import { adminQueryKeys, unwrapApiResult } from "@/shared/libs/api";
import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { AdminPanel, PanelHeader } from "@/shared/components/admin/panel";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { Button } from "@/shared/components/button";
import { AlertDanger, FormLabel, FormMessage, Textarea, TextField } from "@/shared/components/form";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import {
  type ProfileChanges,
  updateProfileAction,
  updateProfileSkillsAction,
} from "@/shared/_controllers/profile/profile.action";
import { type ProfileView, useProfileQuery } from "@/shared/_controllers/profile";
import { CoreSkillEditor } from "./core-skill-editor";

// Figma 관리자 · 프로필. 저장하면 메인 히어로·푸터(profile 태그)를 다시 만든다.
// 저장은 Spring PATCH 방식이다: 불러온 값과 비교해 바뀐 필드만 보내고, 바뀐 게 없으면 요청하지 않는다.
export function ProfileEditor() {
  const { data, isPending, isError, refetch } = useProfileQuery();
  if (isPending) {
    return (
      <>
        <AdminPageHeader title="프로필" />
        <AdminLoading />
      </>
    );
  }
  if (isError) {
    return (
      <>
        <AdminPageHeader title="프로필" />
        <AdminLoadError onRetry={() => refetch()} />
      </>
    );
  }
  return <ProfileForm profile={data} />;
}

type Errors = Partial<Record<"name" | "intro" | "githubUrl" | "email", string>>;
// GitHub · 이메일은 입력칸이라 빈 값을 ""로 다룬다(비우고 저장하면 Spring에 ""를 보내 값을 지운다).
type ProfileFormValues = Omit<ProfileView, "githubUrl" | "email"> & { githubUrl: string; email: string };

// Spring 검증과 같은 한도
const MAX_LENGTH = { name: 10, intro: 200, githubUrl: 300, email: 300 } as const;
const MAX_CORE_SKILLS = 20;

/** 불러온 프로필과 비교해 바뀐 필드만 모은다(Spring PATCH: 보내지 않은 필드는 기존 값 유지). */
function toProfileChanges(profile: ProfileView, values: ProfileFormValues): ProfileChanges {
  const next = {
    name: values.name.trim(),
    // 줄바꿈은 메인 소개글에서 그대로 쓰이므로 \r\n·\r을 \n으로 맞추고 앞뒤 공백만 지운다.
    intro: values.intro.replace(/\r\n?/g, "\n").trim(),
    githubUrl: values.githubUrl.trim(),
    email: values.email.trim(),
  };
  const changes: ProfileChanges = {};
  if (next.name !== profile.name) changes.name = next.name;
  if (next.intro !== profile.intro) changes.intro = next.intro;
  if (next.githubUrl !== (profile.githubUrl ?? "")) changes.githubUrl = next.githubUrl;
  if (next.email !== (profile.email ?? "")) changes.email = next.email;
  return changes;
}

function ProfileForm({ profile }: { profile: ProfileView }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileFormValues>(() => ({
    name: profile.name,
    intro: profile.intro,
    githubUrl: profile.githubUrl ?? "",
    email: profile.email ?? "",
    avatarUrl: profile.avatarUrl,
    coreSkills: profile.coreSkills,
  }));
  const { name, intro, githubUrl, email, avatarUrl, coreSkills } = form;
  const setField = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const avatarUpload = useImageUpload("profile");
  const [errors, setErrors] = useState<Errors>({});

  const save = useMutation({
    // 기본 정보(PATCH)와 핵심 기술 스택(PUT, 전체 교체)은 API가 따로다. 바뀐 쪽만 차례로 보낸다.
    mutationFn: async () => {
      const changes = toProfileChanges(profile, form);
      const skillIds = coreSkills.map((skill) => skill.skillId);
      const skillsChanged = skillIds.join() !== profile.coreSkills.map((skill) => skill.skillId).join();
      const profileChanged = Object.keys(changes).length > 0;
      if (!profileChanged && !skillsChanged) return false;
      if (skillIds.length > MAX_CORE_SKILLS) {
        throw new Error(`핵심 기술 스택은 ${MAX_CORE_SKILLS}개까지 고를 수 있어요.`);
      }
      const update = (patch: Partial<ProfileView>) =>
        queryClient.setQueryData<ProfileView>(adminQueryKeys.profile.all, (current) =>
          current ? { ...current, ...patch } : current,
        );
      if (profileChanged) update(unwrapApiResult(await updateProfileAction(changes)));
      if (skillsChanged) update({ coreSkills: unwrapApiResult(await updateProfileSkillsAction(skillIds)) });
      return true;
    },
  });

  async function pickAvatar(file: File) {
    avatarUpload.clearError();
    const uploaded = await avatarUpload.upload(file);
    if (uploaded) setField("avatarUrl", uploaded.url);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "이름을 입력해 주세요.";
    else if (name.trim().length > MAX_LENGTH.name) next.name = `이름은 ${MAX_LENGTH.name}자까지 쓸 수 있어요.`;
    if (!intro.trim()) next.intro = "소개 문구를 입력해 주세요.";
    else if (intro.trim().length > MAX_LENGTH.intro) next.intro = `소개 문구는 ${MAX_LENGTH.intro}자까지 쓸 수 있어요.`;
    if (githubUrl.trim() && !/^https:\/\/\S+$/.test(githubUrl.trim()))
      next.githubUrl = "https://로 시작하는 주소를 입력해 주세요.";
    else if (githubUrl.trim().length > MAX_LENGTH.githubUrl)
      next.githubUrl = `GitHub 주소는 ${MAX_LENGTH.githubUrl}자까지 쓸 수 있어요.`;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "이메일 형식을 확인해 주세요.";
    else if (email.trim().length > MAX_LENGTH.email) next.email = `이메일은 ${MAX_LENGTH.email}자까지 쓸 수 있어요.`;
    setErrors(next);
    if (Object.keys(next).length === 0) save.mutate();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <AdminPageHeader
        title="프로필"
        actions={
          <>
            <Button href="/" external variant="outline" size="M">
              메인에서 보기
            </Button>
            <Button type="submit" size="M" disabled={save.isPending || avatarUpload.uploading}>
              저장하기
            </Button>
          </>
        }
      />
      {save.error && <AlertDanger>{save.error.message}</AlertDanger>}
      {save.isSuccess && !save.isPending && (
        <FormMessage status={save.data ? "success" : "help"}>
          {save.data ? "저장했어요. 메인 화면에 바로 반영돼요." : "바뀐 내용이 없어요."}
        </FormMessage>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <AdminPanel className="flex flex-col gap-5">
          <PanelHeader title="기본 정보" />
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-primary-light">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- 업로드 직후 미리보기(blob:)라 next/image를 쓰지 않는다
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <PaperAsset
                  name="blob-lavender-sleepy"
                  className="-bottom-1 left-1/2 h-[42px] w-[66px] -translate-x-1/2"
                />
              )}
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <Button
                variant="outline"
                size="M"
                onClick={() => fileRef.current?.click()}
                disabled={avatarUpload.uploading}
              >
                {avatarUpload.uploading ? "올리는 중…" : "프로필 이미지 변경"}
              </Button>
              <FormMessage status="help">지금 메인 화면에서는 쓰이지 않아요.</FormMessage>
              {avatarUpload.error && <FormMessage status="error">{avatarUpload.error}</FormMessage>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void pickAvatar(file);
              }}
            />
          </div>
          <Field id="profile-name" label="이름" required help="메인 히어로의 큰 제목으로 보여요." error={errors.name}>
            <TextField
              id="profile-name"
              value={name}
              invalid={Boolean(errors.name)}
              onChange={(e) => setField("name", e.target.value)}
            />
          </Field>
          <Field
            id="profile-intro"
            label="소개 문구"
            required
            help="메인 히어로의 이름 아래에 보여요. 엔터로 줄을 바꾸면 메인에서도 그 자리에서 줄이 바뀌어요."
            error={errors.intro}
          >
            <Textarea
              id="profile-intro"
              value={intro}
              invalid={Boolean(errors.intro)}
              onChange={(e) => setField("intro", e.target.value)}
              className="min-h-[92px]"
            />
          </Field>
          <Field id="profile-github" label="GitHub 주소" error={errors.githubUrl}>
            <TextField
              id="profile-github"
              type="url"
              value={githubUrl}
              invalid={Boolean(errors.githubUrl)}
              placeholder="https://github.com/..."
              onChange={(e) => setField("githubUrl", e.target.value)}
            />
          </Field>
          <Field id="profile-email" label="이메일" error={errors.email}>
            <TextField
              id="profile-email"
              type="email"
              value={email}
              invalid={Boolean(errors.email)}
              placeholder="hello@..."
              onChange={(e) => setField("email", e.target.value)}
            />
          </Field>
        </AdminPanel>
        <CoreSkillEditor value={coreSkills} onChange={(skills) => setField("coreSkills", skills)} />
      </div>
    </form>
  );
}

type FieldProps = { id: string; label: string; required?: boolean; help?: string; error?: string; children: ReactNode };

function Field(props: FieldProps) {
  const { id, label, required, help, error, children } = props;
  return (
    <div className="flex flex-col gap-2">
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>
      {children}
      {error ? (
        <FormMessage status="error">{error}</FormMessage>
      ) : (
        help && <FormMessage status="help">{help}</FormMessage>
      )}
    </div>
  );
}
