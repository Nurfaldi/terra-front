import type { MedicalAnalysisResult } from "@/types/underwriting";
import { DataSection } from "./DataField";
import { StatusPill } from "./StatCard";
import { Beaker } from "lucide-react";

interface LabResultsTabProps {
    data: MedicalAnalysisResult | null;
}

const interpretationTone = (
    interp: string
): "verified" | "pending" | "alert" | "muted" => {
    switch (interp) {
        case "Normal":
            return "verified";
        case "Borderline":
            return "pending";
        case "High":
        case "Low":
        case "Critical":
            return "alert";
        default:
            return "muted";
    }
};

export function LabResultsTab({ data }: LabResultsTabProps) {
    if (!data) {
        return (
            <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                Upload medical documents to extract lab results.
            </div>
        );
    }

    if (!data.lab_results || data.lab_results.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-border p-12 text-center">
                <Beaker className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                    No lab results extracted from medical documents.
                </p>
            </div>
        );
    }

    const totalCount = data.lab_results.length;
    const abnormalCount = data.lab_results.filter(
        (r) => r.interpretation !== "Normal"
    ).length;

    return (
        <DataSection
            title="Laboratory Results"
            eyebrow={`${totalCount} test${totalCount === 1 ? "" : "s"} · ${abnormalCount} abnormal`}
        >
            <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-left text-[12px]">
                    <thead className="bg-muted/40 text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2 font-semibold uppercase tracking-[0.06em]">Test</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-[0.06em]">Result</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-[0.06em]">Unit</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-[0.06em]">Reference</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-[0.06em]">Interpretation</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-[0.06em]">Significance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.lab_results.map((row, i) => (
                            <tr key={i} className="hover:bg-accent/30">
                                <td className="px-3 py-2 font-medium text-foreground">
                                    <div>{row.test_name}</div>
                                    {row.test_category && (
                                        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                            {row.test_category}
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-2 font-mono tabular-nums">{row.result}</td>
                                <td className="px-3 py-2 text-muted-foreground">{row.unit || "—"}</td>
                                <td className="px-3 py-2 text-muted-foreground tabular-nums">
                                    {row.reference_range || "—"}
                                </td>
                                <td className="px-3 py-2">
                                    <StatusPill tone={interpretationTone(row.interpretation)}>
                                        {row.interpretation}
                                    </StatusPill>
                                </td>
                                <td
                                    className="max-w-[260px] truncate px-3 py-2 text-muted-foreground"
                                    title={row.clinical_significance}
                                >
                                    {row.clinical_significance || "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DataSection>
    );
}
