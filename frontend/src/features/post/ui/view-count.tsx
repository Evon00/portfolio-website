"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/components/icon";
import { increasePostViewAction } from "@/shared/_controllers/post/post.action";

// 상세 조회수 (설계 문서 6절): 캐시된 숫자를 먼저 보여 주고, 브라우저에서 증가 요청을 한 번 보내 최신 숫자로 바꾼다.
// 같은 IP의 반복 증가(24시간 1회)는 Spring이 막고, 그때도 현재 조회수를 돌려준다.
// 같은 세션에서는 sessionStorage로 다시 보내지 않는다. 숫자 폭이 바뀌어도 흔들리지 않게 tabular-nums + 최소 폭.
const storageKey = (postId: number) => `viewed:post:${postId}`;

export function ViewCount({ postId, initialCount }: { postId: number; initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey(postId))) return;
      sessionStorage.setItem(storageKey(postId), "1");
    } catch {
      // 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서는 그냥 한 번 보낸다.
    }
    // 응답을 취소하지 않는다. 개발 모드(StrictMode)는 effect를 두 번 실행하는데, 두 번째는 sessionStorage 때문에 요청하지 않으므로
    // 첫 요청의 결과를 버리면 숫자가 바뀌지 않는다. 화면을 떠난 뒤 setCount가 불려도 문제없다.
    void increasePostViewAction(postId).then((result) => {
      if (result.success) setCount(result.data.viewCount);
    });
  }, [postId]);

  const label = count.toLocaleString("ko-KR");
  return (
    <span className="flex items-center gap-1.5">
      <Icon name="eye" size={16} label="조회수" />
      <span className="inline-block text-left tabular-nums" style={{ minWidth: `${Math.max(label.length, 5)}ch` }}>
        {label}
      </span>
    </span>
  );
}
