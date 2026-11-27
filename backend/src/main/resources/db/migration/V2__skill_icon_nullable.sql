-- 기술 스택 아이콘을 선택으로 변경 (아이콘 없이 추가 가능)
ALTER TABLE jh_skill
    ALTER COLUMN original_name DROP NOT NULL,
    ALTER COLUMN s3_key DROP NOT NULL,
    ALTER COLUMN size DROP NOT NULL,
    ALTER COLUMN ext DROP NOT NULL;

-- 아이콘 정보 4개는 모두 있거나 모두 없어야 함
ALTER TABLE jh_skill
    ADD CONSTRAINT ck_jh_skill_icon CHECK (
        (original_name IS NULL AND s3_key IS NULL AND size IS NULL AND ext IS NULL)
        OR (original_name IS NOT NULL AND s3_key IS NOT NULL AND size IS NOT NULL AND ext IS NOT NULL)
    );
