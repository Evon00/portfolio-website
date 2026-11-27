"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useRef, useState } from "react";
import { useImageUpload } from "@/shared/libs/upload/use-image-upload";
import { unwrapApiResult } from "@/shared/libs/api";
import type { SkillResponse } from "@/shared/_generated";
import { CATEGORY_LABEL, type SkillCategory } from "@/shared/_controllers/skill";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { AlertDanger, FormLabel, FormMessage, Select, TextField } from "@/shared/components/form";
import { Icon } from "@/shared/components/icon";
import { Modal } from "@/shared/components/modal";
import { SkillLogo } from "@/shared/components/skill";
import { createSkillAction, updateSkillAction } from "@/shared/_controllers/skill/skill.action";

// Figma 오버레이 · 기술 스택 추가 + Upload / Icon Tile. 수정도 같은 창을 쓴다.
// 카테고리는 Category Tag 5종 중에서 고른다. 아이콘은 없어도 된다(없으면 화면에 이름만 보인다).
const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as SkillCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

type SkillDialogProps = { open: boolean; skill?: SkillResponse; onClose: () => void };

export function SkillDialog(props: SkillDialogProps) {
  const { open, skill, onClose } = props;
  return (
    <Modal open={open} onClose={onClose} labelledBy="skill-dialog-title">
      {open && <SkillForm key={skill?.skillId ?? "new"} skill={skill} onClose={onClose} />}
    </Modal>
  );
}

function SkillForm({ skill, onClose }: Omit<SkillDialogProps, "open">) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(skill?.name ?? "");
  const [category, setCategory] = useState<SkillCategory>(skill?.category ?? "BACKEND");
  const [icon, setIcon] = useState<{ imageId: number | null; url: string } | null>(
    skill?.iconUrl ? { imageId: null, url: skill.iconUrl } : null,
  );
  const iconUpload = useImageUpload("skill", "아이콘을 올리지 못했어요.");
  const [nameError, setNameError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const request = { name: name.trim(), category, iconImageId: icon?.imageId ?? null, iconUrl: icon?.url ?? null };
      return unwrapApiResult(await (skill ? updateSkillAction(skill.skillId, request) : createSkillAction(request)));
    },
    onSuccess: async () => {
      // 기술 이름·아이콘은 게시글·프로젝트·프로필·대시보드에도 보인다.
      await queryClient.invalidateQueries();
      onClose();
    },
  });

  async function pickIcon(file: File) {
    iconUpload.clearError();
    const uploaded = await iconUpload.upload(file);
    if (uploaded) setIcon({ imageId: uploaded.imageId, url: uploaded.url });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setNameError("이름을 입력해 주세요.");
    setNameError(null);
    save.mutate();
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex w-[420px] max-w-[calc(100vw-32px)] flex-col gap-[18px] rounded-pill border-[1.5px] border-line-01 bg-background-01 p-6"
    >
      <div className="flex items-center justify-between">
        <h2 id="skill-dialog-title" className="font-display text-title-3 text-content-01">
          {skill ? "기술 스택 수정" : "기술 스택 추가"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex size-8 items-center justify-center rounded-lg text-primary-strong hover:bg-primary-subtle"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <FormLabel>아이콘</FormLabel>
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="relative flex size-24 items-center justify-center rounded-xl border border-line-02 bg-background-01">
              <span className="flex size-12 items-center justify-center rounded-lg bg-background-05 text-primary-strong">
                <SkillLogo iconUrl={icon.url} size={28} />
              </span>
              <button
                type="button"
                onClick={() => setIcon(null)}
                aria-label="아이콘 지우기"
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-xl border border-line-02 bg-background-01 text-primary-strong"
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={iconUpload.uploading}
              className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-xl bg-background-04 disabled:opacity-60"
            >
              <span className="flex size-7 items-center justify-center rounded-xl bg-content-02 text-content-inverse">
                <Icon name="plus" size={14} />
              </span>
              <span className="text-[11px] leading-4 text-content-03">
                {iconUpload.uploading ? "올리는 중…" : "아이콘 추가"}
              </span>
            </button>
          )}
          <p className="text-caption text-content-03">
            1:1 정사각형 권장
            <br />
            PNG, JPG, GIF, SVG, WebP
            <br />
            장당 10MB 이하 · 없으면 이름만 보여요
          </p>
        </div>
        {iconUpload.error && <FormMessage status="error">{iconUpload.error}</FormMessage>}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void pickIcon(file);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <FormLabel htmlFor="skill-name" required>
          이름
        </FormLabel>
        <TextField
          id="skill-name"
          value={name}
          invalid={Boolean(nameError)}
          placeholder="예: Spring Boot"
          onChange={(event) => setName(event.target.value)}
        />
        {nameError && <FormMessage status="error">{nameError}</FormMessage>}
      </div>

      <div className="flex flex-col gap-2">
        <FormLabel required>카테고리</FormLabel>
        <Select
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
          label="카테고리"
          className="w-full"
        />
      </div>

      {save.error && <AlertDanger>{save.error.message}</AlertDanger>}
      <div className="flex justify-end gap-2">
        <ButtonCompact onClick={onClose} className="h-11 px-4">
          취소
        </ButtonCompact>
        <Button type="submit" size="M" disabled={save.isPending || iconUpload.uploading}>
          {skill ? "저장하기" : "추가하기"}
        </Button>
      </div>
    </form>
  );
}
