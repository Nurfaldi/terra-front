import { apiRequest } from "./api";
import type {
  OrigoJobData,
  OrigoJobSummary,
  OrigoSubmitResponse,
  PatchPageRequest,
} from "../types/origo";

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadOrigoDocuments(
  files: File[],
  userId?: string
): Promise<OrigoSubmitResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (userId) formData.append("user_id", userId);

  return apiRequest<OrigoSubmitResponse>("/origo/upload", {
    method: "POST",
    body: formData,
  });
}

// ── Get Results ─────────────────────────────────────────────────────────────

export async function getOrigoJobFull(
  jobId: string,
  userId?: string
): Promise<OrigoJobData> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<OrigoJobData>(`/origo/${jobId}${params}`);
}

// ── List Jobs ───────────────────────────────────────────────────────────────

export async function listOrigoJobs(
  userId?: string
): Promise<OrigoJobSummary[]> {
  const params = new URLSearchParams({ pipeline: "origo" });
  if (userId) params.set("user_id", userId);
  return apiRequest<OrigoJobSummary[]>(`/jobs/?${params.toString()}`);
}

// ── Patch (Manual Edit) ─────────────────────────────────────────────────────

export async function patchOrigoJob(
  jobId: string,
  pages: PatchPageRequest[]
): Promise<{ status: string; pages_updated: number }> {
  return apiRequest(`/origo/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify({ pages }),
  });
}

// ── Rerun ───────────────────────────────────────────────────────────────────

export async function rerunOrigoJob(
  jobId: string,
  userInstructions?: string
): Promise<OrigoSubmitResponse> {
  return apiRequest<OrigoSubmitResponse>(`/origo/${jobId}/rerun`, {
    method: "POST",
    body: JSON.stringify({ user_instructions: userInstructions }),
  });
}

// ── Delete ──────────────────────────────────────────────────────────────────

export async function deleteOrigoJob(jobId: string): Promise<void> {
  return apiRequest(`/jobs/${jobId}`, { method: "DELETE" });
}
