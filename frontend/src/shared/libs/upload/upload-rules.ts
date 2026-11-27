// 업로드 규칙 (설계 문서 4절, Figma 갤러리·아이콘 업로드 안내 문구). 브라우저와 서버가 같은 값을 쓴다.
export type UploadPurpose = "post" | "project" | "skill" | "profile";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
/** 긴 변 상한. 본문·갤러리 2400px, 기술 스택 아이콘·프로필 256px */
export const MAX_EDGE: Record<UploadPurpose, number> = { post: 2400, project: 2400, skill: 256, profile: 256 };
export const MAX_GALLERY_IMAGES = 10;
