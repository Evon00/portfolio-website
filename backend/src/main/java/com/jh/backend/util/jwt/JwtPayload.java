package com.jh.backend.util.jwt;

import com.jh.backend.common.enums.Role;

public record JwtPayload(Long id, Role role) {
}
