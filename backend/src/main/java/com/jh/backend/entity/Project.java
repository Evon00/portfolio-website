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

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "jh_project")
@Comment(value = "프로젝트")
@SQLRestriction("deleted_at IS NULL")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Project extends DefaultRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "프로젝트 PK")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    @Comment(value = "관리자 FK")
    private Admin admin;

    @Column(nullable = false, length = 100)
    @Comment(value = "프로젝트 제목")
    private String title;

    @Column(nullable = false, length = 200)
    @Comment(value = "프로젝트 요약")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment(value = "프로젝트 내용")
    private String content;

    @Column(name = "github_url", length = 300)
    @Comment(value = "프로젝트 깃허브 URL")
    private String githubUrl;

    @Column(name = "github_is_public", nullable = false)
    @Comment(value = "프로젝트 깃허브 공개 여부 ( false : 미공개 / true : 공개)")
    private boolean githubIsPublic;

    @Column(length = 300)
    @Comment(value = "프로젝트 배포 URL")
    private String url;

    @Column(name = "start_date", nullable = false)
    @Comment(value = "프로젝트 시작날짜")
    private LocalDate startDate;

    @Column(name = "end_date")
    @Comment(value = "프로젝트 종료날짜 (NULL : 진행중)")
    private LocalDate endDate;

    // 등록 후 변경 불가
    @Column(nullable = false, updatable = false, length = 100)
    @Comment(value = "프로젝트 슬러그")
    private String slug;

    @Column(nullable = false)
    @Comment(value = "프로젝트 순서")
    private Integer priority;

    @Builder
    private Project(Admin admin, String title, String summary, String content, String githubUrl, boolean githubIsPublic,
                    String url, LocalDate startDate, LocalDate endDate, String slug, Integer priority) {
        this.admin = admin;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.githubUrl = githubUrl;
        this.githubIsPublic = githubIsPublic;
        this.url = url;
        this.startDate = startDate;
        this.endDate = endDate;
        this.slug = slug;
        this.priority = priority;
    }

    // 프로젝트 수정
    public void update(String title, String summary, String content, String githubUrl, boolean githubIsPublic,
                       String url, LocalDate startDate, LocalDate endDate) {
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.githubUrl = githubUrl;
        this.githubIsPublic = githubIsPublic;
        this.url = url;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // 순서 변경
    public void changePriority(Integer priority) {
        this.priority = priority;
    }
}
