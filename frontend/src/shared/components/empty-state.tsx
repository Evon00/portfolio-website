import { Button } from "./button";
import { PaperAsset } from "@/shared/components/paper/paper-asset";

// Figma Components › Empty State. 목록이 비었을 때. 제목·설명·버튼 라벨을 바꿔 쓴다.
// Mobile은 버튼이 M(44px) · 최대 320px로 가로를 채운다.
type EmptyStateProps = {
  character?: "sage" | "mustard";
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
};

export function EmptyState(props: EmptyStateProps) {
  const { character = "sage", title, description, action } = props;
  return (
    <div className="flex w-full max-w-[560px] flex-col items-center text-center">
      <div className="relative h-[212px] w-[300px]">
        {character === "sage" ? (
          <PaperAsset name="blob-sage-smile" className="top-[19.64px] left-[65px] h-[112.36px] w-[170px]" />
        ) : (
          <PaperAsset name="blob-mustard-happy" className="top-[30.57px] left-[65px] h-[101.43px] w-[170px]" />
        )}
        <PaperAsset
          name={character === "sage" ? "panel-grid-notepad" : "panel-cream-wide"}
          className="top-[92px] left-0 h-[120px] w-[300px]"
        />
      </div>
      <p className="mt-8 font-display text-title-2 text-content-01">{title}</p>
      <p className="mt-2.5 text-body-l whitespace-pre-line text-content-02">{description}</p>
      {action && (
        <>
          <Button href={action.href} onClick={action.onClick} className="mt-6 hidden min-w-40 md:inline-flex">
            {action.label}
          </Button>
          <Button href={action.href} onClick={action.onClick} size="M" className="mt-6 w-full max-w-80 md:hidden">
            {action.label}
          </Button>
        </>
      )}
    </div>
  );
}
