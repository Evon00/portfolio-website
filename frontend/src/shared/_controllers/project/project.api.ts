import "server-only";

import type {
  CheckProjectSlugResponseDto,
  CreateProjectResponseDto,
  FindProjectBySlugResponseDto,
  FindProjectResponseDto,
  PageResponseDtoFindAllAdminProjectsItem,
  PageResponseDtoFindAllProjectsItem,
  UpdateProjectPriorityRequestDto,
  UpdateProjectPriorityResponseDto,
  UpdateProjectResponseDto,
} from "@/shared/_generated";
import type {
  CheckProjectSlugQuery,
  DeleteProjectPath,
  FindAllAdminProjectsQuery,
  FindAllProjectsQuery,
  FindProjectBySlugPath,
  FindProjectPath,
  UpdateProjectPath,
  UpdateProjectPriorityPath,
} from "@/shared/_generated";
import { publicApiClient, adminApiClient } from "@/shared/libs/api/client";

export type CheckProjectSlugQueryParams = CheckProjectSlugQuery;
export type CheckProjectSlugResponse = CheckProjectSlugResponseDto;
export type CreateProjectBody = FormData;
export type CreateProjectResponse = CreateProjectResponseDto;
export type DeleteProjectPathParams = DeleteProjectPath;
export type DeleteProjectResponse = unknown;
export type FindAllAdminProjectsQueryParams = FindAllAdminProjectsQuery;
export type FindAllAdminProjectsResponse = PageResponseDtoFindAllAdminProjectsItem;
export type FindAllProjectsQueryParams = FindAllProjectsQuery;
export type FindAllProjectsResponse = PageResponseDtoFindAllProjectsItem;
export type FindProjectPathParams = FindProjectPath;
export type FindProjectResponse = FindProjectResponseDto;
export type FindProjectBySlugPathParams = FindProjectBySlugPath;
export type FindProjectBySlugResponse = FindProjectBySlugResponseDto;
export type UpdateProjectBody = FormData;
export type UpdateProjectPathParams = UpdateProjectPath;
export type UpdateProjectResponse = UpdateProjectResponseDto;
export type UpdateProjectPriorityBody = UpdateProjectPriorityRequestDto;
export type UpdateProjectPriorityPathParams = UpdateProjectPriorityPath;
export type UpdateProjectPriorityResponse = UpdateProjectPriorityResponseDto;

export async function checkProjectSlug(params: CheckProjectSlugQueryParams) {
  return adminApiClient<CheckProjectSlugResponse>("/api/admin/project/slug/check", {
    method: "GET",
    query: params,
  });
}

export async function createProject(body: CreateProjectBody) {
  return adminApiClient<CreateProjectResponse>("/api/admin/project", {
    method: "POST",
    body,
  });
}

export async function deleteProject(params: DeleteProjectPathParams) {
  return adminApiClient<DeleteProjectResponse>(`/api/admin/project/${params.projectId}`, {
    method: "DELETE",
  });
}

export async function findAllAdminProjects(params: FindAllAdminProjectsQueryParams = {}) {
  return adminApiClient<FindAllAdminProjectsResponse>("/api/admin/project", {
    method: "GET",
    query: params,
  });
}

export async function findAllProjects(params: FindAllProjectsQueryParams = {}) {
  return publicApiClient<FindAllProjectsResponse>("/api/project", {
    method: "GET",
    query: params,
  });
}

export async function findProject(params: FindProjectPathParams) {
  return adminApiClient<FindProjectResponse>(`/api/admin/project/${params.projectId}`, {
    method: "GET",
  });
}

export async function findProjectBySlug(params: FindProjectBySlugPathParams) {
  return publicApiClient<FindProjectBySlugResponse>(`/api/project/${params.projectSlug}`, {
    method: "GET",
  });
}

export async function updateProject(params: UpdateProjectPathParams, body: UpdateProjectBody) {
  return adminApiClient<UpdateProjectResponse>(`/api/admin/project/${params.projectId}`, {
    method: "PATCH",
    body,
  });
}

export async function updateProjectPriority(params: UpdateProjectPriorityPathParams, body: UpdateProjectPriorityBody) {
  return adminApiClient<UpdateProjectPriorityResponse>(`/api/admin/project/${params.projectId}/priority`, {
    method: "PATCH",
    body,
  });
}
