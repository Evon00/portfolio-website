"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminQueryKeys, unwrapApiResult } from "@/shared/libs/api";
import type { ProjectSummaryResponse } from "@/shared/_controllers/_legacy-types";
import { useReorder } from "@/shared/hooks";
import { OrderItem } from "@/shared/components/admin/order-item";
import { StarToggle } from "@/shared/components/admin/star-toggle";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { AlertDanger } from "@/shared/components/form";
import { Modal } from "@/shared/components/modal";
import { updateProjectOrderAction } from "@/shared/_controllers/project/project.action";

// 프로젝트 노출 순서(displayOrder) · 메인 주요 프로젝트(★) 정하기. Figma Order Item(Featured) + Star Toggle.
// Figma에 이 화면 시안이 없어 Modal 카드에 Order Item 목록을 담았다. 목록 페이지·메인 캐러셀이 이 순서를 따른다.
type Row = { projectId: number; title: string; featured: boolean };

type ProjectOrderDialogProps = { open: boolean; projects: ProjectSummaryResponse[]; onClose: () => void };

export function ProjectOrderDialog(props: ProjectOrderDialogProps) {
  const { open, projects, onClose } = props;
  return (
    <Modal open={open} onClose={onClose} labelledBy="project-order-title">
      {/* 열 때마다 현재 순서로 다시 시작한다 */}
      {open && <OrderForm projects={projects} onClose={onClose} />}
    </Modal>
  );
}

function OrderForm({ projects, onClose }: Omit<ProjectOrderDialogProps, "open">) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Row[]>(() =>
    projects.map(({ projectId, title, featured }) => ({ projectId, title, featured })),
  );
  const reorder = useReorder(rows, setRows);
  const save = useMutation({
    mutationFn: async () =>
      unwrapApiResult(
        await updateProjectOrderAction({ items: rows.map(({ projectId, featured }) => ({ projectId, featured })) }),
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects.all });
      onClose();
    },
  });
  const featuredCount = rows.filter((row) => row.featured).length;

  return (
    <div className="flex max-h-[85vh] w-[520px] max-w-[calc(100vw-32px)] flex-col gap-4 rounded-pill border-[1.5px] border-line-01 bg-background-01 p-7">
      <div className="flex flex-col gap-1.5">
        <h2 id="project-order-title" className="font-display text-title-3 text-content-01">
          노출 순서
        </h2>
        <p className="text-body-m text-content-02">
          끌거나 화살표 키로 순서를 바꿔요. ★를 켠 프로젝트가 메인 주요 프로젝트에 이 순서대로 보여요. (주요{" "}
          {featuredCount}개)
        </p>
      </div>
      <ol data-reorder-list className="-mx-1 flex flex-col gap-2 overflow-y-auto px-1 py-1">
        {rows.map((row, index) => (
          <OrderItem
            key={row.projectId}
            handle={reorder.handleProps(index, row.title)}
            dragging={reorder.dragging === index}
            {...reorder.itemProps(index)}
          >
            <span className="w-6 font-mono text-mono-l text-warning tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-label-m text-content-01">{row.title}</span>
            <StarToggle
              on={row.featured}
              label={row.title}
              onToggle={() =>
                setRows((current) =>
                  current.map((item) =>
                    item.projectId === row.projectId ? { ...item, featured: !item.featured } : item,
                  ),
                )
              }
            />
          </OrderItem>
        ))}
      </ol>
      {save.error && <AlertDanger>{save.error.message}</AlertDanger>}
      <div className="flex justify-end gap-2">
        <ButtonCompact onClick={onClose} className="h-11 px-4">
          취소
        </ButtonCompact>
        <Button size="M" onClick={() => save.mutate()} disabled={save.isPending}>
          저장하기
        </Button>
      </div>
    </div>
  );
}
