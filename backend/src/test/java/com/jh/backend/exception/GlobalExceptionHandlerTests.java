package com.jh.backend.exception;

import com.jh.backend.common.CommonApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GlobalExceptionHandlerTests.StubController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandlerTests.StubController.class)
@ExtendWith(OutputCaptureExtension.class)
class GlobalExceptionHandlerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("성공 응답은 null 필드를 제외한다")
    void ok() throws Exception {
        assertBody(get("/stub/ok"), 200, "{\"isSuccess\":true,\"message\":\"success\"}");
    }

    @Test
    @DisplayName("로그인 실패는 400 ADMIN_001")
    void loginFailed() throws Exception {
        assertBody(get("/stub/login"), 400,
                "{\"isSuccess\":false,\"code\":\"ADMIN_001\",\"message\":\"아이디 또는 비밀번호가 일치하지 않습니다.\"}");
    }

    @Test
    @DisplayName("AuthException은 401로 응답한다")
    void auth() throws Exception {
        assertError(get("/stub/auth"), ExceptionCode.REFRESH_JWT_EXPIRED, 401);
    }

    @Test
    @DisplayName("409 응답에 data를 담을 수 있다")
    void conflictWithData() throws Exception {
        assertBody(get("/stub/in-use"), 409, "{\"isSuccess\":false,\"code\":\"SKILL_001\","
                + "\"message\":\"사용 중인 기술 스택은 삭제할 수 없습니다.\",\"data\":{\"postCount\":3}}");
    }

    @Test
    @DisplayName("4xx는 warn, 5xx는 error와 스택트레이스로 기록하고 내부 메시지는 응답하지 않는다")
    void logLevel(CapturedOutput output) throws Exception {
        assertError(get("/stub/login"), ExceptionCode.ADMIN_LOGIN_FAILED, 400);
        assertThat(output.getAll()).contains("WARN").doesNotContain("ERROR");

        assertError(get("/stub/boom"), ExceptionCode.INTERNAL_SERVER_ERROR, 500);
        assertThat(output.getAll()).contains("ERROR", "internal detail", "StubController.boom(");
    }

    @Test
    @DisplayName("Validation 오류는 필드 메시지를 전달하고 입력값은 로그에 남기지 않는다")
    void validation(CapturedOutput output) throws Exception {
        String body = "{\"isSuccess\":false,\"code\":\"COMMON_400\",\"message\":\"%s\"}";
        assertBody(post("/stub/body").contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"s3cret\"}"),
                400, body.formatted("비밀번호는 8자 이상이어야 합니다."));
        assertThat(output.getAll()).contains("password(Size)").doesNotContain("s3cret");

        assertBody(get("/stub/param?page=-1"), 400, body.formatted("0 이상이어야 합니다."));
    }

    @Test
    @DisplayName("잘못된 요청은 400")
    void badRequest() throws Exception {
        assertError(post("/stub/body").contentType(MediaType.APPLICATION_JSON).content("{oops"), ExceptionCode.NOT_READABLE_JSON, 400);
        assertError(get("/stub/param"), ExceptionCode.INVALID_REQUEST_PARAM, 400);
        assertError(get("/stub/param?page=abc"), ExceptionCode.INVALID_REQUEST_PARAM, 400);
        assertError(get("/stub/model?page=abc"), ExceptionCode.INVALID_REQUEST_PARAM, 400);
        assertError(get("/stub/cookie"), ExceptionCode.INVALID_REQUEST_PARAM, 400);
        assertError(multipart("/stub/part"), ExceptionCode.INVALID_REQUEST_PARAM, 400);
        assertError(get("/stub/too-large"), ExceptionCode.FILE_SIZE_EXCEED, 400);
    }

    @Test
    @DisplayName("HTTP 규격 오류는 각각의 상태 코드로 응답한다")
    void httpErrors() throws Exception {
        assertError(get("/not-exists"), ExceptionCode.RESOURCE_NOT_FOUND, 404);
        assertError(delete("/stub/ok"), ExceptionCode.METHOD_NOT_ALLOWED, 405);
        assertError(get("/stub/ok").accept(MediaType.APPLICATION_PDF), ExceptionCode.NOT_ACCEPTABLE, 406);
        assertError(get("/stub/integrity"), ExceptionCode.DATA_INTEGRITY_VIOLATION, 409);
        assertError(post("/stub/body").contentType(MediaType.TEXT_PLAIN).content("x"), ExceptionCode.UNSUPPORTED_MEDIA_TYPE, 415);
    }

    private void assertError(RequestBuilder request, ExceptionCode code, int status) throws Exception {
        assertBody(request, status, "{\"isSuccess\":false,\"code\":\"%s\",\"message\":\"%s\"}".formatted(code.getCode(), code.getMessage()));
    }

    private void assertBody(RequestBuilder request, int status, String json) throws Exception {
        mockMvc.perform(request)
                .andExpect(status().is(status))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString(StandardCharsets.UTF_8)).isEqualTo(json));
    }

    record StubRequest(@Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.") String password) {
    }

    record StubQuery(Integer page) {
    }

    @RestController
    @RequestMapping("/stub")
    static class StubController {

        @GetMapping("/ok")
        CommonApiResponse<Void> ok() {
            return CommonApiResponse.ok();
        }

        @GetMapping("/login")
        void login() {
            throw new CustomException(ExceptionCode.ADMIN_LOGIN_FAILED);
        }

        @GetMapping("/auth")
        void auth() {
            throw new AuthException(ExceptionCode.REFRESH_JWT_EXPIRED);
        }

        @GetMapping("/in-use")
        void inUse() {
            throw new CustomException(ExceptionCode.SKILL_IN_USE, Map.of("postCount", 3));
        }

        @GetMapping("/boom")
        void boom() {
            throw new IllegalStateException("internal detail");
        }

        @GetMapping("/integrity")
        void integrity() {
            throw new DataIntegrityViolationException("duplicate key");
        }

        @GetMapping("/too-large")
        void tooLarge() {
            throw new MaxUploadSizeExceededException(1);
        }

        @PostMapping("/body")
        void body(@Valid @RequestBody StubRequest request) {
        }

        @GetMapping("/param")
        void param(@RequestParam @Min(value = 0, message = "0 이상이어야 합니다.") int page) {
        }

        @GetMapping("/model")
        void model(@Valid @ModelAttribute StubQuery query) {
        }

        @GetMapping("/cookie")
        void cookie(@CookieValue String refreshToken) {
        }

        @PostMapping("/part")
        void part(@RequestPart MultipartFile file) {
        }
    }
}
