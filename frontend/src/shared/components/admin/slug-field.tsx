"use client";

import { useState } from "react";
import { adminFetch } from "@/shared/libs/api";
import type { SlugCheckResponse } from "@/shared/_generated";
import { SLUG_PATTERN } from "@/shared/utils";
import { Button } from "@/shared/components/button";
import { FormLabel, FormMessage, TextField } from "@/shared/components/form";

// Figma 게시글·프로젝트 작성 › 슬러그: 앞 문구(/blog/ · /projects/) + 중복 확인. 수정 화면에서는 바꿀 수 없다.
export type SlugStatus = "idle" | "checking" | "available" | "taken";

type SlugFieldProps = {
  type: "post" | "project";
  value: string;
  onChange: (value: string) => void;
  status: SlugStatus;
  onStatusChange: (status: SlugStatus) => void;
  /** 수정 화면: 고정 */
  locked?: boolean;
  error?: string;
};

export async function checkSlug(type: "post" | "project", slug: string) {
  const { available } = await adminFetch<SlugCheckResponse>(
    `/api/admin/slug-check?type=${type}&slug=${encodeURIComponent(slug)}`,
  );
  return available;
}

export function SlugField(props: SlugFieldProps) {
  const { type, value, onChange, status, onStatusChange, locked, error } = props;
  const [checkError, setCheckError] = useState<string | null>(null);
  const prefix = type === "post" ? "/blog/" : "/projects/";
  const formatError = value && !SLUG_PATTERN.test(value) ? "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요." : null;
  const message = error ?? formatError ?? checkError;

  async function check() {
    if (!value || formatError) return;
    setCheckError(null);
    onStatusChange("checking");
    try {
      onStatusChange((await checkSlug(type, value)) ? "available" : "taken");
    } catch (failure) {
      onStatusChange("idle");
      setCheckError(failure instanceof Error ? failure.message : "중복 확인을 하지 못했어요.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <FormLabel htmlFor={`${type}-slug`} required>
        슬러그
      </FormLabel>
      <div className="flex gap-2.5">
        <TextField
          id={`${type}-slug`}
          prefix={prefix}
          value={value}
          disabled={locked}
          invalid={Boolean(message) || status === "taken"}
          placeholder="slug"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            onChange(event.target.value.toLowerCase());
            onStatusChange("idle");
          }}
          className="font-mono text-mono-l"
        />
        {!locked && (
          <Button
            variant="outline"
            size="M"
            onClick={check}
            disabled={!value || Boolean(formatError) || status === "checking"}
            className="shrink-0"
          >
            중복 확인
          </Button>
        )}
      </div>
      {locked ? (
        <FormMessage status="help">등록한 뒤에는 슬러그를 바꿀 수 없어요.</FormMessage>
      ) : message ? (
        <FormMessage status="error">{message}</FormMessage>
      ) : status === "available" ? (
        <FormMessage status="success">사용할 수 있는 슬러그예요.</FormMessage>
      ) : status === "taken" ? (
        <FormMessage status="error">이미 쓰고 있는 슬러그예요.</FormMessage>
      ) : (
        type === "project" && <FormMessage status="help">등록한 뒤에는 슬러그를 바꿀 수 없어요.</FormMessage>
      )}
    </div>
  );
}
