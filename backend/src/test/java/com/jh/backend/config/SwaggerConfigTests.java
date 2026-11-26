package com.jh.backend.config;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.common.annotation.JwtNotRequired;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(SwaggerConfigTests.StubController.class)
class SwaggerConfigTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    private JsonNode docs;

    @BeforeEach
    void setUp() throws Exception {
        String json = mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        docs = jsonMapper.readTree(json);
    }

    @Test
    @DisplayName("JwtNotRequired API에는 401, 403과 자물쇠가 표시되지 않는다")
    void publicApi() {
        JsonNode operation = docs.at("/paths/~1stub-docs~1public~1{postSlug}/get");

        assertThat(operation.get("responses").propertyNames()).containsExactly("200", "404");
        assertThat(operation.has("security")).isFalse();
        assertThat(operation.at("/responses/404/content/application~1json/examples/POST_001 - 게시글을 찾을 수 없습니다./value").toString())
                .isEqualTo("{\"isSuccess\":false,\"code\":\"POST_001\",\"message\":\"게시글을 찾을 수 없습니다.\"}");
    }

    @Test
    @DisplayName("JwtNotRequired가 없으면 401, 403이 표시된다")
    void authErrors() {
        assertThat(docs.at("/paths/~1stub-docs~1page/get/responses").propertyNames()).containsExactly("200", "401", "403");
    }

    @Test
    @DisplayName("같은 상태 코드의 에러는 합쳐지고 상태 코드 순으로 표시된다")
    void mergeErrors() {
        JsonNode responses = docs.at("/paths/~1stub-docs~1admin/post/responses");

        assertThat(responses.propertyNames()).containsExactly("200", "400", "401", "403", "409");
        assertThat(responses.at("/400/content/application~1json/examples").size()).isEqualTo(2);
        assertThat(responses.at("/401/content/application~1json/examples").size()).isEqualTo(2);
        assertThat(docs.at("/paths/~1stub-docs~1admin/post/security/0").has("Authorization")).isTrue();
    }

    @Test
    @DisplayName("multipart의 JSON 파트와 파일 배열이 올바르게 표시된다")
    void multipart() {
        JsonNode multipart = docs.at("/paths/~1stub-docs~1admin/post/requestBody/content/multipart~1form-data");

        assertThat(multipart.at("/encoding/data/contentType").asString()).isEqualTo("application/json");
        assertThat(multipart.at("/encoding").has("files")).isFalse();
        assertThat(multipart.at("/schema/properties/files/items/format").asString()).isEqualTo("binary");
    }

    @Test
    @DisplayName("성공 응답 스키마는 실제 응답 필드와 같다")
    void schemas() {
        assertThat(docs.at("/paths/~1stub-docs~1page/get/responses/200/content").propertyNames()).containsExactly("application/json");
        assertThat(docs.at("/components/schemas/CommonApiResponseStubResponse/properties").propertyNames())
                .containsExactly("isSuccess", "message", "data");
        assertThat(docs.at("/components/schemas/CommonApiResponseVoid/properties").propertyNames())
                .containsExactly("isSuccess", "message");
        assertThat(docs.at("/components/schemas/PageResponseDtoStubResponse/properties").propertyNames())
                .containsExactly("pageNumber", "pageSize", "isFirst", "isLast", "totalPages", "totalElements", "content");
    }

    @Test
    @DisplayName("Swagger 화면은 인증 없이, 그 외 경로는 인증이 있어야 접근할 수 있다")
    void access() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
        mockMvc.perform(get("/stub-docs/page")).andExpect(status().isUnauthorized());
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(summary = "공개 상세", description = "설명")
    @JwtNotRequired
    @ApiExceptionDocs(ExceptionCode.POST_NOT_FOUND)
    @interface GetPublicSwaggerDocs {
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Operation(summary = "관리자 등록", security = @SecurityRequirement(name = "Authorization"))
    @ApiExceptionDocs({ExceptionCode.VALID_ERROR, ExceptionCode.FILE_SIZE_EXCEED, ExceptionCode.JWT_INVALID, ExceptionCode.PROJECT_SLUG_DUPLICATED})
    @interface PostAdminSwaggerDocs {
    }

    record StubResponse(@Schema(description = "게시글 PK", example = "4") Long postId) {
    }

    record StubRequest(@Schema(example = "제목") String title) {
    }

    @RestController
    @RequestMapping("/stub-docs")
    static class StubController {

        @GetPublicSwaggerDocs
        @GetMapping("/public/{postSlug}")
        CommonApiResponse<StubResponse> getPublic(@PathVariable String postSlug) {
            return CommonApiResponse.ok();
        }

        @GetMapping("/page")
        CommonApiResponse<PageResponseDto<StubResponse>> getPage() {
            return CommonApiResponse.ok();
        }

        @PostAdminSwaggerDocs
        @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        CommonApiResponse<Void> postAdmin(@Valid @RequestPart StubRequest data, @RequestPart(required = false) List<MultipartFile> files) {
            return CommonApiResponse.ok();
        }
    }
}
