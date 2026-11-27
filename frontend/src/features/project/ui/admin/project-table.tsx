"use client";

import { useState } from "react";
import { adminQueryKeys } from "@/shared/libs/api";
import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { DataTable, Td, Th, TitleSlugCell, Tr } from "@/shared/components/admin/data-table";
import { useDeleteDialog } from "@/shared/components/admin/delete-dialog";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { EmptyState } from "@/shared/components/empty-state";
import { Icon } from "@/shared/components/icon";
import { Pagination } from "@/shared/components/pagination";
import { SkillTagRow } from "@/shared/components/skill-tag-row";
import { deleteProjectAction } from "@/shared/_controllers/project/project.action";
import { formatYearMonth, useProjectListQuery } from "@/shared/_controllers/project";
import { ProjectOrderDialog } from "./project-order-dialog";

// Figma 관리자 · 프로젝트 목록. 표는 노출 순서(서버 순서) 그대로이고, 순서 칸의 손잡이로 순서 창을 연다. 한 페이지 5개.
// 열(Figma 1920): 순서 88 · 제목 / 슬러그(남는 폭) · 기간 260 · 기술 스택 400 · 이미지 96 · 관리 180.
// 1920 미만에서는 1440까지 순서 64 · 기간 180 · 기술 스택 240으로 같이 줄어든다(wide 토큰). 이미지 · 관리는 고정.
// 1280 미만에서는 기술 스택 열을 숨겨 제목이 보이게 하고, 제목 열은 최소 200(표 최소 폭 = 고정 열 520 + 200)을 지킨다.
// 메인 주요 프로젝트는 노출 순서 위에서부터 정해지므로 표에 따로 표시하지 않는다.
const PAGE_SIZE = 5;

export function ProjectTable() {
  const { data: projects, isPending, isError, refetch } = useProjectListQuery();
  const [page, setPage] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const remove = useDeleteDialog({
    noun: "프로젝트",
    action: deleteProjectAction,
    invalidate: [adminQueryKeys.projects.all, adminQueryKeys.dashboard.all],
  });

  const header = (
    <AdminPageHeader
      title="프로젝트"
      count={projects?.length}
      actions={
        <>
          {projects && projects.length > 1 && (
            <Button variant="outline" size="M" onClick={() => setOrderOpen(true)}>
              노출 순서
            </Button>
          )}
          <Button href="/admin/projects/new" size="M">
            + 새 프로젝트
          </Button>
        </>
      }
    />
  );

  if (isPending || isError) {
    return (
      <>
        {header}
        {isPending ? <AdminLoading /> : <AdminLoadError onRetry={() => refetch()} />}
      </>
    );
  }

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const offset = (current - 1) * PAGE_SIZE;
  const visible = projects.slice(offset, offset + PAGE_SIZE);

  return (
    <>
      {header}
      <DataTable className="min-w-[720px]">
        <thead>
          <tr>
            <Th className="w-wide-64-88">순서</Th>
            <Th>제목 / 슬러그</Th>
            <Th className="w-wide-180-260">기간</Th>
            <Th className="hidden w-wide-240-400 xl:table-cell">기술 스택</Th>
            <Th className="w-[96px]">이미지</Th>
            <Th className="w-[180px]">관리</Th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 pt-14 pb-16">
                <div className="flex justify-center">
                  <EmptyState
                    character="mustard"
                    title="아직 등록한 프로젝트가 없어요"
                    description="첫 프로젝트를 등록하면 목록과 메인에 보여요."
                    action={{ label: "첫 프로젝트 등록", href: "/admin/projects/new" }}
                  />
                </div>
              </td>
            </tr>
          )}
          {visible.map((project, i) => (
            <Tr key={project.projectId}>
              <Td>
                <button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  aria-label={`${offset + i + 1}번째 · 순서 바꾸기`}
                  title="순서 바꾸기"
                  className="mx-auto flex size-8 items-center justify-center rounded-lg text-primary-strong hover:bg-primary-subtle"
                >
                  <Icon name="drag-handle" size={20} />
                </button>
              </Td>
              <Td>
                <TitleSlugCell title={project.title} slug={project.slug} />
              </Td>
              <Td className="text-center font-mono text-mono-l whitespace-nowrap text-content-01">
                {formatYearMonth(project.startDate)} – {project.endDate ? formatYearMonth(project.endDate) : "진행 중"}
              </Td>
              <Td className="hidden xl:table-cell">
                <SkillTagRow skills={project.skills} gap="md" />
              </Td>
              <Td className="text-center font-mono text-mono-l">
                {project.imageCount > 0 ? (
                  <span className="text-content-01">{project.imageCount}장</span>
                ) : (
                  <span className="text-danger">없음</span>
                )}
              </Td>
              <Td>
                <div className="flex justify-center gap-1.5">
                  <ButtonCompact href={`/admin/projects/${project.projectId}/edit`}>수정</ButtonCompact>
                  <ButtonCompact
                    variant="danger-outline"
                    onClick={() => remove.open({ id: project.projectId, title: project.title })}
                  >
                    삭제
                  </ButtonCompact>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </DataTable>
      {projects.length > 0 && <Pagination page={current} totalPages={totalPages} onChange={setPage} />}
      <ProjectOrderDialog open={orderOpen} projects={projects} onClose={() => setOrderOpen(false)} />
      {remove.dialog}
    </>
  );
}
