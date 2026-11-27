import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 객체에서 일부 필드를 빼고 나머지를 쓰는 구조 분해({ content: _content, ...rest })는 허용한다.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // 목 구현(_controllers/_mock)은 _controllers 안(data-source.server.ts)에서만 부른다.
    // 화면·훅·라이브러리가 목을 직접 부르면 Spring 연결 때 "목 폴더 삭제 + 스위치 한 곳 수정"으로 끝나지 않는다.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/_controllers/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/_mock", "**/_mock/**"],
              message: "목은 _controllers 안에서만 부른다. <도메인>.service.ts나 data-source.server.ts를 거쳐 쓴다.",
            },
          ],
        },
      ],
    },
  },
  // Prettier와 겹치는 서식 규칙을 끈다. 항상 마지막에 둔다.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
