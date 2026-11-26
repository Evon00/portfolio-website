package com.jh.backend.util.ip;

import com.jh.backend.common.properties.RateLimitProperties;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.PathContainer;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/*
IP별 요청 횟수 제한 필터
- Key : rate-limit:{규칙명}:{IP}
- 여러 규칙에 해당하면 가장 구체적인 경로의 규칙 하나만 적용합니다.
- 인코딩된 주소로 우회할 수 없도록 디코딩된 경로로 비교합니다. (PathPattern)
- 서블릿 필터로 중복 등록되지 않도록 Bean이 아닌 SecurityConfig에서 생성합니다.
 */
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final String KEY_PREFIX = "rate-limit:";

    // 허용 : 0, 초과 : 남은 시간(ms)
    private static final RedisScript<Long> SCRIPT = new DefaultRedisScript<>("""
            local current = tonumber(redis.call('GET', KEYS[1]) or '0')
            if current >= tonumber(ARGV[1]) then
                return math.max(redis.call('PTTL', KEYS[1]), 1)
            end
            if redis.call('INCR', KEYS[1]) == 1 then
                redis.call('PEXPIRE', KEYS[1], ARGV[2])
            end
            return 0
            """, Long.class);

    private record MatchedRule(PathPattern pattern, String name, RateLimitProperties.Rule rule) {
    }

    private final StringRedisTemplate redisTemplate;
    private final HandlerExceptionResolver handlerExceptionResolver;
    private final List<MatchedRule> rules;

    public RateLimitFilter(RateLimitProperties properties, StringRedisTemplate redisTemplate, HandlerExceptionResolver handlerExceptionResolver) {
        this.redisTemplate = redisTemplate;
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.rules = properties.rules().entrySet().stream()
                .flatMap(entry -> entry.getValue().paths().stream()
                        .map(path -> new MatchedRule(PathPatternParser.defaultInstance.parse(path), entry.getKey(), entry.getValue())))
                .sorted(Comparator.comparing(MatchedRule::pattern))
                .toList();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Optional<MatchedRule> matched = findRule(request);

        if (matched.isEmpty() || isAllowed(matched.get(), request, response)) {
            filterChain.doFilter(request, response);
        }
    }

    private boolean isAllowed(MatchedRule matched, HttpServletRequest request, HttpServletResponse response) {
        RateLimitProperties.Rule rule = matched.rule();
        String ip = IpUtils.getClientIp(request);
        Long remaining;

        try {
            remaining = redisTemplate.execute(SCRIPT, List.of(KEY_PREFIX + matched.name() + ":" + ip),
                    String.valueOf(rule.maxRequests()), String.valueOf(rule.window().toMillis()));
        } catch (Exception ex) {
            if (rule.failOpen()) {
                log.warn("Rate Limit Redis 장애 - 통과 (rule = {}) : {}", matched.name(), ex.getMessage());
                return true;
            }
            handlerExceptionResolver.resolveException(request, response, null, ex);
            return false;
        }

        if (remaining == null || remaining == 0) {
            return true;
        }

        log.warn("Rate Limit 초과 - rule = {}, ip = {}", matched.name(), ip);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(Math.ceilDiv(remaining, 1000L)));
        handlerExceptionResolver.resolveException(request, response, null, new CustomException(ExceptionCode.TOO_MANY_REQUESTS));
        return false;
    }

    // 구체적인 경로 순으로 정렬되어 있어 처음 일치하는 규칙을 사용
    private Optional<MatchedRule> findRule(HttpServletRequest request) {
        PathContainer path = PathContainer.parsePath(request.getRequestURI());
        return rules.stream().filter(rule -> rule.pattern().matches(path)).findFirst();
    }
}
