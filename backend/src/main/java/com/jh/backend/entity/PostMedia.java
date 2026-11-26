package com.jh.backend.entity;

import com.jh.backend.common.enums.MediaExt;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

@Getter
@Entity
@Table(name = "jh_post_media")
@Comment(value = "게시글 미디어")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostMedia extends DefaultRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "게시글 미디어 PK")
    private Long id;

    // null : 아직 게시글에 연결되지 않은 이미지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @Comment(value = "게시글 FK")
    private Post post;

    @Column(name = "original_name", nullable = false, length = 200)
    @Comment(value = "게시글 미디어 원본명")
    private String originalName;

    @Column(name = "s3_key", nullable = false)
    @Comment(value = "게시글 미디어 s3 key")
    private String s3Key;

    @Column(nullable = false, length = 10)
    @Comment(value = "게시글 미디어 크기")
    private String size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment(value = "게시글 미디어 확장자 (CHECK : JPG, PNG, GIF, WEBP)")
    private MediaExt ext;

    @Column(length = 50)
    @Comment(value = "게시글 미디어 캡션")
    private String caption;

    @Builder
    private PostMedia(String originalName, String s3Key, String size, MediaExt ext) {
        this.originalName = originalName;
        this.s3Key = s3Key;
        this.size = size;
        this.ext = ext;
    }

    // 게시글에 연결
    public void linkPost(Post post, String caption) {
        this.post = post;
        this.caption = caption;
    }

    // 게시글 연결 해제 (이후 스케줄러가 정리)
    public void unlinkPost() {
        this.post = null;
        this.caption = null;
    }
}
