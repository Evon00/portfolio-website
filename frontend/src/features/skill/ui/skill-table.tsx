"use client";

import { useState } from "react";
import { adminQueryKeys } from "@/shared/libs/api";
import type { SkillResponse } from "@/shared/_controllers/_legacy-types";
import { CATEGORY_LABEL, type SkillCategory } from "@/shared/_controllers/skill";
import { CategoryTag } from "@/shared/components/admin/category-tag";
import { DataTable, Td, Th, Tr } from "@/shared/components/admin/data-table";
import { useDeleteDialog } from "@/shared/components/admin/delete-dialog";
import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { FilterChip } from "@/shared/components/filter-chip";
import { TextField } from "@/shared/components/form";
import { SkillIcon } from "@/shared/components/skill";
import { formatDate } from "@/shared/utils";
import { deleteSkillAction } from "@/shared/_controllers/skill/skill.action";
import { useSkillListQuery } from "@/shared/_controllers/skill";
import { SkillDialog } from "./skill-dialog";

// Figma 관리자 · 기술 스택. 카테고리 칩 + 이름 검색으로 거르고, 추가·수정은 같은 창을 쓴다.
export function SkillTable() {
  const { data: skills, isPending, isError, refetch } = useSkillListQuery();
  const [category, setCategory] = useState<SkillCategory | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [dialog, setDialog] = useState<{ skill?: SkillResponse } | null>(null);
  const remove = useDeleteDialog({
    noun: "기술 스택",
    action: deleteSkillAction,
    invalidate: [
      adminQueryKeys.skills.all,
      adminQueryKeys.posts.all,
      adminQueryKeys.projects.all,
      adminQueryKeys.profile.all,
      adminQueryKeys.dashboard.all,
    ],
  });

  const k = keyword.trim().toLowerCase();
  const visible = (skills ?? []).filter(
    (skill) => (category === "ALL" || skill.category === category) && (!k || skill.name.toLowerCase().includes(k)),
  );

  return (
    <>
      <AdminPageHeader
        title="기술 스택"
        count={skills?.length}
        actions={
          <>
            <TextField
              type="search"
              icon="search"
              aria-label="이름으로 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="이름으로 검색"
              wrapperClassName="h-11 w-[216px] px-3.5 focus-within:px-[13px]"
            />
            <Button size="M" onClick={() => setDialog({})}>
              기술 스택 추가
            </Button>
          </>
        }
      />
      <div role="group" aria-label="카테고리" className="flex flex-wrap gap-2">
        <FilterChip label="전체" selected={category === "ALL"} onClick={() => setCategory("ALL")} />
        {(Object.keys(CATEGORY_LABEL) as SkillCategory[]).map((value) => (
          <FilterChip
            key={value}
            label={CATEGORY_LABEL[value]}
            selected={category === value}
            onClick={() => setCategory(value)}
            className="font-mono"
          />
        ))}
      </div>

      {isPending ? (
        <AdminLoading />
      ) : isError ? (
        <AdminLoadError onRetry={() => refetch()} />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>아이콘 / 이름</Th>
              <Th className="w-[180px]">카테고리</Th>
              <Th className="w-[240px]">등록일</Th>
              <Th className="w-[140px] text-right">관리</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-body-m text-content-03">
                  {skills.length === 0 ? "아직 등록한 기술 스택이 없어요." : "조건에 맞는 기술 스택이 없어요."}
                </td>
              </tr>
            )}
            {visible.map((skill) => (
              <Tr key={skill.skillId}>
                <Td className="py-2.5">
                  <span className="flex items-center gap-2.5 text-label-m text-content-01">
                    {skill.iconUrl ? <SkillIcon iconUrl={skill.iconUrl} /> : null}
                    {skill.name}
                  </span>
                </Td>
                <Td>
                  <CategoryTag category={skill.category} />
                </Td>
                <Td className="font-mono text-mono-l text-content-01">{formatDate(skill.createdAt)}</Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    <ButtonCompact onClick={() => setDialog({ skill })}>수정</ButtonCompact>
                    <ButtonCompact
                      variant="danger-outline"
                      onClick={() => remove.open({ id: skill.skillId, title: skill.name })}
                    >
                      삭제
                    </ButtonCompact>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
      <SkillDialog open={dialog !== null} skill={dialog?.skill} onClose={() => setDialog(null)} />
      {remove.dialog}
    </>
  );
}
