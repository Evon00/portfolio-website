"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/shared/utils";
import { Button } from "./button";
import { ButtonCompact } from "./button-compact";
import { AlertDanger } from "./form";
import { PaperAsset } from "@/shared/components/paper/paper-asset";

// Figma Components › Modal. 딤(content/01 35~42%) + 가운데 카드, Dissolve 200ms.
// 네이티브 <dialog>로 포커스 가두기·Esc 닫기를 브라우저에 맡긴다.
type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 바깥(딤) 클릭으로 닫을지. 401 만료 모달은 닫히면 안 된다. */
  dismissible?: boolean;
  labelledBy?: string;
  className?: string;
};

export function Modal(props: ModalProps) {
  const { open, onClose, children, dismissible = true, labelledBy, className } = props;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto overflow-visible bg-transparent p-0 opacity-0 transition-[opacity,display,overlay] transition-discrete duration-(--duration-fade) open:opacity-100 starting:open:opacity-0",
        "backdrop:bg-content-01/40 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-(--duration-fade) open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
        className,
      )}
    >
      {children}
    </dialog>
  );
}

// Modal Type=Delete. 420px, 제목(Title/3) + 설명 + 취소·삭제(Compact).
type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  pending?: boolean;
  /** 실행 실패 메시지 (Alert / Danger) */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, description, confirmLabel = "삭제", pending, error, onConfirm, onCancel } = props;
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-dialog-title">
      <div className="flex w-[420px] max-w-[calc(100vw-32px)] flex-col gap-3.5 rounded-pill border-[1.5px] border-line-01 bg-background-01 p-7">
        <h2 id="confirm-dialog-title" className="font-display text-title-3 text-content-01">
          {title}
        </h2>
        <p className="text-body-m text-content-02">{description}</p>
        {error && <AlertDanger>{error}</AlertDanger>}
        <div className="flex justify-end gap-2 pt-1.5">
          <ButtonCompact onClick={onCancel}>취소</ButtonCompact>
          <ButtonCompact variant="danger" onClick={onConfirm} disabled={pending}>
            {confirmLabel}
          </ButtonCompact>
        </div>
      </div>
    </Modal>
  );
}

// Modal Type=SessionExpired. 440px, 위에 걸친 캐릭터 + 다시 로그인(Primary L) + 사이트로 돌아가기.
type SessionExpiredDialogProps = {
  open: boolean;
  onRelogin: () => void;
  onLeave: () => void;
};

export function SessionExpiredDialog(props: SessionExpiredDialogProps) {
  const { open, onRelogin, onLeave } = props;
  return (
    <Modal open={open} onClose={() => undefined} dismissible={false} labelledBy="session-expired-title">
      <div className="relative flex w-[440px] max-w-[calc(100vw-32px)] flex-col items-center rounded-pill border-[1.5px] border-line-01 bg-background-01 px-[37px] pt-[39px] pb-[29px] text-center shadow-panel">
        <PaperAsset name="blob-blue-sleepy" className="-top-[97.5px] left-1/2 h-[123.3px] w-[180px] -translate-x-1/2" />
        <p className="font-mono text-mono-m text-content-03">401 Unauthorized · 인증 만료</p>
        <h2 id="session-expired-title" className="mt-3 font-display text-title-3 text-content-01">
          로그인이 만료됐어요
        </h2>
        <p className="mt-2.5 text-body-m text-content-02">
          보안을 위해 일정 시간이 지나면 로그아웃돼요.
          <br />
          다시 로그인한 뒤 이어서 작업해 주세요.
        </p>
        <Button onClick={onRelogin} className="mt-[22px] w-full">
          다시 로그인
        </Button>
        {/* Figma "사이트로 돌아가기"는 Outline이 아닌 line-02 테두리 · content-02 글자의 별도 버튼이다. */}
        <button
          type="button"
          onClick={onLeave}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-pill border border-line-02 bg-background-01 text-label-l text-content-02 transition-colors hover:bg-primary-subtle"
        >
          사이트로 돌아가기
        </button>
      </div>
    </Modal>
  );
}
