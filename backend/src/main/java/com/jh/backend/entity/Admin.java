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
@Table(name = "jh_admin")
@Comment(value = "관리자")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Admin extends DefaultRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "관리자 PK")
    private Long id;

    @Column(nullable = false, length = 20)
    @Comment(value = "관리자 아이디")
    private String username;

    @Column(nullable = false, length = 200)
    @Comment(value = "관리자 비밀번호")
    private String password;

    @Column(nullable = false, length = 10)
    @Comment(value = "관리자 이름")
    private String name;

    @Column(nullable = false, length = 200)
    @Comment(value = "관리자 자기소개")
    private String description;

    @Column(name = "github_url", length = 300)
    @Comment(value = "관리자 깃허브 URL")
    private String githubUrl;

    @Column(length = 300)
    @Comment(value = "관리자 이메일")
    private String email;

    @Column(name = "profile_s3_key")
    @Comment(value = "관리자 프로필 s3 키")
    private String profileS3Key;

    @Column(name = "profile_size", length = 10)
    @Comment(value = "관리자 프로필 크기")
    private String profileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_ext", length = 10)
    @Comment(value = "관리자 프로필 확장자 (CHECK : JPG, PNG, GIF, WEBP)")
    private MediaExt profileExt;

    @Builder
    private Admin(String username, String password, String name, String description, String githubUrl, String email) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.description = description;
        this.githubUrl = githubUrl;
        this.email = email;
    }

    // 프로필 수정
    public void updateProfile(String name, String description, String githubUrl, String email) {
        this.name = name;
        this.description = description;
        this.githubUrl = githubUrl;
        this.email = email;
    }

    // 프로필 이미지 교체
    public void updateProfileImage(String profileS3Key, String profileSize, MediaExt profileExt) {
        this.profileS3Key = profileS3Key;
        this.profileSize = profileSize;
        this.profileExt = profileExt;
    }
}
