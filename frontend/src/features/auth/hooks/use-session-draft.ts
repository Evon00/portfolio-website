"use client";

import { useEffect, useRef, useState } from "react";
import { useSessionExpiredStore } from "./use-session-expired";

// 401(로그인 만료) 때 작성·수정 중인 내용을 sessionStorage에 보관하고, 다시 로그인해 같은 화면에 오면 복원한다(설계 문서 5절).
// 초안은 등록·저장 성공(clearDraft)이나 직접 로그아웃(clearAllDrafts) 때 지운다.
const PREFIX = "admin-draft:";

function read<T>(key: string): T | null {
  try {
    const saved = sessionStorage.getItem(PREFIX + key);
    return saved ? (JSON.parse(saved) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // 저장소를 못 쓰면 지울 것도 없다.
  }
}

export function clearAllDrafts() {
  try {
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(PREFIX)) sessionStorage.removeItem(key);
  } catch {
    // 저장소를 못 쓰면 지울 것도 없다.
  }
}

/**
 * 화면에 들어올 때 보관된 초안을 한 번 읽는다. 서버 HTML과 어긋나지 않도록 마운트 뒤에 읽고,
 * 읽기 전(ready=false)에는 폼을 그리지 않아 폼 state의 초기값으로 쓸 수 있게 한다.
 */
export function useStoredDraft<T>(key: string) {
  const [state, setState] = useState<{ ready: boolean; draft: T | null }>({ ready: false, draft: null });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 저장소는 마운트 뒤에만 읽을 수 있다
    setState({ ready: true, draft: read<T>(key) });
  }, [key]);
  return state;
}

/** 로그인이 만료되는 순간의 값을 보관한다. */
export function useSaveDraftOnExpire<T>(key: string, value: T) {
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  });
  useEffect(
    () =>
      useSessionExpiredStore.subscribe((state, previous) => {
        if (state.expired && !previous.expired) {
          try {
            sessionStorage.setItem(PREFIX + key, JSON.stringify(latest.current));
          } catch {
            // 저장소를 못 쓰면 보관하지 못한다(사생활 보호 모드 등).
          }
        }
      }),
    [key],
  );
}
