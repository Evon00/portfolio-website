import "server-only";

import type { ProfileResponse, ProfileSaveRequest } from "@/shared/_controllers/_legacy-types";
import { publicApiClient, adminApiClient } from "@/shared/libs/api/client";

export type GetProfileResponse = ProfileResponse;
export type UpdateProfileBody = ProfileSaveRequest;
export type UpdateProfileResponse = ProfileResponse;

export async function getProfile() {
  return publicApiClient<GetProfileResponse>("/api/profile", {
    method: "GET",
  });
}

export async function updateProfile(body: UpdateProfileBody) {
  return adminApiClient<UpdateProfileResponse>("/api/admin/profile", {
    method: "PUT",
    body,
  });
}
