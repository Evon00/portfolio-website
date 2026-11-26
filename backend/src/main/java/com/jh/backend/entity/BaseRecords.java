package com.jh.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

// 생성일, 수정일 (연결 테이블, 조회 로그)
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseRecords {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment(value = "데이터 생성일")
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Comment(value = "데이터 수정일")
    private OffsetDateTime updatedAt;
}
