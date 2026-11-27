"use client";

import { useState } from "react";
import type { UploadCompleteResponse } from "@/shared/_generated";
import { uploadImage } from "./upload-image";
import type { UploadPurpose } from "./upload-rules";

// 이미지 한 장씩 올리는 화면(기술 스택 아이콘 · 프로필 이미지 · 에디터 본문 이미지)의 공통 상태.
// · uploading: 올리는 중인 장이 하나라도 있으면 true(에디터처럼 여러 장을 차례로 올려도 센다)
// · upload(file): 성공하면 업로드 결과, 실패하면 오류 문구를 남기고 null
// · clearError: 새로 올리기 시작할 때 이전 오류를 지운다(여러 장을 올릴 때는 묶음 시작에 한 번)
// 갤러리처럼 장마다 진행률을 보여 주는 곳은 쓰지 않는다.
export function useImageUpload(purpose: UploadPurpose, failMessage = "이미지를 올리지 못했어요.") {
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<UploadCompleteResponse | null> {
    setPending((count) => count + 1);
    try {
      return await uploadImage(file, purpose);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : failMessage);
      return null;
    } finally {
      setPending((count) => count - 1);
    }
  }

  return { uploading: pending > 0, error, upload, clearError: () => setError(null) };
}
