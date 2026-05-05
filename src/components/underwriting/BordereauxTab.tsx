import { useState } from "react";
import type { BordereauxData } from "@/types/underwriting";
import { Button } from "@/components/ui/button";
import { DataField, DataSection } from "./DataField";
import { StatusPill } from "./StatCard";
import {
    AlertCircle,
    Download,
    FileSpreadsheet,
    Loader2,
    Sparkles,
} from "lucide-react";

interface BordereauxTabProps {
    canGenerate: boolean;
    bordereauxId: string | null;
    bordereauxData: BordereauxData | null;
    isGenerating: boolean;
    onGenerate: () => Promise<unknown>;
    onDownload: () => Promise<void>;
}

const idr = (n: unknown) =>
    typeof n === "number"
        ? n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
        : undefined;

export function BordereauxTab({
    canGenerate,
    bordereauxId,
    bordereauxData,
    isGenerating,
    onGenerate,
    onDownload,
}: BordereauxTabProps) {
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    const summary = bordereauxData?.data || (bordereauxData as Record<string, unknown> | null) || null;
    const premium = (summary as Record<string, unknown> | null)?.premium as
        | {
              base_rate_pct?: number;
              loading_pct?: number;
              base_premium?: number;
              loading_amount?: number;
              total_premium?: number;
              term_years?: number;
              mode?: string;
          }
        | undefined;
    const applicant = (summary as Record<string, unknown> | null)?.applicant as
        | { nama_lengkap?: string; usia?: number; jenis_kelamin?: string }
        | undefined;
    const insurance = (summary as Record<string, unknown> | null)?.insurance as
        | { jenis_kredit?: string; jumlah_kredit?: number; masa_asuransi_tahun?: number }
        | undefined;
    const decision = (summary as Record<string, unknown> | null)?.decision as
        | { decision?: string; loading_percentage?: number; justification?: string }
        | undefined;

    const handleGenerate = async () => {
        setError(null);
        try {
            await onGenerate();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Bordereaux generation failed");
        }
    };

    const handleDownload = async () => {
        setError(null);
        setDownloading(true);
        try {
            await onDownload();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Download failed");
        } finally {
            setDownloading(false);
        }
    };

    if (!bordereauxId) {
        return (
            <DataSection
                title="Bordereaux Generation"
                eyebrow="Step 3"
                actions={
                    canGenerate ? (
                        <StatusPill tone="verified">Ready</StatusPill>
                    ) : (
                        <StatusPill tone="muted">Awaiting medical analysis</StatusPill>
                    )
                }
            >
                <div className="flex flex-col items-center gap-4 rounded-md border-2 border-dashed border-border bg-background/50 px-6 py-10 text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                        <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[14px] font-semibold text-foreground">
                            Generate the bordereaux workbook
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                            Premium calculation, computation trace, and a single-row bordereaux —
                            ready for the carrier.
                        </p>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating}
                        size="default"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                Generating workbook…
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-1.5 h-4 w-4" />
                                Generate bordereaux
                            </>
                        )}
                    </Button>
                    {error && (
                        <div className="flex items-start gap-2 rounded-md border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 px-3 py-2 text-[12px] text-[hsl(var(--destructive))]">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </DataSection>
        );
    }

    return (
        <div className="space-y-4">
            <section className="flex items-center justify-between gap-4 rounded-md border border-[hsl(var(--verified))]/40 bg-[hsl(var(--verified))]/5 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-[hsl(var(--verified))]/15 text-[hsl(var(--verified))]">
                        <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Bordereaux ready
                        </p>
                        <p className="font-mono text-[12px] text-foreground">{bordereauxId}</p>
                    </div>
                </div>
                <Button onClick={handleDownload} disabled={downloading}>
                    {downloading ? (
                        <>
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            Downloading…
                        </>
                    ) : (
                        <>
                            <Download className="mr-1.5 h-4 w-4" />
                            Download Excel
                        </>
                    )}
                </Button>
            </section>

            {error && (
                <div className="flex items-start gap-2 rounded-md border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 px-3 py-2 text-[12px] text-[hsl(var(--destructive))]">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                <DataSection title="Applicant" eyebrow="From SPAJ" className="lg:col-span-1">
                    <div className="grid gap-4">
                        <DataField label="Name" value={applicant?.nama_lengkap} />
                        <DataField label="Age" value={applicant?.usia} mono />
                        <DataField label="Gender" value={applicant?.jenis_kelamin} />
                    </div>
                </DataSection>
                <DataSection title="Insurance" eyebrow="Policy" className="lg:col-span-1">
                    <div className="grid gap-4">
                        <DataField label="Credit Type" value={insurance?.jenis_kredit} />
                        <DataField
                            label="Amount"
                            value={idr(insurance?.jumlah_kredit)}
                            mono
                        />
                        <DataField
                            label="Term"
                            value={
                                insurance?.masa_asuransi_tahun
                                    ? `${insurance.masa_asuransi_tahun} year(s)`
                                    : undefined
                            }
                            mono
                        />
                    </div>
                </DataSection>
                <DataSection title="Decision" eyebrow="UW outcome" className="lg:col-span-1">
                    <div className="grid gap-4">
                        <DataField label="Verdict" value={decision?.decision} />
                        <DataField
                            label="Loading"
                            value={
                                typeof decision?.loading_percentage === "number"
                                    ? `${decision.loading_percentage}%`
                                    : undefined
                            }
                            mono
                        />
                        <DataField
                            label="Justification"
                            value={decision?.justification}
                        />
                    </div>
                </DataSection>
            </div>

            {premium && (
                <DataSection title="Premium Computation" eyebrow="Trace">
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                        <DataField
                            label="Base Rate"
                            value={
                                typeof premium.base_rate_pct === "number"
                                    ? `${premium.base_rate_pct.toFixed(3)}%`
                                    : undefined
                            }
                            mono
                        />
                        <DataField
                            label="Loading"
                            value={
                                typeof premium.loading_pct === "number"
                                    ? `${premium.loading_pct.toFixed(2)}%`
                                    : undefined
                            }
                            mono
                        />
                        <DataField label="Base Premium" value={idr(premium.base_premium)} mono />
                        <DataField label="Loading Amount" value={idr(premium.loading_amount)} mono />
                        <DataField label="Total Premium" value={idr(premium.total_premium)} mono />
                    </div>
                    <p className="mt-3 rounded-md bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                        formula: credit × rate%{premium.mode === "annual" ? " × term" : ""} ; total = base × (1 + loading%/100)
                    </p>
                </DataSection>
            )}
        </div>
    );
}
