package com.jh.backend.util.validator;

import com.jh.backend.util.validator.enums.ValidEnum;
import com.jh.backend.util.validator.unique.UniqueBy;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.ValidationException;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.hibernate.validator.constraints.UniqueElements;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ValidatorTests {

    private static ValidatorFactory factory;
    private static Validator validator;

    enum Type {POST, PROJECT}

    record Media(Long mediaId, Integer fileIndex, String name) {
    }

    record Parent(Media media) {
    }

    record EnumRequest(@ValidEnum(enumClass = Type.class, message = "잘못된 종류입니다.") String type) {
    }

    record NullableEnumRequest(@ValidEnum(enumClass = Type.class, nullable = true) String type) {
    }

    record MediaRequest(
            @UniqueBy(property = "mediaId")
            @UniqueBy(property = "fileIndex", message = "파일이 중복되었습니다.")
            List<Media> medias
    ) {
    }

    record IgnoreCaseRequest(@UniqueBy(property = "name", ignoreCase = true) List<Media> medias) {
    }

    record NotIgnoreNullRequest(@UniqueBy(property = "name", ignoreNull = false) List<Media> medias) {
    }

    record NestedRequest(@UniqueBy(property = "media.mediaId") List<Parent> parents) {
    }

    record WrongPropertyRequest(@UniqueBy(property = "nothing") List<Media> medias) {
    }

    record IdsRequest(@UniqueElements List<Long> skillIds) {
    }

    static class GetterItem {
        private final boolean active;

        GetterItem(boolean active) {
            this.active = active;
        }

        public boolean isActive() {
            return active;
        }
    }

    record GetterRequest(@UniqueBy(property = "active") List<GetterItem> items) {
    }

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    @DisplayName("ValidEnum은 enum 이름과 정확히 일치해야 통과한다")
    void validEnum() {
        assertThat(messages(new EnumRequest("POST"))).isEmpty();
        assertThat(messages(new EnumRequest("post"))).containsExactly("잘못된 종류입니다.");
        assertThat(messages(new EnumRequest(""))).containsExactly("잘못된 종류입니다.");
    }

    @Test
    @DisplayName("ValidEnum의 null은 nullable에 따라 처리한다")
    void validEnumNull() {
        assertThat(messages(new EnumRequest(null))).containsExactly("잘못된 종류입니다.");
        assertThat(messages(new NullableEnumRequest(null))).isEmpty();
        assertThat(messages(new NullableEnumRequest("NONE"))).containsExactly("잘못된 변수값입니다.");
    }

    @Test
    @DisplayName("UniqueBy는 null 리스트와 null 값을 허용한다")
    void uniqueBy() {
        assertThat(messages(new MediaRequest(null))).isEmpty();
        assertThat(messages(new MediaRequest(List.of()))).isEmpty();
        assertThat(messages(new MediaRequest(Arrays.asList(
                new Media(1L, null, null), new Media(2L, null, null), null,
                new Media(null, 0, null), new Media(null, 1, null))))).isEmpty();
    }

    @Test
    @DisplayName("UniqueBy는 프로퍼티별 메시지를 전달한다")
    void uniqueByMessage() {
        assertThat(messages(new MediaRequest(List.of(new Media(1L, 0, null), new Media(1L, 1, null)))))
                .containsExactly("리스트 내 mediaId 값이 중복될 수 없습니다.");
        assertThat(messages(new MediaRequest(List.of(new Media(1L, 0, null), new Media(2L, 0, null)))))
                .containsExactly("파일이 중복되었습니다.");
    }

    @Test
    @DisplayName("UniqueBy 옵션과 중첩 프로퍼티, getter를 지원한다")
    void uniqueByOptions() {
        assertThat(messages(new IgnoreCaseRequest(List.of(new Media(1L, 0, "Redis"), new Media(2L, 1, "redis"))))).hasSize(1);
        assertThat(messages(new NotIgnoreNullRequest(List.of(new Media(1L, 0, null), new Media(2L, 1, null))))).hasSize(1);
        assertThat(messages(new NestedRequest(List.of(new Parent(new Media(1L, 0, null)), new Parent(new Media(1L, 1, null)))))).hasSize(1);
        assertThat(messages(new NestedRequest(List.of(new Parent(null), new Parent(null))))).isEmpty();
        assertThat(messages(new GetterRequest(List.of(new GetterItem(true), new GetterItem(true))))).hasSize(1);
    }

    @Test
    @DisplayName("UniqueBy에 없는 프로퍼티를 지정하면 예외가 발생한다")
    void uniqueByWrongProperty() {
        WrongPropertyRequest request = new WrongPropertyRequest(List.of(new Media(1L, 0, null)));

        assertThatThrownBy(() -> validator.validate(request)).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("숫자 배열의 중복은 UniqueElements로 검증한다")
    void uniqueElements() {
        assertThat(messages(new IdsRequest(List.of(1L, 2L)))).isEmpty();
        assertThat(messages(new IdsRequest(List.of(1L, 1L)))).hasSize(1);
    }

    private List<String> messages(Object request) {
        return validator.validate(request).stream().map(ConstraintViolation::getMessage).toList();
    }
}
