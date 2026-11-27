import { cn } from "@/shared/utils";
import { Button } from "./button";
import { PaperAsset } from "@/shared/components/paper/paper-asset";

// Figma Components › Inline Error. 섹션 하나만 실패했을 때(부분 오류). 768 미만은 Stack.
type InlineErrorProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function InlineError(props: InlineErrorProps) {
  const { title, description = "나머지 내용은 그대로 볼 수 있어요.", onRetry, className } = props;
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full flex-col items-start rounded-card border-2 border-dashed border-primary-muted bg-background-01 px-[26px] py-5",
        "gap-fluid-12-16 md:flex-row md:items-center",
        className,
      )}
    >
      <span className="relative block h-[45.2px] w-[72px] shrink-0">
        <PaperAsset name="blob-lavender-sleepy" className="inset-0" />
      </span>
      <div className="flex w-full flex-col gap-1 md:min-w-0 md:flex-1">
        <p className="text-label-l text-content-01">{title}</p>
        <p className="text-body-m text-content-02">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="M" icon="refresh" onClick={onRetry} className="w-full md:w-auto">
          다시 시도
        </Button>
      )}
    </div>
  );
}
