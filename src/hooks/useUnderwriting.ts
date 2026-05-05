import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
    BordereauxData,
    MedicalAnalysisResult,
    SPAJExtractionResult,
} from "@/types/underwriting";

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

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "/api";

export function useUnderwriting() {
    const [spajFile, setSpajFile] = useState<File | null>(null);
    const [medicalFiles, setMedicalFiles] = useState<File[]>([]);

    const [spajResult, setSpajResult] = useState<SPAJExtractionResult | null>(null);
    const [medicalResult, setMedicalResult] = useState<MedicalAnalysisResult | null>(null);

    const [bordereauxId, setBordereauxId] = useState<string | null>(null);
    const [bordereauxData, setBordereauxData] = useState<BordereauxData | null>(null);
    const [bordereauxDownloadUrl, setBordereauxDownloadUrl] = useState<string | null>(null);

    const [spajJobId, setSpajJobId] = useState<string | null>(null);
    const [medicalJobId, setMedicalJobId] = useState<string | null>(null);

    const uploadSPAJMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("user_id", "");

            const response = await apiRequest<SubmitSPAJResponse>(
                "/health-underwriting/upload-spaj",
                { method: "POST", body: formData }
            );
            return response;
        },
        onSuccess: (data) => setSpajJobId(data.job_id),
    });

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
            if (data.status === "completed" || data.status === "failed") return false;
            return 2000;
        },
    });

    useEffect(() => {
        if (
            spajJobQuery.data?.status === "completed" &&
            spajJobQuery.data.result &&
            !spajResult
        ) {
            setSpajResult(spajJobQuery.data.result);
        }
    }, [spajJobQuery.data, spajResult]);

    const uploadMedicalMutation = useMutation({
        mutationFn: async ({
            files,
            spajResult,
        }: {
            files: File[];
            spajResult: SPAJExtractionResult;
        }) => {
            const formData = new FormData();
            files.forEach((f) => formData.append("files", f));
            formData.append("spaj_result", JSON.stringify(spajResult));
            formData.append("user_id", "");

            const response = await apiRequest<SubmitMedicalResponse>(
                "/health-underwriting/upload-medical",
                { method: "POST", body: formData }
            );
            return response;
        },
        onSuccess: (data) => setMedicalJobId(data.job_id),
    });

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
            if (data.status === "completed" || data.status === "failed") return false;
            return 2000;
        },
    });

    useEffect(() => {
        if (
            medicalJobQuery.data?.status === "completed" &&
            medicalJobQuery.data.result &&
            !medicalResult
        ) {
            setMedicalResult(medicalJobQuery.data.result);
        }
    }, [medicalJobQuery.data, medicalResult]);

    const generateBordereauxMutation = useMutation({
        mutationFn: async () => {
            if (!spajResult || !medicalResult) throw new Error("Missing SPAJ or medical data");

            return apiRequest<BordereauxResponse>(
                "/health-underwriting/generate-bordereaux",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
            setBordereauxData(data.data ?? null);
            setBordereauxDownloadUrl(data.download_url ?? null);
        },
    });

    const downloadBordereaux = useCallback(async () => {
        if (!bordereauxId) throw new Error("No bordereaux generated yet");
        const url = `${API_BASE}/health-underwriting/bordereaux/${bordereauxId}/download`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `bordereaux-${bordereauxId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
    }, [bordereauxId]);

    const reset = useCallback(() => {
        setSpajFile(null);
        setMedicalFiles([]);
        setSpajResult(null);
        setMedicalResult(null);
        setBordereauxId(null);
        setBordereauxData(null);
        setBordereauxDownloadUrl(null);
        setSpajJobId(null);
        setMedicalJobId(null);
    }, []);

    const resetMedical = useCallback(() => {
        setMedicalFiles([]);
        setMedicalResult(null);
        setMedicalJobId(null);
        setBordereauxId(null);
        setBordereauxData(null);
        setBordereauxDownloadUrl(null);
    }, []);

    return {
        spajFile,
        setSpajFile,
        medicalFiles,
        setMedicalFiles,
        spajResult,
        medicalResult,

        bordereauxId,
        bordereauxData,
        bordereauxDownloadUrl,

        uploadSPAJ: uploadSPAJMutation.mutateAsync,
        isUploadingSPAJ: uploadSPAJMutation.isPending,
        spajUploadError: uploadSPAJMutation.error,

        uploadMedical: uploadMedicalMutation.mutateAsync,
        isUploadingMedical: uploadMedicalMutation.isPending,
        medicalUploadError: uploadMedicalMutation.error,

        spajJobStatus: spajJobQuery.data?.status,
        medicalJobStatus: medicalJobQuery.data?.status,
        spajJobError: spajJobQuery.data?.error,
        medicalJobError: medicalJobQuery.data?.error,

        generateBordereaux: generateBordereauxMutation.mutateAsync,
        isGeneratingBordereaux: generateBordereauxMutation.isPending,
        bordereauxError: generateBordereauxMutation.error,
        downloadBordereaux,

        reset,
        resetMedical,
    };
}
