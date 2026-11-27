import "server-only";

import type { DashboardResponse } from "@/shared/_controllers/_legacy-types";
import { adminApiClient } from "@/shared/libs/api/client";

export type GetDashboardResponse = DashboardResponse;

export async function getDashboard() {
  return adminApiClient<GetDashboardResponse>("/api/admin/dashboard", {
    method: "GET",
  });
}
