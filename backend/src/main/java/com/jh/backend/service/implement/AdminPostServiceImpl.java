package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import com.jh.backend.entity.PostMedia;
import com.jh.backend.repository.PostMediaRepository;
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
}
