package com.jh.backend.common;

// 캐시 이름 (@Cacheable, @CacheEvict에서 같은 이름을 사용)
public final class CacheNames {

    // 프로필 조회 (관리자 1명이므로 키 1개)
    public static final String PROFILE = "profile";

    private CacheNames() {
    }
}
