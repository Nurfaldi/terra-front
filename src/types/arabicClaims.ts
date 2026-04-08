export const CASE_TYPES = [
  "IP", "OP", "PRE_INPATIENT", "POST_INPATIENT",
  "EMERGENCY", "DENTAL", "MATERNITY", "ACCIDENT", "OTHERS",
] as const;
export type CaseType = (typeof CASE_TYPES)[number];

export const CASE_TYPE_LABELS: Record<CaseType | "UNKNOWN", string> = {
  IP: "Inpatient (IP)",
  OP: "Outpatient (OP)",
  PRE_INPATIENT: "Pre-Inpatient",
  POST_INPATIENT: "Post-Inpatient",
  EMERGENCY: "Emergency",
  DENTAL: "Dental",
  MATERNITY: "Maternity",
  ACCIDENT: "Accident",
  OTHERS: "Others",
  UNKNOWN: "Unknown",
};

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
  is_invoice?: boolean;
  status?: string;
}

export interface InvoiceLineItem {
  row_number: number;
  description: string;
  benefit_category?: string | null;
  quantity?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  total_price?: number | null;
  currency?: string | null;
}

export interface InvoiceData {
  page_number: number;
  provider_name?: string | null;
  patient_name?: string | null;
  invoice_number?: string | null;
  total_charge?: number | null;
  currency?: string | null;
  singular_data: Record<string, unknown>;
  line_items: InvoiceLineItem[];
  summary?: string;
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
  invoices?: InvoiceData[];
  analysis?: DocumentAnalysis | null;
  raw_concatenated_text?: string;
  claimant_name?: string | null;
  category?: string;
  removed_page_numbers?: number[];
  suggested_analysis?: DocumentAnalysis | null;
  suggestion_job_id?: string | null;
  user_permission?: "owner" | "edit" | "view" | null;
  link_sharing?: "off" | "view" | "edit";
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
  // Sharing fields
  user_id?: string | null;
  shared_by?: string | null;
  permission?: "owner" | "edit" | "view" | null;
  link_sharing?: "off" | "view" | "edit";
}

export interface ShareResponse {
  id: string;
  job_id: string;
  owner_user_id: string;
  shared_with_user_id: string;
  permission: "view" | "edit";
}

export interface SubmitResponse {
  job_id: string;
  status: string;
}

export interface ReanalyzeResponse {
  job_id: string;
  status: string;
}

// ---------- Analytics Dashboard types ----------------------------------------

export interface IcdCodeStat {
  code: string;
  description: string;
  count: number;
  total_amount: number;
}

export interface ProviderStat {
  provider_name: string;
  claim_count: number;
  total_amount: number;
}

export interface TimeSeriesPoint {
  date: string;
  claim_count: number;
  total_amount: number;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
}

export interface ClaimTypeBreakdownItem {
  claim_type: string;
  count: number;
}

export interface CurrencyBreakdownItem {
  currency: string;
  count: number;
  total_amount: number;
}

export interface ClaimRow {
  job_id: string;
  created_at: string | null;
  category: string;
  claim_type: string;
  status: string;
  claimant_name: string | null;
  provider_names: string[];
  icd_codes: { code: string; description?: string }[];
  total_amount: number | null;
  currency: string | null;
}

export interface AnalyticsDashboard {
  total_claims: number;
  total_providers: number;
  total_invoice_amount: number;
  total_line_items: number;
  average_readability: number;
  reporting_currency: string;
  conversion_warnings: string[];
  currency_breakdown: CurrencyBreakdownItem[];
  top_icd_by_count: IcdCodeStat[];
  top_icd_by_amount: IcdCodeStat[];
  top_providers_by_count: ProviderStat[];
  top_providers_by_amount: ProviderStat[];
  claims_over_time: TimeSeriesPoint[];
  category_breakdown: CategoryBreakdownItem[];
  claim_type_breakdown: ClaimTypeBreakdownItem[];
  claims_table: ClaimRow[];
}
