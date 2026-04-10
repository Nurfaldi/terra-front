// ── Document Types ──────────────────────────────────────────────────────────

export const ORIGO_DOCUMENT_TYPES = [
  "surat_keterangan_lahir",
  "ktp_ayah",
  "ktp_ibu",
  "kartu_keluarga",
  "buku_nikah",
  "f101_biodata",
  "f201_pencatatan_sipil",
  "unknown",
] as const;

export type OrigoDocumentType = (typeof ORIGO_DOCUMENT_TYPES)[number];

export const ORIGO_DOCUMENT_TYPE_LABELS: Record<OrigoDocumentType, string> = {
  surat_keterangan_lahir: "Surat Keterangan Lahir",
  ktp_ayah: "KTP Ayah",
  ktp_ibu: "KTP Ibu",
  kartu_keluarga: "Kartu Keluarga",
  buku_nikah: "Buku Nikah",
  f101_biodata: "F-1.01 Biodata Keluarga",
  f201_pencatatan_sipil: "F-2.01 Pencatatan Sipil",
  unknown: "Tidak Diketahui",
};

// ── Page Data ───────────────────────────────────────────────────────────────

export interface OrigoPage {
  page_id: string;
  document_filename: string;
  page_number: number;
  image_url: string | null;
  category: OrigoDocumentType | null;
  extraction: Record<string, unknown> | null;
  status: "pending" | "extracted" | "failed";
  manually_reviewed: boolean;
}

// ── Validation ──────────────────────────────────────────────────────────────

export type ValidationStatus = "pass" | "fail" | "warning";

export interface OrigoValidationResult {
  rule_id: string;
  rule_name: string;
  category: string;
  status: ValidationStatus;
  severity: "error" | "warning" | "info";
  message: string;
  source_pages: string[];
  conflicting_values: Record<string, Record<string, string>>;
  reviewed: boolean;
  llm_verdict: "pass" | "fail" | null;
  llm_reasoning: string | null;
}

// ── Job Data ────────────────────────────────────────────────────────────────

export interface OrigoJobData {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  overall_validation_status: "pass" | "fail" | "pending";
  baby_name?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  birth_date?: string | null;
  total_documents: number;
  total_pages: number;
  pages: OrigoPage[];
  validation_results: OrigoValidationResult[];
  created_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
}

export interface OrigoJobSummary {
  job_id: string;
  pipeline: string;
  status: string;
  claim_type?: string | null;
  result?: {
    overall_status?: string;
    baby_name?: string;
    total_pages?: number;
    validation_results?: { status: string }[];
  } | null;
  created_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
}

export interface OrigoSubmitResponse {
  job_id: string;
  status: string;
}

// ── Patch Request ───────────────────────────────────────────────────────────

export interface PatchPageRequest {
  page_id: string;
  category?: string | null;
  extraction?: Record<string, unknown> | null;
}
