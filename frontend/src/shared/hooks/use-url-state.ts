"use client";

import { useCallback, useEffect, useState } from "react";

// 목록 필터·정렬·페이지를 URL에 담는다(설계 문서 6절).
// - 서버 HTML은 기본값(필터 없는 1페이지)으로 그려지고, 마운트 후 주소의 값을 읽어 바꾼다.
// - 주소는 history.replaceState로만 바꿔 서버를 다시 부르지 않는다. 공유·새로고침하면 같은 상태로 열린다.
export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const [state, setState] = useState<T>(defaults);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const value = params.get(key as string);
      if (value !== null) next[key] = value as T[keyof T];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
    // 처음 한 번만 주소를 읽는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (patch: Partial<T>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        const params = new URLSearchParams(window.location.search);
        for (const key of Object.keys(defaults)) {
          const value = next[key];
          if (value === undefined || value === defaults[key]) params.delete(key);
          else params.set(key, value);
        }
        const query = params.toString();
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
        return next;
      });
    },
    [defaults],
  );

  return [state, update] as const;
}
