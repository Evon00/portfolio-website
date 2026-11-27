package com.jh.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.jh.backend.common.CacheNames;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.transaction.TransactionAwareCacheManagerProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/*
캐시 설정 (Caffeine, 서버 메모리)
- TTL 1시간 : 캐시 삭제를 놓쳤을 때의 안전장치
- maximumSize : 메모리 사용량 제한
- TransactionAwareCacheManagerProxy : 트랜잭션 안의 @CacheEvict는 커밋 이후에 삭제
  (커밋 전에 삭제하면 그 사이의 조회가 커밋 전 값을 다시 캐시할 수 있음)
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final Duration TTL = Duration.ofHours(1);
    private static final long MAXIMUM_SIZE = 100;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(CacheNames.PROFILE);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(TTL)
                .maximumSize(MAXIMUM_SIZE));
        cacheManager.setAllowNullValues(false);
        return new TransactionAwareCacheManagerProxy(cacheManager);
    }
}
