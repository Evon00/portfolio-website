package com.jh.backend.util.jwt;

import com.jh.backend.common.properties.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import java.util.List;

/*
Redis 리프레시 토큰 저장소
- Key : refresh:{adminId} (관리자별 1개만 유지)
- 비교와 변경을 한 번에 처리하여, 동시 요청에도 토큰 하나는 한 번만 사용됩니다.
 */
@Component
@RequiredArgsConstructor
public class RefreshTokenStore {

    private static final String KEY_PREFIX = "refresh:";

    private static final RedisScript<Long> ROTATE = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
                return 1
            end
            return 0
            """, Long.class);

    private static final RedisScript<Long> DELETE = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
            end
            return 0
            """, Long.class);

    private final StringRedisTemplate redisTemplate;
    private final JwtProperties jwtProperties;

    // 저장 (기존 토큰은 덮어씀)
    public void save(Long adminId, String refreshToken) {
        redisTemplate.opsForValue().set(key(adminId), refreshToken, jwtProperties.refreshTokenExpiry());
    }

    // 저장된 토큰과 같을 때만 새 토큰으로 교체
    public boolean rotate(Long adminId, String oldToken, String newToken) {
        Long result = redisTemplate.execute(ROTATE, List.of(key(adminId)), oldToken, newToken,
                String.valueOf(jwtProperties.refreshTokenExpiry().toMillis()));
        return Long.valueOf(1).equals(result);
    }

    // 저장된 토큰과 같을 때만 삭제
    public void delete(Long adminId, String refreshToken) {
        redisTemplate.execute(DELETE, List.of(key(adminId)), refreshToken);
    }

    private String key(Long adminId) {
        return KEY_PREFIX + adminId;
    }
}
