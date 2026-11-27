import type { ReactNode } from "react";
import { Container } from "./container";
import { ErrorVisual } from "./error-visual";

// Figma 404 페이지 없음 · 500 서버·네트워크 오류 (폭 780, 위 80 · 아래 160).
type ErrorPageProps = {
  type: "404" | "500";
  title: string;
  description: ReactNode;
  actions: ReactNode;
};

export function ErrorPage(props: ErrorPageProps) {
  const { type, title, description, actions } = props;
  return (
    <Container size="narrow" className="flex flex-col items-center pt-fluid-56-80 pb-fluid-128-160 text-center">
      <ErrorVisual type={type} />
      <h1 className="mt-10 font-display text-title-2 text-content-01 md:text-title-1">{title}</h1>
      <p className="mt-3.5 text-body-article text-content-02">{description}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
    </Container>
  );
}
