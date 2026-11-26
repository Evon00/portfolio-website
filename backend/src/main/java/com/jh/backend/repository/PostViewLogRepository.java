package com.jh.backend.repository;

import com.jh.backend.entity.PostViewLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.net.InetAddress;
import java.time.OffsetDateTime;

public interface PostViewLogRepository extends JpaRepository<PostViewLog, Long> {

    // 기준 시각 이후 같은 IP의 조회 기록 여부 (인덱스 post_id, ip_address, created_at)
    boolean existsByPostIdAndIpAddressAndCreatedAtAfter(Long postId, InetAddress ipAddress, OffsetDateTime createdAt);
}
