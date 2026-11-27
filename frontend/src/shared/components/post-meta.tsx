import { cn } from "@/shared/utils";
import { Icon } from "./icon";
import { RelativeTime } from "./relative-time";

// 블로그 카드·행의 작성 시각 + 조회수 (Figma info: 아이콘 16px, 간격 14px, content-03).
type PostMetaProps = {
  publishedAt: string;
  viewCount: number;
  className?: string;
};

export function PostMeta(props: PostMetaProps) {
  const { publishedAt, viewCount, className } = props;
  return (
    <div className={cn("flex items-center gap-3.5 text-content-03", className)}>
      <span className="flex items-center gap-[5px]">
        <Icon name="clock" size={16} />
        <RelativeTime dateTime={publishedAt} />
      </span>
      <span className="flex items-center gap-[5px]">
        <Icon name="eye" size={16} label="조회수" />
        <span className="tabular-nums">{viewCount.toLocaleString("ko-KR")}</span>
      </span>
    </div>
  );
}
