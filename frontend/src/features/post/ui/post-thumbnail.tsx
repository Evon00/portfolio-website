import Image from "next/image";
import { ImagePlaceholder } from "@/shared/components/image-placeholder";
import { cn } from "@/shared/utils";

// 게시글 썸네일. 이미지가 없으면 Image Placeholder(게시글=머스타드)로 바꾼다.
type PostThumbnailProps = {
  src: string | null;
  ratio: "16:10" | "1:1";
  sizes: string;
  className?: string;
};

export function PostThumbnail(props: PostThumbnailProps) {
  const { src, ratio, sizes, className } = props;
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-background-05",
        ratio === "16:10" ? "aspect-[16/10]" : "aspect-square",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <ImagePlaceholder purpose="post" ratio={ratio} className="absolute inset-0 rounded-[inherit]" />
      )}
    </div>
  );
}
