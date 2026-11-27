"use client";

import { useState } from "react";

// 이미지 한 장씩 올리는 화면(에디터 본문 이미지)의 공통 상태. 실제로 올리는 함수(upload)는 쓰는 쪽이 넘긴다.
// · uploading: 올리는 중인 장이 하나라도 있으면 true(에디터처럼 여러 장을 차례로 올려도 센다)
// · upload(file): 성공하면 업로드 결과(url), 실패하면 오류 문구를 남기고 null
// · clearError: 새로 올리기 시작할 때 이전 오류를 지운다(여러 장을 올릴 때는 묶음 시작에 한 번)
// 갤러리처럼 장마다 진행률을 보여 주는 곳은 쓰지 않는다.
export type UploadImage = (file: File) => Promise<{ url: string }>;

export function useImageUpload(uploadImage: UploadImage, failMessage = "이미지를 올리지 못했어요.") {
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<{ url: string } | null> {
    setPending((count) => count + 1);
    try {
      return await uploadImage(file);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : failMessage);
      return null;
    } finally {
      setPending((count) => count - 1);
    }
  }

  return { uploading: pending > 0, error, upload, clearError: () => setError(null) };
}
