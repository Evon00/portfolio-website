package com.jh.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.hibernate.annotations.Comment;

import java.time.OffsetDateTime;

/*
생성일, 수정일, 삭제일
- 상속받는 엔티티에는 @SQLRestriction("deleted_at IS NULL") 을 함께 선언
 */
@Getter
@MappedSuperclass
public abstract class DefaultRecords extends BaseRecords {

    @Column(name = "deleted_at")
    @Comment(value = "데이터 삭제일")
    private OffsetDateTime deletedAt;

    // soft delete
    public void delete() {
        if (deletedAt == null) {
            deletedAt = OffsetDateTime.now();
        }
    }
}
