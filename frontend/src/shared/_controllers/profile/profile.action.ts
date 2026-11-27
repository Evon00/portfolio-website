"use server";

import type { ProfileSaveRequest } from "@/shared/_generated";
import { invalidateProfile } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { updateProfile } from "./profile.service";

export async function updateProfileAction(request: ProfileSaveRequest) {
  return withAdminAction(async () => {
    const profile = await updateProfile(request);
    invalidateProfile();
    return profile;
  });
}
