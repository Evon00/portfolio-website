import "server-only";

import type {
  CheckPostSlugResponseDto,
  CreatePostRequestDto,
  CreatePostResponseDto,
  FindPostBySlugResponseDto,
  FindPostResponseDto,
  IncreasePostViewResponseDto,
  PageResponseDtoFindAllAdminPostsItem,
  PageResponseDtoFindAllPostsItem,
  UpdatePostRequestDto,
  UpdatePostResponseDto,
  UploadPostImageResponseDto,
} from "@/shared/_generated";
import type {
  CheckPostSlugQuery,
  DeletePostPath,
  FindAllAdminPostsQuery,
  FindAllPostsQuery,
  FindPostBySlugPath,
  FindPostPath,
  IncreasePostViewPath,
  UpdatePostPath,
} from "@/shared/_generated";
import { publicApiClient, adminApiClient } from "@/shared/libs/api/client";

export type CheckPostSlugQueryParams = CheckPostSlugQuery;
export type CheckPostSlugResponse = CheckPostSlugResponseDto;
export type CreatePostBody = CreatePostRequestDto;
export type CreatePostResponse = CreatePostResponseDto;
export type DeletePostPathParams = DeletePostPath;
export type DeletePostResponse = unknown;
export type FindAllAdminPostsQueryParams = FindAllAdminPostsQuery;
export type FindAllAdminPostsResponse = PageResponseDtoFindAllAdminPostsItem;
export type FindAllPostsQueryParams = FindAllPostsQuery;
export type FindAllPostsResponse = PageResponseDtoFindAllPostsItem;
export type FindPostPathParams = FindPostPath;
export type FindPostResponse = FindPostResponseDto;
export type FindPostBySlugPathParams = FindPostBySlugPath;
export type FindPostBySlugResponse = FindPostBySlugResponseDto;
export type IncreasePostViewPathParams = IncreasePostViewPath;
export type IncreasePostViewResponse = IncreasePostViewResponseDto;
export type UpdatePostBody = UpdatePostRequestDto;
export type UpdatePostPathParams = UpdatePostPath;
export type UpdatePostResponse = UpdatePostResponseDto;
export type UploadPostImageBody = FormData;
export type UploadPostImageResponse = UploadPostImageResponseDto;

export async function checkPostSlug(params: CheckPostSlugQueryParams) {
  return adminApiClient<CheckPostSlugResponse>("/api/admin/post/slug/check", {
    method: "GET",
    query: params,
  });
}

export async function createPost(body: CreatePostBody) {
  return adminApiClient<CreatePostResponse>("/api/admin/post", {
    method: "POST",
    body,
  });
}

export async function deletePost(params: DeletePostPathParams) {
  return adminApiClient<DeletePostResponse>(`/api/admin/post/${params.postId}`, {
    method: "DELETE",
  });
}

export async function findAllAdminPosts(params: FindAllAdminPostsQueryParams = {}) {
  return adminApiClient<FindAllAdminPostsResponse>("/api/admin/post", {
    method: "GET",
    query: params,
  });
}

export async function findAllPosts(params: FindAllPostsQueryParams = {}) {
  return publicApiClient<FindAllPostsResponse>("/api/post", {
    method: "GET",
    query: params,
  });
}

export async function findPost(params: FindPostPathParams) {
  return adminApiClient<FindPostResponse>(`/api/admin/post/${params.postId}`, {
    method: "GET",
  });
}

export async function findPostBySlug(params: FindPostBySlugPathParams) {
  return publicApiClient<FindPostBySlugResponse>(`/api/post/${params.postSlug}`, {
    method: "GET",
  });
}

export async function increasePostView(params: IncreasePostViewPathParams) {
  return publicApiClient<IncreasePostViewResponse>(`/api/post/${params.postId}/view`, {
    method: "POST",
  });
}

export async function updatePost(params: UpdatePostPathParams, body: UpdatePostBody) {
  return adminApiClient<UpdatePostResponse>(`/api/admin/post/${params.postId}`, {
    method: "PATCH",
    body,
  });
}

export async function uploadPostImage(body: UploadPostImageBody) {
  return adminApiClient<UploadPostImageResponse>("/api/admin/post/image", {
    method: "POST",
    body,
  });
}
