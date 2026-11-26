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

@Getter
@Entity
@Table(name = "jh_admin_skill")
@Comment(value = "관리자 기술스택")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminSkill extends BaseRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "관리자 기술스택 PK")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    @Comment(value = "관리자 FK")
    private Admin admin;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    @Comment(value = "기술스택 FK")
    private Skill skill;

    @Column(nullable = false)
    @Comment(value = "관리자 기술스택 순서")
    private Integer priority;

    @Builder
    private AdminSkill(Admin admin, Skill skill, Integer priority) {
        this.admin = admin;
        this.skill = skill;
        this.priority = priority;
    }
}
