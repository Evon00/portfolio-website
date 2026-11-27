import type { Metadata } from "next";
import { getCachedProjectSummaries } from "@/shared/_controllers/project/index.server";
import { toProjectCardView } from "@/shared/_controllers/project";
import { ProjectList } from "@/features/project/ui/project-list";
import { Container } from "@/shared/components/container";
import { ListHeading, TotalCount } from "@/shared/components/list-heading";

export const metadata: Metadata = { title: "프로젝트" };

export default async function ProjectsPage() {
  const projects = (await getCachedProjectSummaries()).map(toProjectCardView);
  return (
    <>
      <Container className="pt-fluid-40-56">
        <ListHeading
          title="프로젝트"
          count={<TotalCount count={projects.length} unit="개의 프로젝트" />}
          character={{ name: "blob-mustard-happy", className: "aspect-[170/101.4] w-fluid-120-170" }}
        />
      </Container>
      <Container className="pt-fluid-40-56 pb-fluid-96-120">
        <ProjectList projects={projects} />
      </Container>
    </>
  );
}
