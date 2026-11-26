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

import java.net.InetAddress;

@Getter
@Entity
@Table(name = "jh_post_view_log")
@Comment(value = "게시글 조회 로그")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostViewLog extends BaseRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment(value = "게시글 조회 로그 PK")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    @Comment(value = "게시글 FK")
    private Post post;

    @Column(name = "ip_address", nullable = false)
    @Comment(value = "게시글 조회 로그 아이피")
    private InetAddress ipAddress;

    @Column(name = "user_agent", nullable = false, columnDefinition = "TEXT")
    @Comment(value = "게시글 조회 로그 브라우저 정보")
    private String userAgent;

    @Builder
    private PostViewLog(Post post, InetAddress ipAddress, String userAgent) {
        this.post = post;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
