-- ============================================================
-- 관리자
-- ============================================================
CREATE TABLE jh_admin
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username       VARCHAR(20)  NOT NULL,
    password       VARCHAR(200) NOT NULL,
    name           VARCHAR(10)  NOT NULL,
    description    VARCHAR(200) NOT NULL,
    github_url     VARCHAR(300),
    email          VARCHAR(300),
    profile_s3_key VARCHAR(255),
    profile_size   VARCHAR(10),
    profile_ext    VARCHAR(10),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT ck_jh_admin_profile_ext CHECK (profile_ext IN ('JPG', 'PNG', 'GIF', 'WEBP'))
);

CREATE UNIQUE INDEX uk_jh_admin_username ON jh_admin (username) WHERE deleted_at IS NULL;

COMMENT ON TABLE jh_admin IS '관리자';
COMMENT ON COLUMN jh_admin.id IS '관리자 PK';
COMMENT ON COLUMN jh_admin.username IS '관리자 아이디';
COMMENT ON COLUMN jh_admin.password IS '관리자 비밀번호';
COMMENT ON COLUMN jh_admin.name IS '관리자 이름';
COMMENT ON COLUMN jh_admin.description IS '관리자 자기소개';
COMMENT ON COLUMN jh_admin.github_url IS '관리자 깃허브 URL';
COMMENT ON COLUMN jh_admin.email IS '관리자 이메일';
COMMENT ON COLUMN jh_admin.profile_s3_key IS '관리자 프로필 s3 키';
COMMENT ON COLUMN jh_admin.profile_size IS '관리자 프로필 크기';
COMMENT ON COLUMN jh_admin.profile_ext IS '관리자 프로필 확장자 (CHECK : JPG, PNG, GIF, WEBP)';
COMMENT ON COLUMN jh_admin.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_admin.updated_at IS '데이터 수정일';
COMMENT ON COLUMN jh_admin.deleted_at IS '데이터 삭제일';

-- ============================================================
-- 기술스택
-- ============================================================
CREATE TABLE jh_skill
(
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    category      VARCHAR(100) NOT NULL,
    original_name VARCHAR(200) NOT NULL,
    s3_key        VARCHAR(255) NOT NULL,
    size          VARCHAR(10)  NOT NULL,
    ext           VARCHAR(10)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ,
    CONSTRAINT ck_jh_skill_ext CHECK (ext IN ('JPG', 'PNG', 'GIF', 'WEBP', 'SVG'))
);

CREATE UNIQUE INDEX uk_jh_skill_name ON jh_skill (name) WHERE deleted_at IS NULL;

COMMENT ON TABLE jh_skill IS '기술스택';
COMMENT ON COLUMN jh_skill.id IS '기술스택 PK';
COMMENT ON COLUMN jh_skill.name IS '기술스택 이름';
COMMENT ON COLUMN jh_skill.category IS '기술스택 카테고리';
COMMENT ON COLUMN jh_skill.original_name IS '기술스택 미디어 원본명';
COMMENT ON COLUMN jh_skill.s3_key IS '기술스택 s3 key';
COMMENT ON COLUMN jh_skill.size IS '기술스택 미디어 크기';
COMMENT ON COLUMN jh_skill.ext IS '기술스택 미디어 확장자 (CHECK : JPG, PNG, GIF, WEBP, SVG)';
COMMENT ON COLUMN jh_skill.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_skill.updated_at IS '데이터 수정일';
COMMENT ON COLUMN jh_skill.deleted_at IS '데이터 삭제일';

-- ============================================================
-- 게시글
-- ============================================================
CREATE TABLE jh_post
(
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id         BIGINT       NOT NULL,
    title            VARCHAR(100) NOT NULL,
    summary          VARCHAR(200) NOT NULL,
    content          TEXT         NOT NULL,
    slug             VARCHAR(100) NOT NULL,
    view             BIGINT       NOT NULL DEFAULT 0,
    modified_at      TIMESTAMPTZ,
    thumbnail_s3_key VARCHAR(255),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ,
    CONSTRAINT fk_jh_post_admin FOREIGN KEY (admin_id) REFERENCES jh_admin (id)
);

CREATE UNIQUE INDEX uk_jh_post_slug ON jh_post (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_jh_post_admin_id ON jh_post (admin_id);

COMMENT ON TABLE jh_post IS '게시글';
COMMENT ON COLUMN jh_post.id IS '게시글 PK';
COMMENT ON COLUMN jh_post.admin_id IS '관리자 FK';
COMMENT ON COLUMN jh_post.title IS '게시글 제목';
COMMENT ON COLUMN jh_post.summary IS '게시글 요약';
COMMENT ON COLUMN jh_post.content IS '게시글 내용';
COMMENT ON COLUMN jh_post.slug IS '게시글 슬러그';
COMMENT ON COLUMN jh_post.view IS '게시글 조회수';
COMMENT ON COLUMN jh_post.modified_at IS '게시글 수정일자 (본문 수정 시에만 갱신, 조회수 변경 시 미갱신)';
COMMENT ON COLUMN jh_post.thumbnail_s3_key IS '게시글 썸네일 s3 key (본문 첫 번째 이미지, NULL : 이미지 없음)';
COMMENT ON COLUMN jh_post.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_post.updated_at IS '데이터 수정일';
COMMENT ON COLUMN jh_post.deleted_at IS '데이터 삭제일';

-- ============================================================
-- 게시글 미디어 (post_id NULL : 아직 게시글에 연결되지 않은 이미지)
-- ============================================================
CREATE TABLE jh_post_media
(
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id       BIGINT,
    original_name VARCHAR(200) NOT NULL,
    s3_key        VARCHAR(255) NOT NULL,
    size          VARCHAR(10)  NOT NULL,
    ext           VARCHAR(10)  NOT NULL,
    caption       VARCHAR(50),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ,
    CONSTRAINT fk_jh_post_media_post FOREIGN KEY (post_id) REFERENCES jh_post (id),
    CONSTRAINT ck_jh_post_media_ext CHECK (ext IN ('JPG', 'PNG', 'GIF', 'WEBP'))
);

CREATE INDEX idx_jh_post_media_post_id ON jh_post_media (post_id);

COMMENT ON TABLE jh_post_media IS '게시글 미디어';
COMMENT ON COLUMN jh_post_media.id IS '게시글 미디어 PK';
COMMENT ON COLUMN jh_post_media.post_id IS '게시글 FK';
COMMENT ON COLUMN jh_post_media.original_name IS '게시글 미디어 원본명';
COMMENT ON COLUMN jh_post_media.s3_key IS '게시글 미디어 s3 key';
COMMENT ON COLUMN jh_post_media.size IS '게시글 미디어 크기';
COMMENT ON COLUMN jh_post_media.ext IS '게시글 미디어 확장자 (CHECK : JPG, PNG, GIF, WEBP)';
COMMENT ON COLUMN jh_post_media.caption IS '게시글 미디어 캡션';
COMMENT ON COLUMN jh_post_media.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_post_media.updated_at IS '데이터 수정일';
COMMENT ON COLUMN jh_post_media.deleted_at IS '데이터 삭제일';

-- ============================================================
-- 게시글 조회 로그
-- ============================================================
CREATE TABLE jh_post_view_log
(
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    ip_address INET        NOT NULL,
    user_agent TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_jh_post_view_log_post FOREIGN KEY (post_id) REFERENCES jh_post (id)
);

-- 같은 IP의 24시간 내 재조회 확인용
CREATE INDEX idx_jh_post_view_log_post_ip_created ON jh_post_view_log (post_id, ip_address, created_at);

COMMENT ON TABLE jh_post_view_log IS '게시글 조회 로그';
COMMENT ON COLUMN jh_post_view_log.id IS '게시글 조회 로그 PK';
COMMENT ON COLUMN jh_post_view_log.post_id IS '게시글 FK';
COMMENT ON COLUMN jh_post_view_log.ip_address IS '게시글 조회 로그 아이피';
COMMENT ON COLUMN jh_post_view_log.user_agent IS '게시글 조회 로그 브라우저 정보';
COMMENT ON COLUMN jh_post_view_log.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_post_view_log.updated_at IS '데이터 수정일';

-- ============================================================
-- 프로젝트
-- ============================================================
CREATE TABLE jh_project
(
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id         BIGINT       NOT NULL,
    title            VARCHAR(100) NOT NULL,
    summary          VARCHAR(200) NOT NULL,
    content          TEXT         NOT NULL,
    github_url       VARCHAR(300),
    github_is_public BOOLEAN      NOT NULL DEFAULT false,
    url              VARCHAR(300),
    start_date       DATE         NOT NULL,
    end_date         DATE,
    slug             VARCHAR(100) NOT NULL,
    priority         INT          NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ,
    CONSTRAINT fk_jh_project_admin FOREIGN KEY (admin_id) REFERENCES jh_admin (id)
);

CREATE UNIQUE INDEX uk_jh_project_slug ON jh_project (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_jh_project_admin_id ON jh_project (admin_id);

COMMENT ON TABLE jh_project IS '프로젝트';
COMMENT ON COLUMN jh_project.id IS '프로젝트 PK';
COMMENT ON COLUMN jh_project.admin_id IS '관리자 FK';
COMMENT ON COLUMN jh_project.title IS '프로젝트 제목';
COMMENT ON COLUMN jh_project.summary IS '프로젝트 요약';
COMMENT ON COLUMN jh_project.content IS '프로젝트 내용';
COMMENT ON COLUMN jh_project.github_url IS '프로젝트 깃허브 URL';
COMMENT ON COLUMN jh_project.github_is_public IS '프로젝트 깃허브 공개 여부 ( false : 미공개 / true : 공개)';
COMMENT ON COLUMN jh_project.url IS '프로젝트 배포 URL';
COMMENT ON COLUMN jh_project.start_date IS '프로젝트 시작날짜';
COMMENT ON COLUMN jh_project.end_date IS '프로젝트 종료날짜 (NULL : 진행중)';
COMMENT ON COLUMN jh_project.slug IS '프로젝트 슬러그';
COMMENT ON COLUMN jh_project.priority IS '프로젝트 순서';
COMMENT ON COLUMN jh_project.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_project.updated_at IS '데이터 수정일';
COMMENT ON COLUMN jh_project.deleted_at IS '데이터 삭제일';

-- ============================================================
-- 프로젝트 미디어
-- ============================================================
CREATE TABLE jh_project_media
(
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id    BIGINT       NOT NULL,
    original_name VARCHAR(200) NOT NULL,
    s3_key        VARCHAR(255) NOT NULL,
    size          VARCHAR(10)  NOT NULL,
    ext           VARCHAR(10)  NOT NULL,
    caption       VARCHAR(50),
    is_important  BOOLEAN      NOT NULL DEFAULT false,
    priority      INT          NOT NULL DEFAULT 1,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ,
    CONSTRAINT fk_jh_project_media_project FOREIGN KEY (project_id) REFERENCES jh_project (id),
    CONSTRAINT ck_jh_project_media_ext CHECK (ext IN ('JPG', 'PNG', 'GIF', 'WEBP'))
);

CREATE INDEX idx_jh_project_media_project_id ON jh_project_media (project_id);
-- 프로젝트당 대표 이미지 1개
CREATE UNIQUE INDEX uk_jh_project_media_important ON jh_project_media (project_id) WHERE is_important AND deleted_at IS NULL;

COMMENT ON TABLE jh_project_media IS '프로젝트 미디어';
COMMENT ON COLUMN jh_project_media.id IS '프로젝트 미디어 PK';
COMMENT ON COLUMN jh_project_media.project_id IS '프로젝트 FK';
COMMENT ON COLUMN jh_project_media.original_name IS '프로젝트 미디어 원본명';
COMMENT ON COLUMN jh_project_media.s3_key IS '프로젝트 미디어 s3 key';
COMMENT ON COLUMN jh_project_media.size IS '프로젝트 미디어 크기';
COMMENT ON COLUMN jh_project_media.ext IS '프로젝트 미디어 확장자 (CHECK : JPG, PNG, GIF, WEBP)';
COMMENT ON COLUMN jh_project_media.caption IS '프로젝트 미디어 캡션';
COMMENT ON COLUMN jh_project_media.is_important IS '프로젝트 미디어 대표 여부 ( false : 일반 이미지 / true : 대표 이미지)';
COMMENT ON COLUMN jh_project_media.priority IS '프로젝트 미디어 순서';
COMMENT ON COLUMN jh_project_media.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_project_media.updated_at IS '데이터 수정일';
COMMENT ON COLUMN jh_project_media.deleted_at IS '데이터 삭제일';

-- ============================================================
-- 관리자 기술스택
-- ============================================================
CREATE TABLE jh_admin_skill
(
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id   BIGINT      NOT NULL,
    skill_id   BIGINT      NOT NULL,
    priority   INT         NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_jh_admin_skill_admin FOREIGN KEY (admin_id) REFERENCES jh_admin (id),
    CONSTRAINT fk_jh_admin_skill_skill FOREIGN KEY (skill_id) REFERENCES jh_skill (id),
    CONSTRAINT uk_jh_admin_skill UNIQUE (admin_id, skill_id)
);

CREATE INDEX idx_jh_admin_skill_skill_id ON jh_admin_skill (skill_id);

COMMENT ON TABLE jh_admin_skill IS '관리자 기술스택';
COMMENT ON COLUMN jh_admin_skill.id IS '관리자 기술스택 PK';
COMMENT ON COLUMN jh_admin_skill.admin_id IS '관리자 FK';
COMMENT ON COLUMN jh_admin_skill.skill_id IS '기술스택 FK';
COMMENT ON COLUMN jh_admin_skill.priority IS '관리자 기술스택 순서';
COMMENT ON COLUMN jh_admin_skill.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_admin_skill.updated_at IS '데이터 수정일';

-- ============================================================
-- 게시글 기술스택
-- ============================================================
CREATE TABLE jh_post_skill
(
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    skill_id   BIGINT      NOT NULL,
    priority   INT         NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_jh_post_skill_post FOREIGN KEY (post_id) REFERENCES jh_post (id),
    CONSTRAINT fk_jh_post_skill_skill FOREIGN KEY (skill_id) REFERENCES jh_skill (id),
    CONSTRAINT uk_jh_post_skill UNIQUE (post_id, skill_id)
);

CREATE INDEX idx_jh_post_skill_skill_id ON jh_post_skill (skill_id);

COMMENT ON TABLE jh_post_skill IS '게시글 기술스택';
COMMENT ON COLUMN jh_post_skill.id IS '게시글 기술스택 PK';
COMMENT ON COLUMN jh_post_skill.post_id IS '게시글 FK';
COMMENT ON COLUMN jh_post_skill.skill_id IS '기술스택 FK';
COMMENT ON COLUMN jh_post_skill.priority IS '게시글 기술스택 순서';
COMMENT ON COLUMN jh_post_skill.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_post_skill.updated_at IS '데이터 수정일';

-- ============================================================
-- 프로젝트 기술스택
-- ============================================================
CREATE TABLE jh_project_skill
(
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT      NOT NULL,
    skill_id   BIGINT      NOT NULL,
    priority   INT         NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_jh_project_skill_project FOREIGN KEY (project_id) REFERENCES jh_project (id),
    CONSTRAINT fk_jh_project_skill_skill FOREIGN KEY (skill_id) REFERENCES jh_skill (id),
    CONSTRAINT uk_jh_project_skill UNIQUE (project_id, skill_id)
);

CREATE INDEX idx_jh_project_skill_skill_id ON jh_project_skill (skill_id);

COMMENT ON TABLE jh_project_skill IS '프로젝트 기술스택';
COMMENT ON COLUMN jh_project_skill.id IS '프로젝트 기술스택 PK';
COMMENT ON COLUMN jh_project_skill.project_id IS '프로젝트 FK';
COMMENT ON COLUMN jh_project_skill.skill_id IS '기술스택 FK';
COMMENT ON COLUMN jh_project_skill.priority IS '프로젝트 기술스택 순서';
COMMENT ON COLUMN jh_project_skill.created_at IS '데이터 생성일';
COMMENT ON COLUMN jh_project_skill.updated_at IS '데이터 수정일';
