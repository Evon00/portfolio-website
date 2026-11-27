import type { ProfileResponse } from "@/shared/_controllers/_legacy-types";
import { Button } from "@/shared/components/button";
import { Container } from "@/shared/components/container";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { SkillChipLarge, type SkillChipTone } from "@/shared/components/skill";

// Figma 메인 › hero. 1024 이상은 캐릭터 왼쪽 · 글 오른쪽(간격 88), 미만은 캐릭터가 위로 올라간다.
// 1024 미만은 세로 배치라 캐릭터 축에 맞춰 직무·이름·소개·버튼·CORE STACK을 가운데 정렬한다(1024 이상은 왼쪽 정렬).
// 소개 문구는 어드민에서 넣은 줄바꿈을 그대로 살리고, 그 밖에서는 띄어쓰기 단위로 바꾸고 마지막 줄에 한 단어만 남지 않게 한다.
// CORE STACK 칩 색은 Figma 순서대로 라벤더 → 파랑 → 세이지 → 머스타드를 돌려 쓴다.
const CHIP_TONES: SkillChipTone[] = ["lavender", "blue", "sage", "mustard"];

export function HeroSection({ profile }: { profile: ProfileResponse }) {
  return (
    <Container as="section" className="pt-fluid-40-104 pb-fluid-96-140" aria-label="소개">
      <div className="flex flex-col gap-fluid-40-64">
        <div className="flex flex-col items-center gap-fluid-40-88 lg:flex-row">
          {/* 캐릭터는 9° 기울인 채 440×301 자리에 놓는다. 좁은 화면에서는 비율대로 줄인다. */}
          <div className="relative aspect-[440/301] w-fluid-240-440 shrink-0">
            <PaperAsset name="blob-blue-sleepy" className="inset-0 rotate-9" priority />
          </div>
          <div className="flex w-full flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <p className="font-mono text-eyebrow text-accent-blue-strong">{profile.role}</p>
            <h1 className="font-display text-display-fluid-m-l text-content-01">{profile.name}</h1>
            <p className="max-w-[540px] text-body-article break-keep text-pretty whitespace-pre-line text-content-02">
              {profile.intro}
            </p>
            <div className="flex w-full flex-wrap justify-center gap-3 pt-2 lg:justify-start">
              <Button href={profile.githubUrl} icon="code" className="min-w-40 flex-1 sm:flex-none">
                GitHub
              </Button>
              <Button
                href={`mailto:${profile.email}`}
                variant="outline"
                icon="mail"
                className="min-w-40 flex-1 sm:flex-none"
              >
                이메일
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 lg:flex-row lg:flex-wrap">
          <p className="font-mono text-mono-l text-content-03 lg:pr-2">CORE STACK</p>
          <ul className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {profile.coreSkills.map((skill, i) => (
              <li key={skill.skillId}>
                <SkillChipLarge skill={skill} tone={CHIP_TONES[i % CHIP_TONES.length]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
