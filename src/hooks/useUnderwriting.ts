import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
    SPAJExtractionResult,
    MedicalAnalysisResult,
    BordereauxData
} from "@/types/underwriting";

// API response types matching backend
interface SubmitSPAJResponse {
    job_id: string;
    status: string;
    result?: SPAJExtractionResult;
    error?: string;
}

interface SubmitMedicalResponse {
    job_id: string;
    status: string;
    result?: MedicalAnalysisResult;
    error?: string;
}

interface BordereauxResponse {
    bordereaux_id: string;
    status: string;
    data?: BordereauxData;
    download_url?: string;
}

export function useUnderwriting() {
    const [spajFile, setSpajFile] = useState<File | null>(null);
    const [medicalFiles, setMedicalFiles] = useState<File[]>([]);

    // Results
    const [spajResult, setSpajResult] = useState<SPAJExtractionResult | null>(null);
    const [medicalResult, setMedicalResult] = useState<MedicalAnalysisResult | null>(null);
    const [bordereauxId, setBordereauxId] = useState<string | null>(null);

    // Job IDs for polling
    const [spajJobId, setSpajJobId] = useState<string | null>(null);
    const [medicalJobId, setMedicalJobId] = useState<string | null>(null);

    // Upload SPAJ mutation - returns job ID
    const uploadSPAJMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", "");

            const response = await apiRequest<SubmitSPAJResponse>(
                "/health-underwriting/upload-spaj",
                {
                    method: "POST",
                    body: formData,
                }
            );
            return response;
        },
        onSuccess: (data) => {
            setSpajJobId(data.job_id);
        },
    });

    // Poll for SPAJ result
    const spajJobQuery = useQuery({
        queryKey: ["spaj-job", spajJobId],
        queryFn: async () => {
            if (!spajJobId) return null;
            return apiRequest<SubmitSPAJResponse>(
                `/health-underwriting/jobs/${spajJobId}/spaj-result`
            );
        },
        enabled: !!spajJobId && uploadSPAJMutation.isSuccess,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return 2000;
            if (data.status === "completed" || data.status === "failed") {
                return false; // Stop polling
            }
            return 2000; // Poll every 2 seconds
        },
    });

    // Update SPAJ result when job completes
    useEffect(() => {
        if (spajJobQuery.data?.status === "completed" && spajJobQuery.data.result && !spajResult) {
            setSpajResult(spajJobQuery.data.result);
        }
    }, [spajJobQuery.data, spajResult]);

    // Upload Medical mutation
    const uploadMedicalMutation = useMutation({
        mutationFn: async ({ files, spajResult }: { files: File[]; spajResult: SPAJExtractionResult }) => {
            const formData = new FormData();
            files.forEach((f) => formData.append("files", f));
            formData.append("spaj_result", JSON.stringify(spajResult));
            formData.append("user_id", "");

            const response = await apiRequest<SubmitMedicalResponse>(
                "/health-underwriting/upload-medical",
                {
                    method: "POST",
                    body: formData,
                }
            );
            return response;
        },
        onSuccess: (data) => {
            setMedicalJobId(data.job_id);
        },
    });

    // Poll for Medical result
    const medicalJobQuery = useQuery({
        queryKey: ["medical-job", medicalJobId],
        queryFn: async () => {
            if (!medicalJobId) return null;
            return apiRequest<SubmitMedicalResponse>(
                `/health-underwriting/jobs/${medicalJobId}/medical-result`
            );
        },
        enabled: !!medicalJobId && uploadMedicalMutation.isSuccess,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return 2000;
            if (data.status === "completed" || data.status === "failed") {
                return false;
            }
            return 2000;
        },
    });

    // Update Medical result when job completes
    useEffect(() => {
        if (medicalJobQuery.data?.status === "completed" && medicalJobQuery.data.result && !medicalResult) {
            setMedicalResult(medicalJobQuery.data.result);
        }
    }, [medicalJobQuery.data, medicalResult]);

    // Generate Bordereaux mutation
    const generateBordereauxMutation = useMutation({
        mutationFn: async () => {
            if (!spajResult || !medicalResult) throw new Error("Missing data");

            return apiRequest<BordereauxResponse>(
                "/health-underwriting/generate-bordereaux",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        spaj_result: spajResult,
                        medical_result: medicalResult,
                        decision: medicalResult.underwriting_decision,
                    }),
                }
            );
        },
        onSuccess: (data) => {
            setBordereauxId(data.bordereaux_id);
        },
    });

    const reset = useCallback(() => {
        setSpajFile(null);
        setMedicalFiles([]);
        setSpajResult(null);
        setMedicalResult(null);
        setBordereauxId(null);
        setSpajJobId(null);
        setMedicalJobId(null);
    }, []);

    return {
        // State
        spajFile,
        setSpajFile,
        medicalFiles,
        setMedicalFiles,
        spajResult,
        medicalResult,
        bordereauxId,

        // Upload actions
        uploadSPAJ: uploadSPAJMutation.mutateAsync,
        isUploadingSPAJ: uploadSPAJMutation.isPending,
        spajUploadError: uploadSPAJMutation.error,

        // Medical actions
        uploadMedical: uploadMedicalMutation.mutateAsync,
        isUploadingMedical: uploadMedicalMutation.isPending,
        medicalUploadError: uploadMedicalMutation.error,

        // Polling status
        spajJobStatus: spajJobQuery.data?.status,
        medicalJobStatus: medicalJobQuery.data?.status,
        spajJobError: spajJobQuery.data?.error,
        medicalJobError: medicalJobQuery.data?.error,

        // Bordereaux
        generateBordereaux: generateBordereauxMutation.mutateAsync,
        isGeneratingBordereaux: generateBordereauxMutation.isPending,

        // Reset
        reset,
    };
}