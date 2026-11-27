import "server-only";

import type {
  FindPopularPostsResponseDto,
  FindSkillStatsResponseDto,
  FindStatsSummaryResponseDto,
} from "@/shared/_generated";
import type { FindPopularPostsQuery, FindSkillStatsQuery } from "@/shared/_generated";
import { adminApiClient } from "@/shared/libs/api/client";

export type FindPopularPostsQueryParams = FindPopularPostsQuery;
export type FindPopularPostsResponse = FindPopularPostsResponseDto;
export type FindSkillStatsQueryParams = FindSkillStatsQuery;
export type FindSkillStatsResponse = FindSkillStatsResponseDto;
export type FindStatsSummaryResponse = FindStatsSummaryResponseDto;

export async function findPopularPosts(params: FindPopularPostsQueryParams = {}) {
  return adminApiClient<FindPopularPostsResponse>("/api/admin/stats/post/popular", {
    method: "GET",
    query: params,
  });
}

export async function findSkillStats(params: FindSkillStatsQueryParams) {
  return adminApiClient<FindSkillStatsResponse>("/api/admin/stats/skill", {
    method: "GET",
    query: params,
  });
}

export async function findStatsSummary() {
  return adminApiClient<FindStatsSummaryResponse>("/api/admin/stats/summary", {
    method: "GET",
  });
}
