package com.jh.backend.util.markdown;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/*
마크다운 본문 이미지 추출
- ![alt](url), ![alt](<url> "title"), <img src="" alt=""> (속성 순서 무관)를 본문에 나온 순서대로 추출합니다.
- 코드 블록(```, ~~~)과 인라인 코드(`) 안의 이미지는 무시합니다.
 */
@Component
public class MarkdownImageExtractor {

    // 코드 블록, 인라인 코드
    private static final Pattern CODE = Pattern.compile("(?ms)^[ \\t]*(```|~~~).*?^[ \\t]*\\1[ \\t]*$|`[^`\\n]+`");

    // 마크다운 이미지 또는 img 태그
    private static final Pattern IMAGE = Pattern.compile(
            "!\\[(?<alt>[^\\]]*)]\\(\\s*<?(?<url>[^\\s)>]+)>?(?:\\s+[\"'][^\"']*[\"'])?\\s*\\)"
                    + "|(?<tag><img\\b[^>]*>)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern SRC = Pattern.compile("\\bsrc\\s*=\\s*[\"']([^\"']*)[\"']", Pattern.CASE_INSENSITIVE);
    private static final Pattern ALT = Pattern.compile("\\balt\\s*=\\s*[\"']([^\"']*)[\"']", Pattern.CASE_INSENSITIVE);

    // 본문 이미지 목록 (본문에 나온 순서)
    public List<MarkdownImage> extract(String content) {
        List<MarkdownImage> images = new ArrayList<>();
        if (content == null || content.isEmpty()) return images;

        Matcher matcher = IMAGE.matcher(CODE.matcher(content).replaceAll(""));
        while (matcher.find()) {
            if (matcher.group("tag") == null) {
                images.add(new MarkdownImage(matcher.group("url"), matcher.group("alt")));
                continue;
            }
            String src = findAttribute(SRC, matcher.group("tag"));
            if (src != null && !src.isBlank()) {
                images.add(new MarkdownImage(src.strip(), findAttribute(ALT, matcher.group("tag"))));
            }
        }
        return images;
    }

    private String findAttribute(Pattern pattern, String tag) {
        Matcher matcher = pattern.matcher(tag);
        return matcher.find() ? matcher.group(1) : null;
    }

    // 본문 이미지 (주소, 대체 텍스트)
    public record MarkdownImage(String url, String alt) {
    }
}
