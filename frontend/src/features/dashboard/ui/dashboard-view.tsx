"use client";

import { AdminPanel, PanelHeader } from "@/shared/components/admin/panel";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { useDashboardQuery } from "@/shared/_controllers/dashboard";
import { ChartBarRow } from "./chart-bar-row";
import { DonutChart } from "./donut-chart";
import { StatCard } from "./stat-card";

// Figma 관리자 · 대시보드: 요약 4칸 · 인기 게시글 · 블로그/프로젝트 기술 스택 비율
export function DashboardView() {
  const { data, isPending, isError, refetch } = useDashboardQuery();
  if (isPending) return <AdminLoading />;
  if (isError) return <AdminLoadError onRetry={() => refetch()} />;

  const maxViews = data.popularPosts[0]?.viewCount ?? 0;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="총 게시글" value={data.totalPosts} field="totalPosts" icon="file" tone="sage" />
        <StatCard label="총 프로젝트" value={data.totalProjects} field="totalProjects" icon="folder" tone="blue" />
        <StatCard label="총 조회수" value={data.totalViews} field="totalViews" icon="eye" tone="lavender" />
        <StatCard label="글당 평균 조회수" value={data.avgViews} field="avgViews" icon="chart" tone="mustard" />
      </div>
      <AdminPanel className="flex flex-col gap-5">
        <PanelHeader title="인기 게시글" description="조회수 기준 상위 5개" />
        <ol className="flex flex-col gap-3">
          {data.popularPosts.map((post, i) => (
            <ChartBarRow key={post.postId} rank={i + 1} title={post.title} value={post.viewCount} max={maxViews} />
          ))}
        </ol>
      </AdminPanel>
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanel className="flex flex-col gap-5">
          <PanelHeader title="블로그 기술 스택 비율" description="게시글에 태그된 기술 스택 기준 · 상위 5개" />
          <DonutChart shares={data.postSkills} unit="개 태그" />
        </AdminPanel>
        <AdminPanel className="flex flex-col gap-5">
          <PanelHeader title="프로젝트 기술 스택 비율" description="프로젝트에 사용한 기술 스택 기준 · 상위 5개" />
          <DonutChart shares={data.projectSkills} unit="개 스킬" />
        </AdminPanel>
      </div>
    </>
  );
}
