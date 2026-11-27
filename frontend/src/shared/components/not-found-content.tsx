import { Button } from "./button";
import { ErrorPage } from "./error-page";

export function NotFoundContent() {
  return (
    <ErrorPage
      type="404"
      title="찾는 페이지가 없어요"
      description={
        <>
          주소가 바뀌었거나
          <br />
          삭제된 프로젝트, 글일 수 있어요.
        </>
      }
      actions={
        <>
          <Button href="/" className="min-w-40">
            메인으로 가기
          </Button>
          <Button href="/projects" variant="outline" className="min-w-40">
            프로젝트 목록
          </Button>
          <Button href="/blog" variant="outline" className="min-w-40">
            블로그 목록
          </Button>
        </>
      }
    />
  );
}
