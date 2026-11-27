"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type ApiResult, unwrapApiResult } from "@/shared/libs/api";
import { ConfirmDialog } from "@/shared/components/modal";

// Figma 오버레이 · 게시글 삭제 확인. 표의 삭제 버튼 → 확인 → 서버 액션 → 목록 다시 조회.
type DeleteTarget = { id: number; title: string };

type UseDeleteDialogOptions = {
  /** "게시글" · "프로젝트" · "기술 스택" */
  noun: string;
  action: (id: number) => Promise<ApiResult<unknown>>;
  /** 성공 뒤 다시 조회할 쿼리 키들 */
  invalidate: readonly (readonly unknown[])[];
};

export function useDeleteDialog({ noun, action, invalidate }: UseDeleteDialogOptions) {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const mutation = useMutation({
    mutationFn: async (id: number) => unwrapApiResult(await action(id)),
    onSuccess: async () => {
      setTarget(null);
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });

  const close = () => {
    setTarget(null);
    mutation.reset();
  };

  const dialog = (
    <ConfirmDialog
      open={target !== null}
      title={`${noun}${hasBatchim(noun) ? "을" : "를"} 삭제할까요?`}
      description={`"${target?.title ?? ""}"은(는) 삭제하면 되돌릴 수 없어요.`}
      pending={mutation.isPending}
      error={mutation.error?.message}
      onConfirm={() => target && mutation.mutate(target.id)}
      onCancel={close}
    />
  );

  return { open: setTarget, dialog };
}

/** 마지막 글자에 받침이 있는지 (을/를 고르기) */
function hasBatchim(word: string) {
  const code = (word.at(-1) ?? "").charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}
