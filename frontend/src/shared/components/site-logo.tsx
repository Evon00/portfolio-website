import Link from "next/link";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { cn } from "@/shared/utils";

// Figma Header › logo. "[이름].log"(Title/3) 뒤에 Lavender Check 테이프를 4° 기울여 85% 투명도로 붙인다.
// 테이프 크기: Desktop 132×38.04, Mobile 112×32.28.
export function SiteLogo(props: { name: string; size?: "desktop" | "mobile"; className?: string }) {
  const { name, size = "desktop", className } = props;
  return (
    <Link href="/" className={cn("relative inline-flex px-3.5 py-1.5", className)}>
      <PaperAsset
        name="tape-lavender-check"
        className={cn(
          "-left-1.5 rotate-4 opacity-85",
          size === "desktop" ? "top-0 h-[38.04px] w-[132px]" : "top-[0.86px] h-[32.28px] w-[112px]",
        )}
      />
      <span className="relative font-display text-title-3 text-content-01">{name}.log</span>
    </Link>
  );
}
