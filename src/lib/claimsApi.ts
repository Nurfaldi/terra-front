import { apiRequest } from "@/lib/api";
import type {
  ClaimCaseCreateResponse,
  ClaimCaseDeleteResponse,
  ClaimCaseDetail,
  ClaimCaseListResponse,
} from "@/types/claims";

export async function uploadClaimCase(
  files: File[],
  caseId?: string
): Promise<ClaimCaseCreateResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (caseId?.trim()) {
    formData.append("case_id", caseId.trim());
  }

  return apiRequest<ClaimCaseCreateResponse>("/claims/cases/upload", {
    method: "POST",
    body: formData,
  });
}

export async function listClaimCases(
  status?: string
): Promise<ClaimCaseListResponse> {
  const params = new URLSearchParams();
  if (status && status !== "ALL") {
    params.append("status", status);
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return apiRequest<ClaimCaseListResponse>(`/claims/cases${suffix}`, {
    method: "GET",
  });
}

export async function getClaimCase(caseId: string): Promise<ClaimCaseDetail> {
  return apiRequest<ClaimCaseDetail>(
    `/claims/cases/${encodeURIComponent(caseId)}`,
    {
      method: "GET",
    }
  );
}

export async function getClaimCaseJson(caseId: string): Promise<unknown> {
  return apiRequest<unknown>(`/claims/cases/${encodeURIComponent(caseId)}/json`, {
    method: "GET",
  });
}

export async function reprocessClaimCase(
  caseId: string
): Promise<ClaimCaseCreateResponse> {
  return apiRequest<ClaimCaseCreateResponse>(
    `/claims/cases/${encodeURIComponent(caseId)}/reprocess`,
    {
      method: "POST",
    }
  );
}

export async function deleteClaimCase(
  caseId: string
): Promise<ClaimCaseDeleteResponse> {
  return apiRequest<ClaimCaseDeleteResponse>(
    `/claims/cases/${encodeURIComponent(caseId)}`,
    {
      method: "DELETE",
    }
  );
}
