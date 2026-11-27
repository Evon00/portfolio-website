"use client";

import Link from "next/link";
import { useState } from "react";
import { useSkillListQuery } from "@/shared/_controllers/skill";
import type { SkillResponse } from "@/shared/_generated";
import { useReorder } from "@/shared/hooks";
import { CATEGORY_LABEL } from "@/shared/_controllers/skill";
import { CategoryTag } from "@/shared/components/admin/category-tag";
import { OrderItem, OrderItemRemove } from "@/shared/components/admin/order-item";
import { AdminPanel, PanelHeader } from "@/shared/components/admin/panel";
import { TextField } from "@/shared/components/form";
import { Icon } from "@/shared/components/icon";
import { SkillLogo } from "@/shared/components/skill";
import { cn } from "@/shared/utils";

// Figma 관리자 · 프로필 › 메인에 보일 핵심 기술 스택. Order Item(Skill) 목록 + 검색 결과 Skill Option.
type CoreSkillEditorProps = { value: SkillResponse[]; onChange: (skills: SkillResponse[]) => void };

export function CoreSkillEditor({ value, onChange }: CoreSkillEditorProps) {
  const { data: skills = [] } = useSkillListQuery();
  const [query, setQuery] = useState("");
  const reorder = useReorder(value, onChange);
  const selectedIds = new Set(value.map((skill) => skill.skillId));
  const q = query.trim().toLowerCase();
  const options = skills.filter((skill) => !q || skill.name.toLowerCase().includes(q));
  const toggle = (skill: SkillResponse) =>
    onChange(
      selectedIds.has(skill.skillId) ? value.filter((item) => item.skillId !== skill.skillId) : [...value, skill],
    );

  return (
    <AdminPanel className="flex flex-col gap-4">
      <PanelHeader title="메인에 보일 핵심 기술 스택" />
      <p className="-mt-2 text-body-m text-content-02">백엔드 핵심 스킬만 골라 주세요. 끌어서 순서를 바꿀 수 있어요.</p>

      {value.length > 0 ? (
        <ol data-reorder-list className="flex flex-col gap-2.5">
          {value.map((skill, index) => (
            <OrderItem
              key={skill.skillId}
              handle={reorder.handleProps(index, skill.name)}
              dragging={reorder.dragging === index}
              {...reorder.itemProps(index)}
            >
              {skill.iconUrl && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary-hover">
                  <SkillLogo iconUrl={skill.iconUrl} size={16} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate font-mono text-eyebrow text-content-01">{skill.name}</span>
              <span className="font-mono text-mono-m text-content-03">{CATEGORY_LABEL[skill.category]}</span>
              <OrderItemRemove label={skill.name} onClick={() => toggle(skill)} />
            </OrderItem>
          ))}
        </ol>
      ) : (
        <p className="rounded-xl border border-dashed border-line-02 px-4 py-5 text-center text-body-m text-content-03">
          아직 고른 기술이 없어요. 아래에서 골라 주세요.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="core-skill-search" className="text-label-m text-content-01">
          스킬 추가
        </label>
        <TextField
          id="core-skill-search"
          type="search"
          icon="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="기술 스택 검색"
        />
        <ul className="max-h-[264px] overflow-y-auto rounded-xl border border-line-01 py-1">
          {options.length === 0 && <li className="px-5 py-3 text-body-m text-content-03">찾는 기술 스택이 없어요</li>}
          {options.map((skill) => {
            const checked = selectedIds.has(skill.skillId);
            return (
              <li key={skill.skillId}>
                <label className="relative flex h-11 cursor-pointer items-center gap-2.5 pr-4 pl-5 hover:bg-background-02">
                  <input type="checkbox" checked={checked} onChange={() => toggle(skill)} className="peer sr-only" />
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded-sm peer-focus-visible:focus-glow",
                      checked ? "bg-primary text-content-inverse" : "border-[1.5px] border-line-03 bg-content-inverse",
                    )}
                  >
                    {checked && <Icon name="check" size={14} />}
                  </span>
                  {skill.iconUrl && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary-hover">
                      <SkillLogo iconUrl={skill.iconUrl} size={14} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-body-m text-content-01">{skill.name}</span>
                  <CategoryTag category={skill.category} />
                </label>
              </li>
            );
          })}
        </ul>
        <p className="text-caption text-content-03">
          목록에 없는 스킬은{" "}
          <Link href="/admin/skills" className="text-content-02 underline underline-offset-2">
            기술 스택 관리
          </Link>
          에서 먼저 추가해요.
        </p>
      </div>
    </AdminPanel>
  );
}
