package com.jh.backend.config;

import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.common.annotation.JwtNotRequired;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.Encoding;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springdoc.core.customizers.GlobalOperationCustomizer;
import org.springframework.aop.support.AopUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.HandlerMethod;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "Authorization";
    private static final String JSON = org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
    private static final String MULTIPART = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Access Token을 입력해주세요. (Bearer 제외)")))
                .info(new Info()
                        .title("Portfolio API")
                        .version("1.0.0")
                        .description("포트폴리오 사이트 API 명세서입니다. <br> 기본적인 인증은 JWT 기반이며, Bearer 인증을 이용합니다."));
    }

    /*
    ExceptionCode 기반 자동 Swagger 작성
    - @ApiExceptionDocs : API별 에러
    - @RestControllerAdvice의 @ApiExceptionDocs : 공통 인증 에러 (@JwtNotRequired가 있으면 제외)
     */
    @Bean
    public GlobalOperationCustomizer exceptionDocsCustomizer(ApplicationContext applicationContext) {
        return (operation, handlerMethod) -> {
            ApiExceptionDocs docs = handlerMethod.getMethodAnnotation(ApiExceptionDocs.class);
            if (docs != null) {
                addExceptions(operation, Arrays.asList(docs.value()));
            }
            if (!isJwtNotRequired(handlerMethod)) {
                addExceptions(operation, findGlobalExceptions(applicationContext));
            }
            sortByStatus(operation);
            return operation;
        };
    }

    /*
    multipart/form-data의 JSON 파트(data) Content-Type 지정
    - 지정하지 않으면 Swagger 화면에서 실행할 때 415 오류 발생
     */
    @Bean
    public GlobalOperationCustomizer multipartJsonCustomizer() {
        return (operation, handlerMethod) -> {
            if (operation.getRequestBody() == null || operation.getRequestBody().getContent() == null) {
                return operation;
            }
            MediaType multipart = operation.getRequestBody().getContent().get(MULTIPART);
            if (multipart == null || multipart.getSchema() == null || multipart.getSchema().getProperties() == null) {
                return operation;
            }
            multipart.getSchema().getProperties().forEach((name, schema) -> {
                if (((Schema<?>) schema).get$ref() != null) {
                    multipart.addEncoding(String.valueOf(name), new Encoding().contentType(JSON));
                }
            });
            return operation;
        };
    }

    /*
    데이터가 없는 응답(CommonApiResponse<Void>)은 실제 응답과 같이 data를 표시하지 않음
     */
    @Bean
    public GlobalOpenApiCustomizer voidResponseCustomizer() {
        return openApi -> {
            if (openApi.getComponents().getSchemas() == null) return;
            Schema<?> schema = openApi.getComponents().getSchemas().get("CommonApiResponseVoid");
            if (schema != null) {
                schema.getProperties().remove("data");
            }
        };
    }

    private boolean isJwtNotRequired(HandlerMethod handlerMethod) {
        return handlerMethod.hasMethodAnnotation(JwtNotRequired.class)
                || AnnotatedElementUtils.hasAnnotation(handlerMethod.getBeanType(), JwtNotRequired.class);
    }

    private List<ExceptionCode> findGlobalExceptions(ApplicationContext applicationContext) {
        return applicationContext.getBeansWithAnnotation(RestControllerAdvice.class).values().stream()
                .flatMap(bean -> Arrays.stream(AopUtils.getTargetClass(bean).getMethods()))
                .filter(method -> method.isAnnotationPresent(ExceptionHandler.class))
                .map(method -> AnnotatedElementUtils.findMergedAnnotation(method, ApiExceptionDocs.class))
                .filter(docs -> docs != null)
                .flatMap(docs -> Arrays.stream(docs.value()))
                .toList();
    }

    // 같은 상태 코드의 응답이 있으면 예시를 합친다
    private void addExceptions(Operation operation, List<ExceptionCode> codes) {
        if (operation.getResponses() == null) {
            operation.setResponses(new ApiResponses());
        }
        codes.forEach(code -> {
            ApiResponse response = operation.getResponses().computeIfAbsent(
                    String.valueOf(code.getStatus().value()),
                    status -> new ApiResponse().description(description(code.getStatus())));

            if (response.getContent() == null) {
                response.setContent(new Content());
            }
            response.getContent()
                    .computeIfAbsent(JSON, type -> new MediaType())
                    .addExamples(code.getCode() + " - " + code.getMessage(), toExample(code));
        });
    }

    private void sortByStatus(Operation operation) {
        if (operation.getResponses() == null) return;
        ApiResponses sorted = new ApiResponses();
        sorted.putAll(new TreeMap<>(operation.getResponses()));
        operation.setResponses(sorted);
    }

    private Example toExample(ExceptionCode code) {
        Map<String, Object> value = new LinkedHashMap<>();
        value.put("isSuccess", false);
        value.put("code", code.getCode());
        value.put("message", code.getMessage());
        return new Example().value(value);
    }

    private String description(HttpStatus status) {
        return switch (status) {
            case UNAUTHORIZED, FORBIDDEN -> "인증 및 권한 오류";
            case NOT_FOUND -> "존재하지 않는 데이터";
            case CONFLICT -> "데이터 충돌";
            case TOO_MANY_REQUESTS -> "요청 횟수 초과";
            default -> "잘못된 호출";
        };
    }
}
