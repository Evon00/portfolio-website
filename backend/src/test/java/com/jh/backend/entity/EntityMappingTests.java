package com.jh.backend.entity;

import com.jh.backend.common.enums.MediaExt;
import jakarta.persistence.EntityManager;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.net.InetAddress;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// 로컬 DB를 사용하며, 테스트가 끝나면 롤백된다
@SpringBootTest
@Transactional
class EntityMappingTests {

    @Autowired
    private EntityManager em;

    @Autowired
    private JsonMapper jsonMapper;

    // 로컬 DB의 개발 데이터와 겹치지 않도록 임의의 값을 사용
    private final String unique = UUID.randomUUID().toString();

    private Admin admin;
    private Skill skill;

    @BeforeEach
    void setUp() {
        admin = Admin.builder().username(unique.substring(0, 20)).password("pw").name("이름").description("소개").build();
        skill = skill(unique);
        em.persist(admin);
        em.persist(skill);
    }

    @Test
    @DisplayName("10개 엔티티를 저장하고 조회한다")
    void persistAll() throws Exception {
        Post post = post(unique);
        em.persist(post);
        PostMedia postMedia = PostMedia.builder().originalName("a.png").s3Key("post/a.png").size("9.4MB").ext(MediaExt.PNG).build();
        em.persist(postMedia);
        PostViewLog viewLog = PostViewLog.builder().post(post).ipAddress(InetAddress.getByName("2001:db8::1")).userAgent("Mozilla/5.0").build();
        em.persist(viewLog);
        Project project = project(unique);
        em.persist(project);
        em.persist(projectMedia(project, true));
        em.persist(AdminSkill.builder().admin(admin).skill(skill).priority(1).build());
        em.persist(PostSkill.builder().post(post).skill(skill).priority(1).build());
        em.persist(ProjectSkill.builder().project(project).skill(skill).priority(1).build());
        flushAndClear();

        assertThat(em.find(PostMedia.class, postMedia.getId()).getPost()).isNull();
        assertThat(em.find(PostViewLog.class, viewLog.getId()).getIpAddress()).isEqualTo(InetAddress.getByName("2001:db8::1"));
        assertThat(em.find(Post.class, post.getId()).getView()).isZero();
        assertThat(em.find(Project.class, project.getId()).getEndDate()).isNull();
    }

    @Test
    @DisplayName("생성일과 수정일이 자동으로 기록된다")
    void auditing() {
        Skill saved = em.find(Skill.class, skill.getId());

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();

        OffsetDateTime created = saved.getCreatedAt();
        saved.update(unique, "Database");
        flushAndClear();

        Skill updated = em.find(Skill.class, skill.getId());
        assertThat(updated.getUpdatedAt()).isAfter(created);
    }

    @Test
    @DisplayName("날짜는 +09:00으로 응답한다")
    void offset() {
        OffsetDateTime utc = OffsetDateTime.of(2026, 10, 16, 0, 0, 0, 0, ZoneOffset.UTC);
        assertThat(jsonMapper.writeValueAsString(Map.of("at", utc))).isEqualTo("{\"at\":\"2026-10-16T09:00:00+09:00\"}");

        flushAndClear();
        OffsetDateTime fromDb = em.find(Skill.class, skill.getId()).getCreatedAt();
        assertThat(jsonMapper.writeValueAsString(Map.of("at", fromDb))).contains("+09:00");
    }

    @Test
    @DisplayName("soft delete된 데이터는 조회되지 않고 슬러그를 다시 사용할 수 있다")
    void softDelete() {
        Post post = post(unique);
        em.persist(post);
        post.delete();
        flushAndClear();

        assertThat(em.find(Post.class, post.getId())).isNull();
        assertThat(em.createQuery("select p from Post p where p.slug = :slug", Post.class)
                .setParameter("slug", unique).getResultList()).isEmpty();

        em.persist(post(unique));
        em.flush();
    }

    @Test
    @DisplayName("삭제되지 않은 슬러그는 중복될 수 없다")
    void duplicatedSlug() {
        em.persist(post(unique));

        assertThatThrownBy(() -> em.persist(post(unique))).isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("uk_jh_post_slug");
    }

    @Test
    @DisplayName("같은 기술스택을 두 번 연결할 수 없다")
    void duplicatedSkill() {
        em.persist(AdminSkill.builder().admin(admin).skill(skill).priority(1).build());

        assertThatThrownBy(() -> em.persist(AdminSkill.builder().admin(admin).skill(skill).priority(2).build()))
                .isInstanceOf(ConstraintViolationException.class).hasMessageContaining("uk_jh_admin_skill");
    }

    @Test
    @DisplayName("프로젝트의 대표 이미지는 1개만 가능하다")
    void duplicatedImportant() {
        Project project = project(unique);
        em.persist(project);
        em.persist(projectMedia(project, false));
        em.persist(projectMedia(project, false));
        em.persist(projectMedia(project, true));

        assertThatThrownBy(() -> em.persist(projectMedia(project, true))).isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("uk_jh_project_media_important");
    }

    @Test
    @DisplayName("SVG는 기술스택 외에는 저장할 수 없다")
    void svgOnlyForSkill() {
        PostMedia svg = PostMedia.builder().originalName("a.svg").s3Key("post/a.svg").size("1.0KB").ext(MediaExt.SVG).build();

        assertThatThrownBy(() -> em.persist(svg)).isInstanceOf(ConstraintViolationException.class)
                .hasMessageContaining("ck_jh_post_media_ext");
    }

    @Test
    @DisplayName("게시글 수정은 조회수를 덮어쓰지 않고 modifiedAt을 갱신한다")
    void postUpdate() {
        Post post = post(unique);
        em.persist(post);
        em.flush();
        em.createNativeQuery("UPDATE jh_post SET view = 7 WHERE id = :id").setParameter("id", post.getId()).executeUpdate();

        post.update("새 제목", "요약", "본문", null);
        flushAndClear();

        Post updated = em.find(Post.class, post.getId());
        assertThat(updated.getTitle()).isEqualTo("새 제목");
        assertThat(updated.getView()).isEqualTo(7);
        assertThat(updated.getModifiedAt()).isNotNull();
    }

    private Skill skill(String name) {
        return Skill.builder().name(name).category("Backend").originalName("a.svg").s3Key("skill/a.svg").size("1.2KB").ext(MediaExt.SVG).build();
    }

    private Post post(String slug) {
        return Post.builder().admin(admin).title("제목").summary("요약").content("본문").slug(slug).build();
    }

    private Project project(String slug) {
        return Project.builder().admin(admin).title("제목").summary("요약").content("본문")
                .startDate(LocalDate.of(2026, 7, 2)).slug(slug).priority(1).build();
    }

    private ProjectMedia projectMedia(Project project, boolean important) {
        return ProjectMedia.builder().project(project).originalName("a.png").s3Key("project/a.png").size("1.2MB")
                .ext(MediaExt.PNG).important(important).priority(1).build();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}
