import type {
  FindPopularPostsResponseDto,
  FindSkillStatsResponseDto,
  FindStatsSummaryResponseDto,
} from "@/shared/_generated";

// 대시보드 화면용 타입과 변환 함수. Spring 통계 API 4개 응답을 화면 한 장으로 합친다.

/** 인기 게시글·기술 스택 비율을 위에서 몇 개 보여 줄지 (Figma: 상위 5개) */
export const DASHBOARD_TOP_COUNT = 5;

/** 도넛 한 칸. ratio는 서버가 준 정수 퍼센트(칸 전체 합 100). etc는 상위 N개 밖을 묶은 "기타" 칸 */
export type SkillShareView = { name: string; count: number; ratio: number; etc: boolean };

/** 도넛 하나. total은 가운데 숫자, shares는 상위 N개 + 기타(있을 때만) */
export type SkillStatsView = { total: number; shares: SkillShareView[] };

export type PopularPostView = { rank: number; postId: number; title: string; viewCount: number };

export type DashboardView = FindStatsSummaryResponseDto & {
  popularPosts: PopularPostView[];
  postSkills: SkillStatsView;
  projectSkills: SkillStatsView;
};

function toSkillStatsView(stats: FindSkillStatsResponseDto): SkillStatsView {
  const shares: SkillShareView[] = stats.items.map((item) => ({
    name: item.skillName,
    count: item.count,
    ratio: item.ratio,
    etc: false,
  }));
  // 나머지가 없으면 서버는 etc를 { count: 0, ratio: 0 }으로 준다.
  if (stats.etc.count > 0) shares.push({ name: "기타", count: stats.etc.count, ratio: stats.etc.ratio, etc: true });
  return { total: stats.totalCount, shares };
}

export function toDashboardView(
  summary: FindStatsSummaryResponseDto,
  popular: FindPopularPostsResponseDto,
  postSkills: FindSkillStatsResponseDto,
  projectSkills: FindSkillStatsResponseDto,
): DashboardView {
  return {
    totalPosts: summary.totalPosts,
    totalProjects: summary.totalProjects,
    totalViews: summary.totalViews,
    avgViews: summary.avgViews,
    popularPosts: popular.posts.map((post) => ({
      rank: post.rank,
      postId: post.postId,
      title: post.postTitle,
      viewCount: post.postView,
    })),
    postSkills: toSkillStatsView(postSkills),
    projectSkills: toSkillStatsView(projectSkills),
  };
}
