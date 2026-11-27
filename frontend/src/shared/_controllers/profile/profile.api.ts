import "server-only";

import type {
  FindProfileResponseDto,
  UpdateProfileRequestDto,
  UpdateProfileResponseDto,
  UpdateProfileSkillsRequestDto,
  UpdateProfileSkillsResponseDto,
  UploadProfileImageResponseDto,
} from "@/shared/_generated";
import { publicApiClient, adminApiClient } from "@/shared/libs/api/client";

export type DeleteProfileImageResponse = unknown;
export type FindProfileResponse = FindProfileResponseDto;
export type UpdateProfileBody = UpdateProfileRequestDto;
export type UpdateProfileResponse = UpdateProfileResponseDto;
export type UpdateProfileSkillsBody = UpdateProfileSkillsRequestDto;
export type UpdateProfileSkillsResponse = UpdateProfileSkillsResponseDto;
export type UploadProfileImageBody = FormData;
export type UploadProfileImageResponse = UploadProfileImageResponseDto;

export async function deleteProfileImage() {
  return adminApiClient<DeleteProfileImageResponse>("/api/admin/profile/image", {
    method: "DELETE",
  });
}

export async function findProfile() {
  return publicApiClient<FindProfileResponse>("/api/profile", {
    method: "GET",
  });
}

export async function updateProfile(body: UpdateProfileBody) {
  return adminApiClient<UpdateProfileResponse>("/api/admin/profile", {
    method: "PATCH",
    body,
  });
}

export async function updateProfileSkills(body: UpdateProfileSkillsBody) {
  return adminApiClient<UpdateProfileSkillsResponse>("/api/admin/profile/skill", {
    method: "PUT",
    body,
  });
}

export async function uploadProfileImage(body: UploadProfileImageBody) {
  return adminApiClient<UploadProfileImageResponse>("/api/admin/profile/image", {
    method: "POST",
    body,
  });
}
