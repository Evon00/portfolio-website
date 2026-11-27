import { ApiError } from "@/shared/libs/api";

/** 경로의 숫자 ID. 숫자가 아니면 404 */
export function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError({ status: 404, message: "찾을 수 없어요." });
  return id;
}
