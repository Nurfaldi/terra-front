export interface DateFound {
  raw_text: string;
  normalized_iso?: string;
  calendar_type?: string;
  confidence?: number;
  is_handwritten?: boolean;
}

export interface PageData {
  page_number: number;
  original_text: string;
  medical_translation: string;
  inferred_text?: string | null;
  readability_score: number;
  readability_notes?: string | null;
  confidence_score?: number | null;
  has_ambiguity: boolean;
  key_medical_terms: string[];
  dates_found?: DateFound[];
  status?: string;
}

export interface ChronologicalLogEntry {
  date?: string;
  date_iso?: string;
  event?: string;
  source_page?: number;
}

export interface IcdCode {
  code: string;
  description?: string;
  confidence?: number;
}

export interface DocumentAnalysis {
  summary: string;
  chronological_log: ChronologicalLogEntry[];
  key_findings: string[];
  medical_conditions: string[];
  treatments_mentioned: string[];
  medications: string[];
  recommendations: string[];
  risk_flags: string[];
  overall_readability: number;
  completeness_score: number;
  inferred_case_type?: string;
  case_type_reasoning?: string;
  case_type_confidence?: number;
  claimant_name?: string | null;
  icd_codes?: IcdCode[];
  currency?: string | null;
  total_claimed_amount?: number | null;
}

export interface ArabicClaimsData {
  job_id: string;
  total_pages: number;
  pages: PageData[];
  analysis?: DocumentAnalysis | null;
  raw_concatenated_text?: string;
  claimant_name?: string | null;
  category?: string;
}

export interface ArabicClaimsJobSummary {
  job_id: string;
  pipeline: string;
  status: string;
  claim_type?: string | null;
  input_data?: {
    claim_type?: string;
    category?: string;
    [key: string]: unknown;
  } | null;
  result?: Record<string, unknown> | null;
  error?: string | null;
  created_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface SubmitResponse {
  job_id: string;
  status: string;
}

export interface ReanalyzeResponse {
  job_id: string;
  status: string;
}
