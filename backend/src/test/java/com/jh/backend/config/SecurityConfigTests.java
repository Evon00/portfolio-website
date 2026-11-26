package com.jh.backend.config;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.enums.Role;
import com.jh.backend.common.properties.JwtProperties;
import com.jh.backend.util.jwt.JwtPayload;
import com.jh.backend.util.jwt.JwtProvider;
import com.jh.backend.util.login.LoginChecker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(SecurityConfigTests.StubController.class)
class SecurityConfigTests {

    private static final JwtPayload PAYLOAD = new JwtPayload(7L, Role.ADMIN);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private JwtProperties jwtProperties;

    @Test
    @DisplayName("관리자 API는 access 토큰이 있어야 접근할 수 있다")
    void admin() throws Exception {
        mockMvc.perform(get("/api/admin/stub").header(HttpHeaders.AUTHORIZATION, bearer(jwtProvider.createAccessToken(PAYLOAD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(7));

        mockMvc.perform(get("/api/admin/stub"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("COMMON_401"))
                .andExpect(jsonPath("$.message").value("로그인이 필요하거나 인증 정보가 올바르지 않습니다. 다시 로그인해주세요."));

        mockMvc.perform(get("/api/admin/stub").header(HttpHeaders.AUTHORIZATION, bearer(jwtProvider.createRefreshToken(PAYLOAD))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("만료된 토큰은 관리자 API에서 만료로 응답하고, 공개 API에서는 정상 동작한다")
    void expired() throws Exception {
        String token = bearer(expiredToken());

        mockMvc.perform(get("/api/admin/stub").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인 시간이 만료되었습니다. 다시 로그인해주세요."));
        mockMvc.perform(get("/api/stub").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk());
    }

    @Test
    @DisplayName("ADMIN 권한이 아니면 403을 응답한다")
    void forbidden() throws Exception {
        mockMvc.perform(get("/api/admin/stub").with(user("user").authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("COMMON_403"));
    }

    @Test
    @DisplayName("공개 API는 조회만 허용하고 그 외 경로는 차단한다")
    void publicApi() throws Exception {
        mockMvc.perform(get("/api/stub")).andExpect(status().isOk());
        mockMvc.perform(get("/api/unknown")).andExpect(status().isNotFound());
        mockMvc.perform(post("/api/stub")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/unknown")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CORS는 등록한 프론트 주소만 허용한다")
    void cors() throws Exception {
        mockMvc.perform(options("/api/admin/stub").header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "PATCH").header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        mockMvc.perform(options("/api/admin/stub").header("Origin", "http://evil.example")
                        .header("Access-Control-Request-Method", "PATCH"))
                .andExpect(status().isForbidden());
    }

    private String expiredToken() {
        return new JwtProvider(new JwtProperties(jwtProperties.secret(), Duration.ofMinutes(-1), Duration.ofMinutes(-1)))
                .createAccessToken(PAYLOAD);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    @RestController
    static class StubController {

        @Autowired
        private LoginChecker loginChecker;

        @GetMapping("/api/admin/stub")
        CommonApiResponse<Long> admin() {
            return CommonApiResponse.ok(loginChecker.getAdminId());
        }

        @GetMapping("/api/stub")
        CommonApiResponse<Void> open() {
            return CommonApiResponse.ok();
        }
    }
}
