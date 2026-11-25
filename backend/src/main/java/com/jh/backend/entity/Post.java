package com.jh.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.SQLRestriction;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "jh_post")
@Comment(value = "게시글")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends DefaultRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "게시글 PK")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    @Comment(value = "관리자 FK")
    private Admin admin;

    @Column(nullable = false, length = 100)
    @Comment(value = "게시글 제목")
    private String title;

    @Column(nullable = false, length = 200)
    @Comment(value = "게시글 요약")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment(value = "게시글 내용")
    private String content;

    // 등록 후 변경 불가
    @Column(nullable = false, updatable = false, length = 100)
    @Comment(value = "게시글 슬러그")
    private String slug;

    // 조회수는 동시 요청에도 정확하도록 쿼리로만 증가 (엔티티 수정 시 덮어쓰지 않음)
    @Column(nullable = false, updatable = false)
    @Comment(value = "게시글 조회수")
    private Long view;

    @Column(name = "modified_at")
    @Comment(value = "게시글 수정일자 (본문 수정 시에만 갱신, 조회수 변경 시 미갱신)")
    private OffsetDateTime modifiedAt;

    @Column(name = "thumbnail_s3_key")
    @Comment(value = "게시글 썸네일 s3 key (본문 첫 번째 이미지, NULL : 이미지 없음)")
    private String thumbnailS3Key;

    @Builder
    private Post(Admin admin, String title, String summary, String content, String slug, String thumbnailS3Key) {
        this.admin = admin;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.slug = slug;
        this.view = 0L;
        this.thumbnailS3Key = thumbnailS3Key;
    }

    // 게시글 수정
    public void update(String title, String summary, String content, String thumbnailS3Key) {
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.thumbnailS3Key = thumbnailS3Key;
        this.modifiedAt = OffsetDateTime.now();
    }
}
