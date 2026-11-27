import "server-only";

import type { SkillResponse, SkillSaveRequest } from "@/shared/_generated";
import type { DeleteSkillPath, UpdateSkillPath } from "@/shared/_generated";
import { adminApiClient } from "@/shared/libs/api/client";

export type CreateSkillBody = SkillSaveRequest;
export type CreateSkillResponse = SkillResponse;
export type DeleteSkillPathParams = DeleteSkillPath;
export type DeleteSkillResponse = unknown;
export type GetSkillsResponse = SkillResponse[];
export type UpdateSkillBody = SkillSaveRequest;
export type UpdateSkillPathParams = UpdateSkillPath;
export type UpdateSkillResponse = SkillResponse;

export async function createSkill(body: CreateSkillBody) {
  return adminApiClient<CreateSkillResponse>("/api/admin/skills", {
    method: "POST",
    body,
  });
}

export async function deleteSkill(params: DeleteSkillPathParams) {
  return adminApiClient<DeleteSkillResponse>(`/api/admin/skills/${params.skillId}`, {
    method: "DELETE",
  });
}

export async function getSkills() {
  return adminApiClient<GetSkillsResponse>("/api/admin/skills", {
    method: "GET",
  });
}

export async function updateSkill(params: UpdateSkillPathParams, body: UpdateSkillBody) {
  return adminApiClient<UpdateSkillResponse>(`/api/admin/skills/${params.skillId}`, {
    method: "PUT",
    body,
  });
}
