import "server-only";

import type {
  CreateSkillResponseDto,
  FindAllSkillCategoriesResponseDto,
  FindAllSkillsResponseDto,
  UpdateSkillResponseDto,
} from "@/shared/_generated";
import type { DeleteSkillPath, FindAllSkillsQuery, UpdateSkillPath } from "@/shared/_generated";
import { adminApiClient } from "@/shared/libs/api/client";

export type CreateSkillBody = FormData;
export type CreateSkillResponse = CreateSkillResponseDto;
export type DeleteSkillPathParams = DeleteSkillPath;
export type DeleteSkillResponse = unknown;
export type FindAllSkillCategoriesResponse = FindAllSkillCategoriesResponseDto;
export type FindAllSkillsQueryParams = FindAllSkillsQuery;
export type FindAllSkillsResponse = FindAllSkillsResponseDto;
export type UpdateSkillBody = FormData;
export type UpdateSkillPathParams = UpdateSkillPath;
export type UpdateSkillResponse = UpdateSkillResponseDto;

export async function createSkill(body: CreateSkillBody) {
  return adminApiClient<CreateSkillResponse>("/api/admin/skill", {
    method: "POST",
    body,
  });
}

export async function deleteSkill(params: DeleteSkillPathParams) {
  return adminApiClient<DeleteSkillResponse>(`/api/admin/skill/${params.skillId}`, {
    method: "DELETE",
  });
}

export async function findAllSkillCategories() {
  return adminApiClient<FindAllSkillCategoriesResponse>("/api/admin/skill/category", {
    method: "GET",
  });
}

export async function findAllSkills(params: FindAllSkillsQueryParams = {}) {
  return adminApiClient<FindAllSkillsResponse>("/api/admin/skill", {
    method: "GET",
    query: params,
  });
}

export async function updateSkill(params: UpdateSkillPathParams, body: UpdateSkillBody) {
  return adminApiClient<UpdateSkillResponse>(`/api/admin/skill/${params.skillId}`, {
    method: "PATCH",
    body,
  });
}
