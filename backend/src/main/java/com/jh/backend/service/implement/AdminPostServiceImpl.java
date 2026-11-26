package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.post.request.CheckPostSlugRequestDto;
import com.jh.backend.dto.post.response.CheckPostSlugResponseDto;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import com.jh.backend.entity.PostMedia;
import com.jh.backend.repository.PostMediaRepository;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.service.AdminPostService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.file.UploadedFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPostServiceImpl implements AdminPostService {

    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
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
}
