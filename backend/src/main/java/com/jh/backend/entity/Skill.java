package com.jh.backend.entity;

import com.jh.backend.common.enums.MediaExt;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Entity
@Table(name = "jh_skill")
@Comment(value = "기술스택")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Skill extends DefaultRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "기술스택 PK")
    private Long id;

    @Column(nullable = false, length = 100)
    @Comment(value = "기술스택 이름")
    private String name;

    @Column(nullable = false, length = 100)
    @Comment(value = "기술스택 카테고리")
    private String category;

    @Column(name = "original_name", nullable = false, length = 200)
    @Comment(value = "기술스택 미디어 원본명")
    private String originalName;

    @Column(name = "s3_key", nullable = false)
    @Comment(value = "기술스택 s3 key")
    private String s3Key;

    @Column(nullable = false, length = 10)
    @Comment(value = "기술스택 미디어 크기")
    private String size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment(value = "기술스택 미디어 확장자 (CHECK : JPG, PNG, GIF, WEBP, SVG)")
    private MediaExt ext;

    @Builder
    private Skill(String name, String category, String originalName, String s3Key, String size, MediaExt ext) {
        this.name = name;
        this.category = category;
        this.originalName = originalName;
        this.s3Key = s3Key;
        this.size = size;
        this.ext = ext;
    }

    // 기본 정보 수정
    public void update(String name, String category) {
        this.name = name;
        this.category = category;
    }

    // 아이콘 교체
    public void updateIcon(String originalName, String s3Key, String size, MediaExt ext) {
        this.originalName = originalName;
        this.s3Key = s3Key;
        this.size = size;
        this.ext = ext;
    }

    // 아이콘 삭제
    public void deleteIcon() {
        updateIcon(null, null, null, null);
    }
}
