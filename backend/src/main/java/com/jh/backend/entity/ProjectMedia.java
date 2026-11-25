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
@Table(name = "jh_project_media")
@Comment(value = "프로젝트 미디어")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectMedia extends DefaultRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "프로젝트 미디어 PK")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    @Comment(value = "프로젝트 FK")
    private Project project;

    @Column(name = "original_name", nullable = false, length = 200)
    @Comment(value = "프로젝트 미디어 원본명")
    private String originalName;

    @Column(name = "s3_key", nullable = false)
    @Comment(value = "프로젝트 미디어 s3 key")
    private String s3Key;

    @Column(nullable = false, length = 10)
    @Comment(value = "프로젝트 미디어 크기")
    private String size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment(value = "프로젝트 미디어 확장자 (CHECK : JPG, PNG, GIF, WEBP)")
    private MediaExt ext;

    @Column(length = 50)
    @Comment(value = "프로젝트 미디어 캡션")
    private String caption;

    @Column(name = "is_important", nullable = false)
    @Comment(value = "프로젝트 미디어 대표 여부 ( false : 일반 이미지 / true : 대표 이미지)")
    private boolean important;

    @Column(nullable = false)
    @Comment(value = "프로젝트 미디어 순서")
    private Integer priority;

    @Builder
    private ProjectMedia(Project project, String originalName, String s3Key, String size, MediaExt ext,
                         String caption, boolean important, Integer priority) {
        this.project = project;
        this.originalName = originalName;
        this.s3Key = s3Key;
        this.size = size;
        this.ext = ext;
        this.caption = caption;
        this.important = important;
        this.priority = priority;
    }

    // 이미지 정보 수정
    public void update(String caption, boolean important, Integer priority) {
        this.caption = caption;
        this.important = important;
        this.priority = priority;
    }
}
