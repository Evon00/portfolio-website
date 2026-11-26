package com.jh.backend.util.jwt;

import com.jh.backend.exception.AuthException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/*
JWT 필터
- 요청 Header에서 액세스 토큰을 추출하여 Authentication을 생성합니다.
- 토큰이 없거나 잘못된 경우에도 통과하며, 실패 사유는 JwtAuthenticationEntryPoint에서 응답합니다.
  (공개 API는 만료된 토큰을 함께 보내도 정상 동작)
- 서블릿 필터로 중복 등록되지 않도록 Bean이 아닌 SecurityConfig에서 생성합니다.
 */
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    public static final String AUTH_ERROR = JwtFilter.class.getName() + ".AUTH_ERROR";

    private static final String BEARER = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String accessToken = resolveToken(request);

        if (accessToken != null) {
            try {
                authenticate(new CustomUserDetails(jwtProvider.parse(accessToken, TokenType.ACCESS)));
            } catch (AuthException ex) {
                request.setAttribute(AUTH_ERROR, ex);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void authenticate(CustomUserDetails userDetails) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(userDetails, null, userDetails.getAuthorities()));
        SecurityContextHolder.setContext(context);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        return header != null && header.startsWith(BEARER) ? header.substring(BEARER.length()) : null;
    }
}
