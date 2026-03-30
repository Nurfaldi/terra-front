// Personal data nested structures
export interface AlamatRumah {
    alamat?: string;
    kode_pos?: string;
    telepon?: string;
}

export interface PekerjaanDetail {
    jabatan?: string;
    bagian?: string;
    aktivitas?: string;
    perusahaan?: string;
    jenis_usaha?: string;
    alamat?: string;
    kode_pos?: string;
    telepon?: string;
    tingkat_risiko_pekerjaan?: number;
}

export interface Penghasilan {
    penghasilan_per_tahun?: string;
    penghasilan_numerik?: number;
    sumber?: string;
}

export interface DataPeserta {
    nama_lengkap?: string;
    jenis_kelamin?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    bukti_identitas?: string;
    nomor_bukti_identitas?: string;
    status_perkawinan?: string;
    warga_negara?: string;
    alamat_rumah?: AlamatRumah;
    pekerjaan?: PekerjaanDetail;
    no_handphone?: string;
    alamat_email?: string;
    sumber_dana?: string;
    tujuan_asuransi?: string;
    penghasilan?: Penghasilan;
}

export interface MasaAsuransi {
    tahun?: number;
    bulan?: number;
}

export interface PeriodeAsuransi {
    mulai?: string;
    berakhir?: string;
}

export interface PremiTagihan {
    bank?: string;
    cabang?: string;
}

export interface PenerimaBenefit {
    bank?: string;
    cabang?: string;
}

export interface DataAsuransi {
    jenis_kredit?: string;
    jumlah_kredit?: number;
    bunga?: string;
    masa_asuransi?: MasaAsuransi;
    periode_asuransi?: PeriodeAsuransi;
    cara_pembayaran?: string;
    premi_ditagih_ke?: PremiTagihan;
    penerima_manfaat_asuransi?: PenerimaBenefit;
}

export interface PerubahanBeratBadan {
    berubah_dalam_12_bulan_terakhir?: boolean;
    penjelasan?: string;
}

export interface RiwayatPemeriksaan {
    pernah_melakukan_pemeriksaan?: boolean;
    penjelasan?: string;
}

export interface InfoKehamilan {
    sedang_hamil?: boolean;
    usia_kehamilan_minggu?: number;
}

export interface DataKesehatan {
    berat_badan_kg?: number;
    tinggi_badan_cm?: number;
    perubahan_berat_badan?: PerubahanBeratBadan;
    keadaan_sehat?: boolean;
    mengalami_penyakit?: boolean;
    detail_penyakit?: string[];
    riwayat_pemeriksaan_medis?: RiwayatPemeriksaan;
    kehamilan?: InfoKehamilan;
}

export interface PernyataanPersetujuan {
    lokasi_ditandatangani?: string;
    tanggal_ditandatangani?: string;
    tanda_tangan_petugas_bank?: boolean;
    tanda_tangan_calon_peserta?: boolean;
    tanda_tangan_pasangan_calon_peserta?: boolean;
}

export interface InferenceBlock {
    penghasilan_numerik?: number;
    tingkat_risiko_pekerjaan?: number;
}

// Core data schemas
export interface PersonalData {
    nama_lengkap?: string;
    jenis_kelamin?: string;
    tanggal_lahir?: string;
    tempat_lahir?: string;
    usia?: number;
    status_perkawinan?: string;
    warga_negara?: string;
    nomor_identitas?: string;
    pekerjaan?: string;
    nama_perusahaan?: string;
    jenis_usaha?: string;
    tingkat_risiko_pekerjaan?: number;
    penghasilan_per_tahun?: string;
    penghasilan_numerik?: number;
    sumber_dana?: string;
}

export interface HealthData {
    berat_badan_kg?: number;
    tinggi_badan_cm?: number;
    bmi?: number;
    bmi_category?: string;
    keadaan_sehat?: boolean;
    mengalami_penyakit?: boolean;
    detail_kondisi_saat_ini?: string;
    riwayat_penyakit?: string[];
    riwayat_rawat_inap?: boolean;
    detail_rawat_inap?: string;
    sedang_hamil?: boolean;
    usia_kehamilan_minggu?: number;
    merokok?: boolean;
    konsumsi_alkohol?: boolean;
}

export interface InsuranceData {
    jenis_kredit?: string;
    jumlah_kredit?: number;
    masa_asuransi_tahun?: number;
    masa_asuransi_bulan?: number;
    tanggal_mulai?: string;
    tanggal_berakhir?: string;
    nama_bank?: string;
    cabang_bank?: string;
}

export interface LabResult {
    test_name: string;
    test_category?: string;
    result: string;
    unit?: string;
    reference_range?: string;
    interpretation: "Normal" | "High" | "Low" | "Borderline" | "Critical";
    clinical_significance?: string;
}

export interface RiskAssessment {
    identified_risks: string[];
    mitigating_factors: string[];
    aggravating_factors: string[];
    medical_risk_score: number;
    occupational_risk_score: number;
    overall_risk_score: number;
    risk_level: string;
}

export interface UnderwritingDecision {
    decision: string;
    loading_percentage: number;
    exclusions: string[];
    waiting_periods: string[];
    required_follow_ups: string[];
    justification: string;
}

// RAG synthesis schemas
export interface ConditionAnalysis {
    condition: string;
    severity: string;
    prognosis: string;
    underwriting_considerations: string[];
    recommended_action: string;
}

export interface RiskInteractions {
    description: string;
    combined_risk_level: string;
}

export interface OverallAssessment {
    summary: string;
    key_risk_factors: string[];
    mitigating_factors: string[];
}

export interface Recommendations {
    additional_tests: string[];
    follow_up_actions: string[];
    exclusions_to_consider: string[];
    waiting_periods: string[];
}

export interface FinalVerdict {
    decision: string;
    loading_percentage: number;
    confidence: "Low" | "Medium" | "High";
    justification: string;
}

export interface SynthesizedInsights {
    condition_analysis: ConditionAnalysis[];
    risk_interactions?: RiskInteractions;
    overall_assessment?: OverallAssessment;
    recommendations?: Recommendations;
    final_verdict?: FinalVerdict;
}

export interface MedicalInsight {
    condition: string;
    risk_level: string;
    medical_context: string;
    underwriting_implication: string;
}

// Result schemas
export interface SPAJExtractionResult {
    summary: string;
    personal_data: PersonalData;
    insurance_data: InsuranceData;
    health_data: HealthData;
    data_peserta?: DataPeserta;
    data_asuransi?: DataAsuransi;
    data_kesehatan?: DataKesehatan;
    pernyataan_persetujuan?: PernyataanPersetujuan;
    inference?: InferenceBlock;
    extraction_confidence?: number;
    data_quality_notes: string[];
}

export interface MedicalAnalysisResult {
    summary: string;
    lab_results: LabResult[];
    risk_assessment: RiskAssessment;
    underwriting_decision: UnderwritingDecision;
    medical_insights: MedicalInsight[];
    synthesized_insights?: SynthesizedInsights;
    extraction_confidence?: number;
    data_quality_notes: string[];
}

export interface HealthUnderwritingResult {
    summary: string;
    personal_data: PersonalData;
    health_data: HealthData;
    insurance_data: InsuranceData;
    lab_results: LabResult[];
    risk_assessment: RiskAssessment;
    underwriting_decision: UnderwritingDecision;
    data_peserta?: DataPeserta;
    data_asuransi?: DataAsuransi;
    data_kesehatan?: DataKesehatan;
    pernyataan_persetujuan?: PernyataanPersetujuan;
    inference?: InferenceBlock;
    synthesized_insights?: SynthesizedInsights;
    extraction_confidence?: number;
    data_quality_notes: string[];
}

// Legacy aliases for backward compatibility
export type SPAJData = SPAJExtractionResult;
export type RAGInsightsResult = SynthesizedInsights;

// API response types
export interface BordereauxData {
    generated_at: string;
    data: Record<string, any>;
    download_urls?: Record<string, string>;
}

export interface BordereauxRequest {
    spaj_result: SPAJExtractionResult;
    medical_result?: MedicalAnalysisResult;
    decision?: Record<string, any>;
}

export interface ExtractionResponse {
    job_id: string;
    status: string;
    result?: SPAJExtractionResult;
    error?: string;
}

export interface MedicalAnalysisResponse {
    job_id: string;
    status: string;
    result?: MedicalAnalysisResult;
    error?: string;
}

export interface FullAnalysisResponse {
    job_id: string;
    status: string;
    result?: HealthUnderwritingResult;
    error?: string;
}

export interface JobStatus<T = any> {
    job_id: string;
    status: "queued" | "running" | "completed" | "failed";
    progress: number;
    created_at: string;
    updated_at: string;
    result: T | null;
    error: string | null;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    expires_in: number;
}
