"use client";

import { AdminPanel } from "@/shared/components/admin/panel";
import { SkillToggleChip } from "@/shared/components/admin/skill-toggle-chip";
import { FormLabel, FormMessage } from "@/shared/components/form";
import { useSkillListQuery } from "@/shared/_controllers/skill";

// Figma 게시글·프로젝트 작성 › 기술 스택 카드. 등록된 기술 전부를 칩으로 보여 주고 눌러서 고른다.
type SkillPickerProps = {
  value: number[];
  onChange: (skillIds: number[]) => void;
  error?: string;
  /** 프로젝트 폼의 안내 문구 */
  help?: string;
};

export function SkillPicker(props: SkillPickerProps) {
  const { value, onChange, error, help } = props;
  const { data: skills, isPending, isError, refetch } = useSkillListQuery();
  const toggle = (skillId: number) =>
    onChange(value.includes(skillId) ? value.filter((id) => id !== skillId) : [...value, skillId]);

  return (
    <AdminPanel className="flex flex-col gap-3.5" aria-labelledby="skill-picker-label">
      <p id="skill-picker-label" className="flex items-center gap-1 text-label-m text-content-01">
        <FormLabel required>기술 스택</FormLabel>
        <span className="text-label-m text-content-02">
          · {value.length > 0 ? `${value.length}개 선택됨` : "아직 선택한 기술이 없어요"}
        </span>
      </p>
      {isPending ? (
        <p className="text-body-m text-content-03">기술 스택을 불러오는 중이에요…</p>
      ) : isError ? (
        <button type="button" onClick={() => refetch()} className="self-start text-label-m text-primary-strong">
          기술 스택을 불러오지 못했어요. 다시 시도
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillToggleChip
              key={skill.skillId}
              label={skill.name}
              selected={value.includes(skill.skillId)}
              onToggle={() => toggle(skill.skillId)}
            />
          ))}
        </div>
      )}
      {error ? (
        <FormMessage status="error">{error}</FormMessage>
      ) : (
        help && <FormMessage status="help">{help}</FormMessage>
      )}
    </AdminPanel>
  );
}
