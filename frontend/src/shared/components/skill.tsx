import { cn } from "@/shared/utils";

export type SkillView = {
  name: string;
  /** 업로드한 아이콘 주소. 없으면 아이콘 칸 없이 이름만 보여 준다. */
  iconUrl?: string | null;
};

// Figma _assets › Skill Logos의 Mono 로고처럼 아이콘을 글자색(currentColor)으로 칠한다.
// 업로드 이미지의 알파를 마스크로 써서 톤별 글자색과 맞춘다. 아이콘이 없으면 그리지 않는다.
export function SkillLogo(props: { iconUrl?: string | null; size?: number; className?: string }) {
  const { iconUrl, size = 16, className } = props;
  if (!iconUrl) return null;
  return (
    <span
      aria-hidden
      className={cn("block shrink-0 bg-current", className)}
      style={{
        width: size,
        height: size,
        maskImage: `url("${iconUrl}")`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}

// Figma Components › Skill Tag · Skill Tag / More
const TAG_TONE = {
  white: "bg-content-inverse text-content-01",
  lavender: "bg-primary-subtle text-primary-hover",
  blue: "bg-accent-blue-bg text-accent-blue-text",
  sage: "bg-accent-sage-bg text-success",
} as const;

export type SkillTagTone = keyof typeof TAG_TONE;

export function SkillTag({ skill, tone = "lavender" }: { skill: SkillView; tone?: SkillTagTone }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-2.5 font-mono text-mono-m whitespace-nowrap",
        skill.iconUrl ? "pl-[5px]" : "pl-2.5",
        TAG_TONE[tone],
      )}
    >
      <SkillLogo iconUrl={skill.iconUrl} />
      {skill.name}
    </span>
  );
}

export function SkillTagMore({ count, tone = "lavender" }: { count: number; tone?: SkillTagTone }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-1.5 py-1 font-mono text-[12px] leading-[normal] font-medium",
        TAG_TONE[tone],
      )}
    >
      +{count}
    </span>
  );
}

// 여러 줄로 모두 보여 준다(상세 페이지). 카드처럼 한 줄에 맞춰야 하면 SkillTagRow를 쓴다.
export function SkillTagList(props: { skills: SkillView[]; tone?: SkillTagTone; className?: string }) {
  const { skills, tone, className } = props;
  return (
    <div className={cn("flex flex-wrap items-center gap-1 gap-y-1.5", className)}>
      {skills.map((skill) => (
        <SkillTag key={skill.name} skill={skill} tone={tone} />
      ))}
    </div>
  );
}

// Figma Components › Skill Chip / Large. 히어로 CORE STACK 칩.
const CHIP_TONE = {
  lavender: { border: "border-primary-muted", icon: "bg-primary-light", text: "text-primary-hover" },
  blue: { border: "border-accent-blue-muted", icon: "bg-accent-blue-bg", text: "text-accent-blue-text" },
  sage: { border: "border-accent-sage-muted", icon: "bg-accent-sage-bg", text: "text-accent-sage-text" },
  mustard: { border: "border-accent-mustard-muted", icon: "bg-accent-mustard-bg", text: "text-accent-mustard-text" },
} as const;

export type SkillChipTone = keyof typeof CHIP_TONE;

export function SkillChipLarge({ skill, tone = "lavender" }: { skill: SkillView; tone?: SkillChipTone }) {
  const t = CHIP_TONE[tone];
  return (
    <span
      className={cn(
        "inline-flex h-[52px] items-center gap-2.5 rounded-full border-2 bg-background-01 pr-5 font-mono text-mono-l",
        skill.iconUrl ? "pl-2.5" : "pl-5",
        t.border,
        t.text,
      )}
    >
      {skill.iconUrl && (
        <span className={cn("flex size-8 items-center justify-center rounded-control", t.icon)}>
          <SkillLogo iconUrl={skill.iconUrl} size={20} />
        </span>
      )}
      {skill.name}
    </span>
  );
}

// Figma Components › Skill Chip / Medium. 프로젝트 상세 기술 스택 칩.
// Figma 테두리 #dcd3c2는 토큰에 없어 가장 가까운 line-02를 쓴다.
export function SkillChipMedium({ skill }: { skill: SkillView }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-card border border-line-02 bg-background-01 pr-4 font-mono text-mono-l text-primary-hover",
        skill.iconUrl ? "pl-[7px]" : "pl-4",
      )}
    >
      {skill.iconUrl && (
        <span className="flex size-[22px] items-center justify-center rounded-md border border-dashed border-primary-muted bg-primary-light">
          <SkillLogo iconUrl={skill.iconUrl} size={16} />
        </span>
      )}
      {skill.name}
    </span>
  );
}

// Figma Components › Skill Icon. 기술 스택 아이콘 타일 36×36.
export function SkillIcon({ iconUrl, className }: { iconUrl?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-control border border-line-01 bg-background-01 text-content-02",
        className,
      )}
    >
      <SkillLogo iconUrl={iconUrl} size={20} />
    </span>
  );
}
