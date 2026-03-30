import { apiRequest } from "@/lib/api";
import type {
  ArabicClaimsData,
  ArabicClaimsJobSummary,
  PageData,
  ReanalyzeResponse,
  SubmitResponse,
} from "@/types/arabicClaims";

export async function uploadArabicClaim(
  files: File[],
  claimType: string = "IP"
): Promise<SubmitResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("claim_type", claimType);

  return apiRequest<SubmitResponse>("/arabic-claims/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getArabicClaimFull(
  jobId: string
): Promise<ArabicClaimsData> {
  return apiRequest<ArabicClaimsData>(
    `/arabic-claims/${encodeURIComponent(jobId)}/full`,
    { method: "GET" }
  );
}

export async function getArabicClaimPages(
  jobId: string
): Promise<PageData[]> {
  return apiRequest<PageData[]>(
    `/arabic-claims/${encodeURIComponent(jobId)}/pages`,
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
  }
): Promise<ReanalyzeResponse> {
  return apiRequest<ReanalyzeResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/reanalyze`,
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
  jobId: string
): Promise<ArabicClaimsJobSummary> {
  return apiRequest<ArabicClaimsJobSummary>(
    `/jobs/${encodeURIComponent(jobId)}`,
    { method: "GET" }
  );
}

export async function listArabicClaimsJobs(
  status?: string
): Promise<ArabicClaimsJobSummary[]> {
  const params = new URLSearchParams();
  params.append("pipeline", "arabic_claims");
  if (status && status !== "ALL") {
    params.append("status", status);
  }
  params.append("limit", "50");
  return apiRequest<ArabicClaimsJobSummary[]>(`/jobs/?${params.toString()}`, {
    method: "GET",
  });
}

export interface PdfUrlResponse {
  merged_pdf_url: string | null;
  page_pdf_urls: Record<number, string>;
}

export async function getPdfUrls(jobId: string): Promise<PdfUrlResponse> {
  return apiRequest<PdfUrlResponse>(
    `/arabic-claims/${encodeURIComponent(jobId)}/pdf-url`,
    { method: "GET" }
  );
}

export async function deleteArabicClaim(jobId: string): Promise<void> {
  return apiRequest<void>(
    `/jobs/${encodeURIComponent(jobId)}`,
    { method: "DELETE" }
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
