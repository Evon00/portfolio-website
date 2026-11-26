package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.post.item.CreatePostErrorItem;
import com.jh.backend.dto.post.request.CheckPostSlugRequestDto;
import com.jh.backend.dto.post.request.CreatePostRequestDto;
import com.jh.backend.dto.post.response.CheckPostSlugResponseDto;
import com.jh.backend.dto.post.response.CreatePostResponseDto;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPostServiceImpl implements AdminPostService {

    private static final int MAX_CAPTION_LENGTH = 50;

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
        List<PostMedia> postMedias = readUnlinkedPostMedias(dto.postMediaIds() != null ? dto.postMediaIds() : List.of());

        // 5. 본문 이미지 분석 (MarkdownImageExtractor)
        //      -> 본문의 ![alt](url), <img src alt>를 나온 순서대로 추출
        //      -> 썸네일 : 요청 이미지의 공개 URL과 처음 일치하는 이미지의 s3 key (없으면 null, 외부 URL 제외)
        //      -> 캡션 : 각 이미지가 본문에 처음 나온 곳의 alt (빈 값이면 null, 50자 초과시 자름, 본문에 없으면 null)
        Map<String, PostMedia> mediaByUrl = postMedias.stream()
                .collect(Collectors.toMap(media -> fileUtil.toUrl(media.getS3Key()), Function.identity()));
        String thumbnailS3Key = null;
        Map<Long, String> captions = new HashMap<>();
        for (MarkdownImage image : markdownImageExtractor.extract(dto.postContent())) {
            PostMedia media = mediaByUrl.get(image.url());
            if (media == null) continue;
            if (thumbnailS3Key == null) thumbnailS3Key = media.getS3Key();
            captions.putIfAbsent(media.getId(), toCaption(image.alt()));
        }

        // 6. 게시글 저장
        //      -> 조회수 0, 수정일자 null로 저장
        Post post = postRepository.save(Post.builder()
                .admin(admin)
                .title(dto.postTitle())
                .summary(dto.postSummary())
                .content(dto.postContent())
                .slug(dto.postSlug())
                .thumbnailS3Key(thumbnailS3Key)
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
        postMedias.forEach(media -> media.linkPost(post, captions.get(media.getId())));
        log.info("게시글 추가 - postId = {}", post.getId());

        // 9. 응답 DTO로 변환
        return CreatePostResponseDto.fromEntity(post);
    }

    // 게시글에 연결되지 않은 이미지 조회 (요청 순서 유지)
    //      exc. 중복 ID가 있으면 에러 처리 (POST_MEDIA_DUPLICATED)
    //      exc. 존재하지 않거나 삭제됐거나 이미 게시글에 연결된 이미지가 있으면 에러 처리 (POST_MEDIA_INVALID, data에 해당 ID 목록)
    private List<PostMedia> readUnlinkedPostMedias(List<Long> postMediaIds) {
        if (new HashSet<>(postMediaIds).size() != postMediaIds.size()) {
            throw new CustomException(ExceptionCode.POST_MEDIA_DUPLICATED);
        }

        Map<Long, PostMedia> mediaMap = postMediaRepository.findAllById(postMediaIds).stream()
                .filter(media -> media.getPost() == null)
                .collect(Collectors.toMap(PostMedia::getId, Function.identity()));
        List<Long> invalidIds = postMediaIds.stream().filter(id -> !mediaMap.containsKey(id)).toList();
        if (!invalidIds.isEmpty()) {
            throw new CustomException(ExceptionCode.POST_MEDIA_INVALID, new CreatePostErrorItem(invalidIds));
        }
        return postMediaIds.stream().map(mediaMap::get).toList();
    }

    // 이미지 alt를 캡션으로 변환 (빈 값이면 null, 50자 초과시 자름)
    private String toCaption(String alt) {
        if (alt == null || alt.isBlank()) return null;
        String caption = alt.strip();
        return caption.length() <= MAX_CAPTION_LENGTH ? caption : caption.substring(0, MAX_CAPTION_LENGTH);
    }
}
