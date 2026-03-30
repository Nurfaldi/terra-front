export type ClaimCaseStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR";

export interface ClaimCaseSummary {
  case_id: string;
  job_id: string;
  status: ClaimCaseStatus;
  raw_status: string;
  pipeline: string;
  source_files: string[];
  created_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  total_pages?: number | null;
  processed_pages?: number | null;
  error_message?: string | null;
}

export interface ClaimCaseAttempt {
  job_id: string;
  status: ClaimCaseStatus;
  raw_status: string;
  created_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface ClaimCaseDetail extends ClaimCaseSummary {
  attempts: ClaimCaseAttempt[];
  result?: Record<string, unknown> | null;
}

export interface ClaimCaseListResponse {
  cases: ClaimCaseSummary[];
  total: number;
}

export interface ClaimCaseCreateResponse {
  case_id: string;
  job_id: string;
  status: ClaimCaseStatus;
  message: string;
}

export interface ClaimCaseDeleteResponse {
  message: string;
  deleted: number;
}
