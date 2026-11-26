package com.jh.backend.util.file;

import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/*
SVG 안전성 검사
- 스크립트, 이벤트, 외부 참조, DOCTYPE이 있으면 거부합니다.
 */
final class SvgValidator {

    private static final String SVG_NS = "http://www.w3.org/2000/svg";
    private static final String XHTML_NS = "http://www.w3.org/1999/xhtml";

    private static final Set<String> BLOCKED_ELEMENTS = Set.of(
            "script", "foreignobject", "iframe", "embed", "object", "audio", "video", "handler", "listener");
    private static final Set<String> ANIMATION_ELEMENTS = Set.of("animate", "animatemotion", "animatetransform", "set");

    // 문서 내부 참조(#id)와 이미지 데이터만 허용
    private static final Pattern SAFE_HREF = Pattern.compile("^(#.*|data:image/(png|jpeg|gif|webp);base64,.*)$", Pattern.DOTALL);
    private static final Pattern EXTERNAL_URL = Pattern.compile("url\\(\\s*['\"]?\\s*(?!['\"#\\s])");
    private static final Pattern BLOCKED_STYLE = Pattern.compile("@import|image-set|expression\\(|\\\\");

    private SvgValidator() {
    }

    static boolean isSafe(byte[] bytes) {
        try {
            Element root = createBuilder().parse(new ByteArrayInputStream(bytes)).getDocumentElement();
            return "svg".equals(root.getLocalName()) && SVG_NS.equals(root.getNamespaceURI())
                    && isSafeTree(root.getOwnerDocument());
        } catch (SAXException | IOException ex) {
            return false;
        } catch (ParserConfigurationException ex) {
            throw new IllegalStateException(ex);
        }
    }

    // DOCTYPE, 외부 엔티티 차단 (XXE)
    private static DocumentBuilder createBuilder() throws ParserConfigurationException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);
        factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        builder.setErrorHandler(new DefaultHandler());
        return builder;
    }

    // 깊게 중첩된 파일에서도 스택이 넘치지 않도록 반복문으로 순회
    private static boolean isSafeTree(Node root) {
        Node node = root;
        while (node != null) {
            if (node.getNodeType() == Node.PROCESSING_INSTRUCTION_NODE) return false;
            if (node instanceof Element element && !isSafeElement(element)) return false;

            if (node.getFirstChild() != null) {
                node = node.getFirstChild();
                continue;
            }
            while (node != null && node != root && node.getNextSibling() == null) {
                node = node.getParentNode();
            }
            node = node == null || node == root ? null : node.getNextSibling();
        }
        return true;
    }

    private static boolean isSafeElement(Element element) {
        String name = element.getLocalName().toLowerCase(Locale.ROOT);

        if (XHTML_NS.equals(element.getNamespaceURI()) || BLOCKED_ELEMENTS.contains(name)) return false;
        if ("style".equals(name) && !isSafeStyle(element.getTextContent())) return false;

        NamedNodeMap attributes = element.getAttributes();
        for (int i = 0; i < attributes.getLength(); i++) {
            if (!isSafeAttribute(name, (Attr) attributes.item(i))) return false;
        }
        return true;
    }

    private static boolean isSafeAttribute(String elementName, Attr attribute) {
        if (XMLConstants.XMLNS_ATTRIBUTE_NS_URI.equals(attribute.getNamespaceURI())) return true;

        String name = attribute.getLocalName().toLowerCase(Locale.ROOT);
        String value = attribute.getValue().strip().toLowerCase(Locale.ROOT);

        return switch (name) {
            case "href", "src" -> SAFE_HREF.matcher(value).matches();
            case "base" -> false;
            case "attributename" -> !ANIMATION_ELEMENTS.contains(elementName)
                    || !(value.endsWith("href") || value.startsWith("on"));
            default -> !name.startsWith("on") && !value.contains("javascript:") && isSafeStyle(value);
        };
    }

    private static boolean isSafeStyle(String value) {
        String lower = value.toLowerCase(Locale.ROOT);
        return !EXTERNAL_URL.matcher(lower).find() && !BLOCKED_STYLE.matcher(lower).find();
    }
}
