import "server-only";

import type {
  PostDetailResponse,
  PostSaveRequest,
  PostSummaryResponse,
  SlugCheckResponse,
  ViewCountResponse,
} from "@/shared/_generated";
import type {
  DeletePostPath,
  GetPostByIdPath,
  GetPostBySlugPath,
  IncreasePostViewPath,
  IsPostSlugAvailableQuery,
  UpdatePostPath,
} from "@/shared/_generated";
import { publicApiClient, adminApiClient } from "@/shared/libs/api/client";

export type CreatePostBody = PostSaveRequest;
export type CreatePostResponse = PostDetailResponse;
export type DeletePostPathParams = DeletePostPath;
export type DeletePostResponse = unknown;
export type GetPostByIdPathParams = GetPostByIdPath;
export type GetPostByIdResponse = PostDetailResponse;
export type GetPostBySlugPathParams = GetPostBySlugPath;
export type GetPostBySlugResponse = PostDetailResponse;
export type GetPostSummariesResponse = PostSummaryResponse[];
export type IncreasePostViewPathParams = IncreasePostViewPath;
export type IncreasePostViewResponse = ViewCountResponse;
export type IsPostSlugAvailableQueryParams = IsPostSlugAvailableQuery;
export type IsPostSlugAvailableResponse = SlugCheckResponse;
export type UpdatePostBody = PostSaveRequest;
export type UpdatePostPathParams = UpdatePostPath;
export type UpdatePostResponse = PostDetailResponse;

export async function createPost(body: CreatePostBody) {
  return adminApiClient<CreatePostResponse>("/api/admin/posts", {
    method: "POST",
    body,
  });
}

export async function deletePost(params: DeletePostPathParams) {
  return adminApiClient<DeletePostResponse>(`/api/admin/posts/${params.postId}`, {
    method: "DELETE",
  });
}

export async function getPostById(params: GetPostByIdPathParams) {
  return adminApiClient<GetPostByIdResponse>(`/api/admin/posts/${params.postId}`, {
    method: "GET",
  });
}

export async function getPostBySlug(params: GetPostBySlugPathParams) {
  return publicApiClient<GetPostBySlugResponse>(`/api/posts/slug/${params.slug}`, {
    method: "GET",
  });
}

export async function getPostSummaries() {
  return publicApiClient<GetPostSummariesResponse>("/api/posts", {
    method: "GET",
  });
}

export async function increasePostView(params: IncreasePostViewPathParams) {
  return publicApiClient<IncreasePostViewResponse>(`/api/posts/${params.postId}/views`, {
    method: "POST",
  });
}

export async function isPostSlugAvailable(params: IsPostSlugAvailableQueryParams) {
  return adminApiClient<IsPostSlugAvailableResponse>("/api/admin/posts/slug-check", {
    method: "GET",
    query: params,
  });
}

export async function updatePost(params: UpdatePostPathParams, body: UpdatePostBody) {
  return adminApiClient<UpdatePostResponse>(`/api/admin/posts/${params.postId}`, {
    method: "PUT",
    body,
  });
}
