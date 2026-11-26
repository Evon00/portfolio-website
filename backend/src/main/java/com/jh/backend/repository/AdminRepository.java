package com.jh.backend.repository;

import com.jh.backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsername(String username);

    // 관리자 1명 조회 (삭제되지 않은 관리자 중 PK가 가장 작은 관리자)
    Optional<Admin> findFirstByOrderByIdAsc();
}
