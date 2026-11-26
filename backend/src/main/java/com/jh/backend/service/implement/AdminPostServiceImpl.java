package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.common.enums.PostKeywordType;
import com.jh.backend.common.enums.PostSortBy;
import com.jh.backend.common.enums.SortDirection;
import com.jh.backend.dto.post.item.CreatePostErrorItem;
import com.jh.backend.dto.post.item.FindAllAdminPostsItem;
import com.jh.backend.dto.post.item.FindPostMediaItem;
import com.jh.backend.dto.post.item.PostSkillItem;
import com.jh.backend.dto.post.request.CheckPostSlugRequestDto;
import com.jh.backend.dto.post.request.CreatePostRequestDto;
import com.jh.backend.dto.post.request.FindAllAdminPostsRequestDto;
import com.jh.backend.dto.post.response.CheckPostSlugResponseDto;
import com.jh.backend.dto.post.response.CreatePostResponseDto;
import com.jh.backend.dto.post.request.UpdatePostRequestDto;
import com.jh.backend.dto.post.response.FindPostResponseDto;
import com.jh.backend.dto.post.response.UpdatePostResponseDto;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.entity.Post;
import com.jh.backend.entity.PostMedia;
import com.jh.backend.entity.PostSkill;
import com.jh.backend.entity.Skill;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
import com.jh.backend.repository.PostMediaRepository;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.repository.PostSkillRepository;
import com.jh.backend.service.AdminPostService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.file.UploadedFile;
import com.jh.backend.util.login.LoginChecker;
import com.jh.backend.util.markdown.MarkdownImageExtractor;
import com.jh.backend.util.markdown.MarkdownImageExtractor.MarkdownImage;
import com.jh.backend.util.skill.SkillReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPostServiceImpl implements AdminPostService {

    private static final int MAX_CAPTION_LENGTH = 50;
    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final int DEFAULT_PAGE_SIZE = 10;

    private final AdminRepository adminRepository;
    private final PostRepository postRepository;
    private final PostSkillRepository postSkillRepository;
    private final PostMediaRepository postMediaRepository;
    private final SkillReader skillReader;
    private final MarkdownImageExtractor markdownImageExtractor;
    private final LoginChecker loginChecker;
    private final FileUtil fileUtil;

    // 게시글 이미지 업로드
    //      -> 에디터에서 이미지를 넣을 때마다 호출 (요청 1번에 파일 1개)
    //      -> 게시글에 연결되지 않은 상태(post_id = null)로 저장, 게시글 추가/수정시 postMediaIds로 연결
    @Override
    @Transactional
    public UploadPostImageResponseDto uploadPostImage(MultipartFile file) {

        // 1. 이미지 업로드 (StorageFolder.POST)
        //      exc. 빈 파일, 용량 초과, 허용하지 않는 형식(JPG, PNG, GIF, WEBP 외)이면 에러 처리 (FileUtil에서 검증)
        //      -> 이후 DB 저장 실패로 롤백되면 업로드한 파일은 S3에서 삭제
        UploadedFile image = fileUtil.upload(file, StorageFolder.POST);

        // 2. 게시글 미디어 저장
        //      -> 원본 파일명, s3 key, 크기, 확장자 저장 (게시글, 캡션은 null)
        //      -> 업로드 로그 기록 (postMediaId)
        PostMedia postMedia = postMediaRepository.save(PostMedia.builder()
                .originalName(image.originalName())
                .s3Key(image.s3Key())
                .size(image.size())
                .ext(image.ext())
                .build());
        log.info("게시글 이미지 업로드 - postMediaId = {}", postMedia.getId());

        // 3. 응답 DTO로 변환
        //      -> s3 key를 공개 주소로 변환 (본문 마크다운에 넣을 주소)
        return UploadPostImageResponseDto.fromEntity(postMedia, fileUtil.toUrl(postMedia.getS3Key()));
    }

    // 게시글 슬러그 중복 확인
    //      -> 슬러그 형식(영문 소문자, 숫자, 하이픈, 최대 100자)은 DTO에서 검증 (형식 오류시 400)
    //      -> 중복이어도 에러가 아닌 available = false로 응답
    @Override
    @Transactional(readOnly = true)
    public CheckPostSlugResponseDto checkPostSlug(CheckPostSlugRequestDto dto) {

        // 1. 슬러그 사용 여부 확인
        //      -> 삭제되지 않은 게시글 중 같은 슬러그가 있는지 확인
        //      -> 삭제된 게시글의 슬러그는 사용 가능으로 판단 (@SQLRestriction, DB 유니크 인덱스도 삭제되지 않은 게시글만 대상)
        boolean exists = postRepository.existsBySlug(dto.postSlug());

        // 2. 응답 DTO로 변환
        //      -> 같은 슬러그가 없으면 available = true
        return new CheckPostSlugResponseDto(dto.postSlug(), !exists);
    }

    // 게시글 추가
    //      -> 본문의 첫 번째 연결 이미지를 썸네일로, 각 이미지의 alt를 캡션으로 저장
    @Override
    @Transactional
    public CreatePostResponseDto createPost(CreatePostRequestDto dto) {

        // 1. 로그인한 관리자 조회
        //      -> 토큰의 관리자 PK 사용 (LoginChecker)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        Admin admin = adminRepository.findById(loginChecker.getAdminId()).orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 슬러그 중복 확인
        //      -> 삭제된 게시글의 슬러그는 사용 가능 (@SQLRestriction)
        //      exc. 같은 슬러그의 게시글이 있으면 에러 처리 (POST_SLUG_DUPLICATED, 409)
        //      -> 동시 요청으로 같은 슬러그가 저장되면 DB 유니크 인덱스에서 에러 처리 (DATA_INTEGRITY_VIOLATION)
        if (postRepository.existsBySlug(dto.postSlug())) {
            throw new CustomException(ExceptionCode.POST_SLUG_DUPLICATED);
        }

        // 3. 기술 스택 조회 (SkillReader, 요청 순서 유지)
        //      exc. 중복 ID가 있으면 에러 처리 (SKILL_ID_DUPLICATED, 400)
        //      exc. 존재하지 않거나 삭제된 ID가 있으면 에러 처리 (SKILL_ID_INVALID, 400, data에 해당 ID 목록)
        List<Skill> skills = skillReader.readAllInOrder(dto.skillIds());

        // 4. 게시글 이미지 조회 (postMediaIds가 null이면 빈 목록)
        //      exc. 중복 ID가 있으면 에러 처리 (POST_MEDIA_DUPLICATED, 400)
        //      exc. 존재하지 않거나 삭제됐거나 이미 다른 게시글에 연결된 이미지가 있으면 에러 처리 (POST_MEDIA_INVALID, 400, data에 해당 ID 목록)
        List<PostMedia> postMedias = readLinkablePostMedias(dto.postMediaIds() != null ? dto.postMediaIds() : List.of(), null);

        // 5. 본문 이미지 분석 (MarkdownImageExtractor)
        //      -> 본문의 ![alt](url), <img src alt>를 나온 순서대로 추출
        //      -> 썸네일 : 요청 이미지의 공개 URL과 처음 일치하는 이미지의 s3 key (없으면 null, 외부 URL 제외)
        //      -> 캡션 : 각 이미지가 본문에 처음 나온 곳의 alt (빈 값이면 null, 50자 초과시 자름, 본문에 없으면 null)
        ImageAnalysis analysis = analyzeImages(dto.postContent(), postMedias);

        // 6. 게시글 저장
        //      -> 조회수 0, 수정일자 null로 저장
        Post post = postRepository.save(Post.builder()
                .admin(admin)
                .title(dto.postTitle())
                .summary(dto.postSummary())
                .content(dto.postContent())
                .slug(dto.postSlug())
                .thumbnailS3Key(analysis.thumbnailS3Key())
                .build());

        // 7. 게시글 기술 스택 저장 (saveAll)
        //      -> priority는 요청 배열 순서대로 1부터
        postSkillRepository.saveAll(IntStream.range(0, skills.size())
                .mapToObj(i -> PostSkill.builder()
                        .post(post)
                        .skill(skills.get(i))
                        .priority(i + 1)
                        .build())
                .toList());

        // 8. 게시글 이미지 연결 (PostMedia.linkPost, 변경 감지)
        //      -> 게시글, 캡션 저장
        //      -> 추가 로그 기록 (postId)
        postMedias.forEach(media -> media.linkPost(post, analysis.captions().get(media.getId())));
        log.info("게시글 추가 - postId = {}", post.getId());

        // 9. 응답 DTO로 변환
        return CreatePostResponseDto.fromEntity(post);
    }

    // 관리자 게시글 목록 조회
    //      -> 조회수 증가, 조회 로그 기록 없음
    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<FindAllAdminPostsItem> findAllAdminPosts(FindAllAdminPostsRequestDto dto) {

        // 1. 페이지, 정렬 조건 정리
        //      -> 기본값 : pageNumber 0, pageSize 10, sortBy createdAt, sortDir desc
        //      -> createdAt은 등록일, postView는 조회수 기준
        //      -> 값이 같으면 PK를 같은 방향으로 정렬 (페이지 이동시 순서 고정)
        int pageNumber = dto.pageNumber() != null ? dto.pageNumber() : DEFAULT_PAGE_NUMBER;
        int pageSize = dto.pageSize() != null ? dto.pageSize() : DEFAULT_PAGE_SIZE;
        PostSortBy sortBy = dto.sortBy() != null ? PostSortBy.valueOf(dto.sortBy()) : PostSortBy.createdAt;
        Sort.Direction direction = (dto.sortDir() != null ? SortDirection.valueOf(dto.sortDir()) : SortDirection.desc).getDirection();
        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize,
                Sort.by(direction, sortBy.getProperty()).and(Sort.by(direction, "id")));

        // 2. 검색 조건 정리
        //      -> 검색어는 앞뒤 공백 제거 후 비어 있으면 검색 안 함
        //      -> 검색 종류 없이 검색어만 있으면 제목+내용(TITLE_CONTENT)으로 검색
        //      -> 대소문자 무시 부분 일치, %, _, \ 는 글자 그대로 검색되도록 escape 처리
        String keyword = StringUtils.hasText(dto.keyword()) ? dto.keyword().strip() : null;
        String keywordType = null;
        String pattern = null;
        if (keyword != null) {
            keywordType = dto.keywordType() != null ? dto.keywordType() : PostKeywordType.TITLE_CONTENT.name();
            pattern = "%" + escapeLike(keyword.toLowerCase(Locale.ROOT)) + "%";
        }

        // 3. 게시글 페이지 조회 (JPQL, count 쿼리 포함)
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        //      -> SKILL 검색은 EXISTS 서브쿼리로 기술 스택 이름 비교 (게시글 중복 방지)
        Page<Post> posts = postRepository.findAllBySearch(keywordType, pattern, pageRequest);

        // 4. 게시글 기술 스택 조회 (IN 쿼리 1번, N+1 방지)
        //      -> 조회된 게시글이 없으면 생략
        //      -> 게시글별 priority 오름차순
        Map<Long, List<PostSkillItem>> skillsByPostId = posts.isEmpty() ? Map.of()
                : postSkillRepository.findAllByPostIdIn(posts.map(Post::getId).toList()).stream()
                        .collect(Collectors.groupingBy(postSkill -> postSkill.getPost().getId(),
                                Collectors.mapping(postSkill -> PostSkillItem.fromEntity(postSkill, fileUtil.toUrl(postSkill.getSkill().getS3Key())),
                                        Collectors.toList())));

        // 5. 응답 DTO로 변환
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        //      -> 범위를 넘은 페이지는 빈 목록
        return PageResponseDto.of(posts, posts.stream()
                .map(post -> FindAllAdminPostsItem.fromEntity(post, skillsByPostId.getOrDefault(post.getId(), List.of())))
                .toList());
    }

    // 게시글 상세 조회 (수정용)
    //      -> 관리자 수정 화면용, 조회수 증가·조회 로그 기록 없음 (조회수는 공개 상세 조회에서만 증가)
    //      -> 경로 변수 postId는 컨트롤러에서 @Positive 검증 (0 이하면 400)
    @Override
    @Transactional(readOnly = true)
    public FindPostResponseDto findPost(Long postId) {

        // 1. 게시글 조회
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        //      exc. 게시글 미존재시 에러 처리 (POST_NOT_FOUND, 404)
        Post post = postRepository.findById(postId).orElseThrow(
                () -> new CustomException(ExceptionCode.POST_NOT_FOUND));

        // 2. 게시글 기술 스택 조회 (기존 findAllByPostIdIn 재사용, 기술 스택 함께 조회)
        //      -> priority 오름차순
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        List<PostSkillItem> skills = postSkillRepository.findAllByPostIdIn(List.of(postId)).stream()
                .map(postSkill -> PostSkillItem.fromEntity(postSkill, fileUtil.toUrl(postSkill.getSkill().getS3Key())))
                .toList();

        // 3. 게시글 이미지 조회
        //      -> 게시글에 연결된 이미지만, 삭제된 이미지 제외 (@SQLRestriction)
        //      -> PK 오름차순 (업로드 순서)
        //      -> postMediaUrl은 s3 key를 공개 주소로 변환
        List<FindPostMediaItem> postMedias = postMediaRepository.findAllByPostIdOrderByIdAsc(postId).stream()
                .map(media -> FindPostMediaItem.fromEntity(media, fileUtil.toUrl(media.getS3Key())))
                .toList();

        // 4. 응답 DTO로 변환
        //      -> 본문은 저장된 원문 그대로 응답
        return FindPostResponseDto.fromEntity(post, skills, postMedias);
    }

    // 게시글 수정 (PATCH)
    //      -> 보낸 필드만 수정, null이면 기존 값 유지 (빈 값, 빈 skillIds는 DTO에서 400)
    //      -> 슬러그는 수정 불가, 조회수는 변경하지 않음
    //      -> 경로 변수 postId는 컨트롤러에서 @Positive 검증 (0 이하면 400)
    @Override
    @Transactional
    public UpdatePostResponseDto updatePost(Long postId, UpdatePostRequestDto dto) {

        // 1. 게시글 조회
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        //      exc. 게시글 미존재시 에러 처리 (POST_NOT_FOUND, 404)
        Post post = postRepository.findById(postId).orElseThrow(
                () -> new CustomException(ExceptionCode.POST_NOT_FOUND));

        // 2. 최종 제목, 요약, 본문 결정
        //      -> null이면 기존 값, 보낸 값이 있으면 그 값
        String title = dto.postTitle() != null ? dto.postTitle() : post.getTitle();
        String summary = dto.postSummary() != null ? dto.postSummary() : post.getSummary();
        String content = dto.postContent() != null ? dto.postContent() : post.getContent();
        boolean contentChanged = !content.equals(post.getContent());
        boolean changed = contentChanged || !title.equals(post.getTitle()) || !summary.equals(post.getSummary());

        // 3. 기술 스택 변경 (skillIds를 보낸 경우만)
        //      -> SkillReader로 조회 (요청 순서 유지)
        //      exc. 중복 ID가 있으면 에러 처리 (SKILL_ID_DUPLICATED, 400)
        //      exc. 존재하지 않거나 삭제된 ID가 있으면 에러 처리 (SKILL_ID_INVALID, 400, data에 해당 ID 목록)
        //      -> 기존 기술 스택 순서(priority 오름차순)와 같으면 변경 없음
        //      -> 다르면 일괄 삭제(@Modifying, 바로 실행) 후 priority 1부터 다시 저장 (유니크 제약 위반 방지)
        if (dto.skillIds() != null) {
            List<Skill> skills = skillReader.readAllInOrder(dto.skillIds());
            List<Long> currentSkillIds = postSkillRepository.findAllByPostIdIn(List.of(postId)).stream()
                    .map(postSkill -> postSkill.getSkill().getId())
                    .toList();
            if (!currentSkillIds.equals(dto.skillIds())) {
                postSkillRepository.deleteAllByPostId(postId);
                postSkillRepository.saveAll(IntStream.range(0, skills.size())
                        .mapToObj(i -> PostSkill.builder()
                                .post(post)
                                .skill(skills.get(i))
                                .priority(i + 1)
                                .build())
                        .toList());
                changed = true;
            }
        }

        // 4. 최종 이미지 목록 결정
        //      -> 현재 이 게시글에 연결된 이미지 조회 (PK 오름차순)
        //      -> postMediaIds가 null이면 현재 연결된 이미지 그대로
        //      -> 보낸 경우 요청 순서대로 조회
        //      exc. 중복 ID가 있으면 에러 처리 (POST_MEDIA_DUPLICATED, 400)
        //      exc. 존재하지 않거나 삭제됐거나 다른 게시글에 연결된 이미지가 있으면 에러 처리 (POST_MEDIA_INVALID, 400, data에 해당 ID 목록)
        //          -> 연결되지 않은 이미지, 이 게시글에 이미 연결된 이미지만 사용 가능
        List<PostMedia> currentMedias = postMediaRepository.findAllByPostIdOrderByIdAsc(postId);
        List<PostMedia> finalMedias = dto.postMediaIds() != null
                ? readLinkablePostMedias(dto.postMediaIds(), postId) : currentMedias;
        Set<Long> finalMediaIds = finalMedias.stream().map(PostMedia::getId).collect(Collectors.toSet());
        boolean mediaChanged = !finalMediaIds.equals(currentMedias.stream().map(PostMedia::getId).collect(Collectors.toSet()));

        // 5. 썸네일, 캡션 다시 계산 (본문이 바뀌었거나 이미지 목록이 바뀐 경우만)
        //      -> 최종 본문 + 최종 이미지 목록 기준, 게시글 추가와 같은 방식 (MarkdownImageExtractor)
        //      -> 썸네일 : 이미지 공개 URL과 처음 일치하는 본문 이미지의 s3 key (없으면 null)
        //      -> 캡션 : 각 이미지가 본문에 처음 나온 곳의 alt (빈 값이면 null, 50자 초과시 자름, 본문에 없으면 null)
        String thumbnailS3Key = post.getThumbnailS3Key();
        if (contentChanged || mediaChanged) {
            ImageAnalysis analysis = analyzeImages(content, finalMedias);
            thumbnailS3Key = analysis.thumbnailS3Key();

            // 6. 이미지 연결 변경 (5번을 수행한 경우만, 변경 감지)
        //      -> 최종 목록에서 빠진 기존 이미지는 연결 해제 (PostMedia.unlinkPost, 이후 스케줄러가 정리)
        //      -> 최종 목록의 이미지는 게시글 연결 + 캡션 저장 (PostMedia.linkPost)
            currentMedias.stream()
                    .filter(media -> !finalMediaIds.contains(media.getId()))
                    .forEach(PostMedia::unlinkPost);
            finalMedias.forEach(media -> media.linkPost(post, analysis.captions().get(media.getId())));
            changed |= mediaChanged;
        }

        // 7. 게시글 수정 (변경 감지)
        //      -> 제목, 요약, 본문, 기술 스택, 이미지 중 실제로 바뀐 값이 있을 때만 Post.update (수정일자 갱신)
        //      -> 바뀐 값이 없으면 수정일자 유지
        //      -> 수정 로그 기록 (postId)
        if (changed) {
            post.update(title, summary, content, thumbnailS3Key);
            log.info("게시글 수정 - postId = {}", post.getId());
        }

        // 8. 응답 DTO로 변환
        return UpdatePostResponseDto.fromEntity(post);
    }

    // 게시글에 연결할 수 있는 이미지 조회 (요청 순서 유지)
    //      -> 연결되지 않은 이미지, postId 게시글에 이미 연결된 이미지만 사용 가능 (추가시 postId는 null)
    //      exc. 중복 ID가 있으면 에러 처리 (POST_MEDIA_DUPLICATED)
    //      exc. 존재하지 않거나 삭제됐거나 다른 게시글에 연결된 이미지가 있으면 에러 처리 (POST_MEDIA_INVALID, data에 해당 ID 목록)
    private List<PostMedia> readLinkablePostMedias(List<Long> postMediaIds, Long postId) {
        if (new HashSet<>(postMediaIds).size() != postMediaIds.size()) {
            throw new CustomException(ExceptionCode.POST_MEDIA_DUPLICATED);
        }

        Map<Long, PostMedia> mediaMap = postMediaRepository.findAllById(postMediaIds).stream()
                .filter(media -> media.getPost() == null || Objects.equals(media.getPost().getId(), postId))
                .collect(Collectors.toMap(PostMedia::getId, Function.identity()));
        List<Long> invalidIds = postMediaIds.stream().filter(id -> !mediaMap.containsKey(id)).toList();
        if (!invalidIds.isEmpty()) {
            throw new CustomException(ExceptionCode.POST_MEDIA_INVALID, new CreatePostErrorItem(invalidIds));
        }
        return postMediaIds.stream().map(mediaMap::get).toList();
    }

    // 본문 이미지 분석 (MarkdownImageExtractor)
    //      -> 썸네일 : 이미지 공개 URL과 처음 일치하는 본문 이미지의 s3 key (없으면 null, 외부 URL 제외)
    //      -> 캡션 : 각 이미지가 본문에 처음 나온 곳의 alt (본문에 없으면 null)
    private ImageAnalysis analyzeImages(String content, List<PostMedia> postMedias) {
        Map<String, PostMedia> mediaByUrl = postMedias.stream()
                .collect(Collectors.toMap(media -> fileUtil.toUrl(media.getS3Key()), Function.identity()));
        String thumbnailS3Key = null;
        Map<Long, String> captions = new HashMap<>();
        for (MarkdownImage image : markdownImageExtractor.extract(content)) {
            PostMedia media = mediaByUrl.get(image.url());
            if (media == null) continue;
            if (thumbnailS3Key == null) thumbnailS3Key = media.getS3Key();
            captions.putIfAbsent(media.getId(), toCaption(image.alt()));
        }
        return new ImageAnalysis(thumbnailS3Key, captions);
    }

    // 본문 이미지 분석 결과 (썸네일 s3 key, 이미지 PK별 캡션)
    private record ImageAnalysis(String thumbnailS3Key, Map<Long, String> captions) {
    }

    // 이미지 alt를 캡션으로 변환 (빈 값이면 null, 50자 초과시 자름)
    private String toCaption(String alt) {
        if (alt == null || alt.isBlank()) return null;
        String caption = alt.strip();
        return caption.length() <= MAX_CAPTION_LENGTH ? caption : caption.substring(0, MAX_CAPTION_LENGTH);
    }

    // LIKE 검색어 escape (\, %, _ 를 글자 그대로 검색)
    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
