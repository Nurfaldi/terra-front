import { apiRequest } from "@/lib/api";
import type {
  ArabicClaimsData,
  ArabicClaimsJobSummary,
  PageData,
  ReanalyzeResponse,
  ShareResponse,
  SubmitResponse,
} from "@/types/arabicClaims";

export async function uploadArabicClaim(
  files: File[],
  claimType: string = "IP",
  userId?: string
): Promise<SubmitResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("claim_type", claimType);
  if (userId) formData.append("user_id", userId);

  return apiRequest<SubmitResponse>("/arabic-claims/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getArabicClaimFull(
  jobId: string,
  userId?: string
): Promise<ArabicClaimsData> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<ArabicClaimsData>(
    `/arabic-claims/${encodeURIComponent(jobId)}/full${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export async function getArabicClaimPages(
  jobId: string,
  userId?: string
): Promise<PageData[]> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<PageData[]>(
    `/arabic-claims/${encodeURIComponent(jobId)}/pages${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export async function reanalyzeArabicClaim(
  jobId: string,
  payload: {
    pages: (PageData & { review_status?: string })[];
    edited_page_numbers: number[];
    user_edited_fields?: string[];
    edited_analysis?: Record<string, unknown>;
    additional_instruction?: string;
  },
  userId?: string
): Promise<ReanalyzeResponse> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<ReanalyzeResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/reanalyze${qs ? `?${qs}` : ""}`,
    {
      method: "POST",
      body: JSON.stringify({
        pages: payload.pages,
        edited_page_numbers: payload.edited_page_numbers,
        user_edited_fields: payload.user_edited_fields || [],
        edited_analysis: payload.edited_analysis || {},
        additional_instruction: payload.additional_instruction || "",
      }),
    }
  );
}

export async function getJobStatus(
  jobId: string,
  userId?: string
): Promise<ArabicClaimsJobSummary> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<ArabicClaimsJobSummary>(
    `/jobs/${encodeURIComponent(jobId)}${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export async function listArabicClaimsJobs(
  status?: string,
  userId?: string
): Promise<ArabicClaimsJobSummary[]> {
  const params = new URLSearchParams();
  params.append("pipeline", "arabic_claims");
  if (status && status !== "ALL") {
    params.append("status", status);
  }
  if (userId) params.append("user_id", userId);
  params.append("limit", "50");
  return apiRequest<ArabicClaimsJobSummary[]>(`/jobs/?${params.toString()}`, {
    method: "GET",
  });
}

export interface PdfUrlResponse {
  merged_pdf_url: string | null;
  page_pdf_urls: Record<number, string>;
}

export async function getPdfUrls(
  jobId: string,
  userId?: string
): Promise<PdfUrlResponse> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<PdfUrlResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/pdf-url${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export async function deleteArabicClaim(
  jobId: string,
  userId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<void>(
    `/jobs/${encodeURIComponent(jobId)}${qs ? `?${qs}` : ""}`,
    { method: "DELETE" }
  );
}

// -- Suggestion Accept/Reject API ---------------------------------------------

export async function acceptSuggestion(
  jobId: string,
  userId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<void>(
    `/arabic-claims/${encodeURIComponent(jobId)}/accept-suggestion${qs ? `?${qs}` : ""}`,
    { method: "POST" }
  );
}

export async function rejectSuggestion(
  jobId: string,
  userId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<void>(
    `/arabic-claims/${encodeURIComponent(jobId)}/reject-suggestion${qs ? `?${qs}` : ""}`,
    { method: "POST" }
  );
}

// -- User Search API ----------------------------------------------------------

export async function searchUsers(
  query: string,
  limit: number = 10
): Promise<string[]> {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("limit", String(limit));
  return apiRequest<string[]>(
    `/arabic-claims/users/search?${params.toString()}`,
    { method: "GET" }
  );
}

// -- Sharing API --------------------------------------------------------------

export async function shareJob(
  jobId: string,
  targetUserId: string,
  permission: "view" | "edit",
  requesterId: string
): Promise<ShareResponse> {
  const params = new URLSearchParams({ requester_id: requesterId });
  return apiRequest<ShareResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/share?${params.toString()}`,
    {
      method: "POST",
      body: JSON.stringify({ user_id: targetUserId, permission }),
    }
  );
}

export async function listShares(
  jobId: string,
  requesterId?: string
): Promise<ShareResponse[]> {
  const params = new URLSearchParams();
  if (requesterId) params.append("requester_id", requesterId);
  const qs = params.toString();
  return apiRequest<ShareResponse[]>(
    `/arabic-claims/${encodeURIComponent(jobId)}/shares${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export async function updateSharePermission(
  jobId: string,
  shareId: string,
  permission: "view" | "edit",
  requesterId: string
): Promise<ShareResponse> {
  const params = new URLSearchParams({ requester_id: requesterId });
  return apiRequest<ShareResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/shares/${encodeURIComponent(shareId)}?${params.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify({ permission }),
    }
  );
}

export async function revokeShare(
  jobId: string,
  shareId: string,
  requesterId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (requesterId) params.append("requester_id", requesterId);
  const qs = params.toString();
  return apiRequest<void>(
    `/arabic-claims/${encodeURIComponent(jobId)}/shares/${encodeURIComponent(shareId)}${qs ? `?${qs}` : ""}`,
    { method: "DELETE" }
  );
}

// -- Link Sharing API ---------------------------------------------------------

export interface LinkSharingResponse {
  job_id: string;
  link_sharing: "off" | "view" | "edit";
}

export async function getLinkSharing(
  jobId: string,
  requesterId?: string
): Promise<LinkSharingResponse> {
  const params = new URLSearchParams();
  if (requesterId) params.append("requester_id", requesterId);
  const qs = params.toString();
  return apiRequest<LinkSharingResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/link-sharing${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export async function updateLinkSharing(
  jobId: string,
  linkSharing: "off" | "view" | "edit",
  requesterId: string
): Promise<LinkSharingResponse> {
  const params = new URLSearchParams({ requester_id: requesterId });
  return apiRequest<LinkSharingResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/link-sharing?${params.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify({ link_sharing: linkSharing }),
    }
  );
}

// -- Page Management API ------------------------------------------------------

export interface PageStatusResponse {
  total: number;
  pending: number;
  extracted: number;
  failed: number;
}

export async function addPages(
  jobId: string,
  files: File[],
  userId?: string
): Promise<SubmitResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<SubmitResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/pages${qs ? `?${qs}` : ""}`,
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function getPageStatus(
  jobId: string,
  userId?: string
): Promise<PageStatusResponse> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<PageStatusResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/pages/status${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export interface ReprocessResponse {
  job_id: string;
  status: string;
  pending_pages: number;
}

export async function reprocessClaim(
  jobId: string,
  payload?: {
    pages?: (PageData & { review_status?: string })[];
    edited_page_numbers?: number[];
    user_edited_fields?: string[];
    edited_analysis?: Record<string, unknown>;
    removed_page_numbers?: number[];
    additional_instruction?: string;
  },
  userId?: string
): Promise<ReprocessResponse> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  const qs = params.toString();
  return apiRequest<ReprocessResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/reprocess${qs ? `?${qs}` : ""}`,
    {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    }
  );
}

// -- ICD-10 Search API --------------------------------------------------------

export interface ICD10SearchResult {
  code: string;
  description: string;
}

export interface ICD10SearchResponse {
  results: ICD10SearchResult[];
  total: number;
}

export async function searchICD10Codes(
  query: string,
  limit: number = 20
): Promise<ICD10SearchResponse> {
  const params = new URLSearchParams();
  params.append("query", query);
  params.append("limit", String(limit));
  return apiRequest<ICD10SearchResponse>(
    `/arabic-claims/icd10/search?${params.toString()}`,
    { method: "GET" }
  );
}

export async function getICD10Code(code: string): Promise<ICD10SearchResult> {
  return apiRequest<ICD10SearchResult>(
    `/arabic-claims/icd10/${encodeURIComponent(code)}`,
    { method: "GET" }
  );
}
