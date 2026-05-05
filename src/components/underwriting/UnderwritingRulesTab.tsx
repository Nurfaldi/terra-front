import type { MedicalAnalysisResult, SPAJExtractionResult } from "@/types/underwriting";
import { DataField, DataSection } from "./DataField";
import { StatusPill } from "./StatCard";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnderwritingRulesTabProps {
    spajData: SPAJExtractionResult | null;
    medicalData: MedicalAnalysisResult | null;
}

type RuleStatus = "pass" | "warning" | "fail";

interface Rule {
    label: string;
    value: string;
    status: RuleStatus;
    detail?: string;
}

const idr = (n: number) =>
    n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function UnderwritingRulesTab({ spajData, medicalData }: UnderwritingRulesTabProps) {
    if (!spajData) return null;

    const decision = medicalData?.underwriting_decision?.decision || "Pending";
    const loading = medicalData?.underwriting_decision?.loading_percentage;

    const age = spajData.personal_data?.usia ?? 0;
    const bmi = spajData.health_data?.bmi ?? 0;
    const occRisk = spajData.personal_data?.tingkat_risiko_pekerjaan ?? 0;
    const hasDisease =
        spajData.health_data?.mengalami_penyakit ??
        Boolean(spajData.health_data?.riwayat_penyakit?.length);
    const credit = spajData.insurance_data?.jumlah_kredit ?? 0;
    const annualIncome = spajData.inference?.penghasilan_numerik ?? 0;
    const incomeFactor = annualIncome > 0 ? credit / annualIncome : 0;

    const rules: Rule[] = [
        {
            label: "Age Eligibility",
            value: `${age} years`,
            status: age > 0 && age < 65 ? "pass" : "fail",
            detail: "Standard cap is age < 65",
        },
        {
            label: "BMI Range",
            value: bmi ? bmi.toFixed(1) : "—",
            status: bmi >= 18.5 && bmi <= 25 ? "pass" : bmi > 0 ? "warning" : "fail",
            detail: "Healthy: 18.5 – 25.0",
        },
        {
            label: "Occupation Risk",
            value: occRisk ? `Class ${occRisk}` : "—",
            status: occRisk <= 2 ? "pass" : occRisk <= 3 ? "warning" : "fail",
            detail: "Low risk: ≤ Class 2",
        },
        {
            label: "Medical History",
            value: hasDisease ? "Reported" : "Clean",
            status: !hasDisease ? "pass" : "warning",
            detail: hasDisease ? "Manual review required" : "No disease history",
        },
    ];

    const verdictTone =
        decision === "Standard" || decision === "Approve"
            ? "verified"
            : decision === "Sub-standard" || decision === "Approve with Loading"
            ? "pending"
            : decision === "Decline" || decision === "Declined" || decision === "Reject"
            ? "alert"
            : "muted";

    const VerdictIcon =
        verdictTone === "verified"
            ? CheckCircle2
            : verdictTone === "alert"
            ? XCircle
            : verdictTone === "pending"
            ? AlertTriangle
            : AlertTriangle;

    return (
        <div className="space-y-4">
            <section
                className={cn(
                    "flex items-center justify-between gap-4 rounded-md border bg-card px-5 py-4",
                    verdictTone === "verified" && "border-[hsl(var(--verified))]/40 bg-[hsl(var(--verified))]/5",
                    verdictTone === "pending" && "border-[hsl(var(--pending))]/45 bg-[hsl(var(--pending))]/5",
                    verdictTone === "alert" && "border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5"
                )}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "grid h-10 w-10 place-items-center rounded-md",
                            verdictTone === "verified" && "bg-[hsl(var(--verified))]/15 text-[hsl(var(--verified))]",
                            verdictTone === "pending" && "bg-[hsl(var(--pending))]/15 text-[hsl(38_92%_28%)]",
                            verdictTone === "alert" && "bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]",
                            verdictTone === "muted" && "bg-muted text-muted-foreground"
                        )}
                    >
                        <VerdictIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Underwriting Decision
                        </p>
                        <h3 className="text-[16px] font-semibold text-foreground">
                            {decision}
                            {typeof loading === "number" && loading > 0 ? (
                                <span className="ml-2 text-muted-foreground font-normal">
                                    +{loading}% loading
                                </span>
                            ) : null}
                        </h3>
                    </div>
                </div>
                <p className="hidden max-w-md text-[12px] text-muted-foreground md:block">
                    {medicalData?.underwriting_decision?.justification ||
                        "Awaiting medical analysis to finalize verdict."}
                </p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
                <DataSection title="Automated Rule Checks" eyebrow="SPAJ-derived">
                    <ul className="divide-y divide-border">
                        {rules.map((rule) => (
                            <li
                                key={rule.label}
                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-foreground">
                                        {rule.label}
                                    </p>
                                    {rule.detail && (
                                        <p className="text-[11px] text-muted-foreground">
                                            {rule.detail}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                                        {rule.value}
                                    </span>
                                    {rule.status === "pass" && (
                                        <StatusPill tone="verified">Pass</StatusPill>
                                    )}
                                    {rule.status === "warning" && (
                                        <StatusPill tone="pending">Review</StatusPill>
                                    )}
                                    {rule.status === "fail" && (
                                        <StatusPill tone="alert">Fail</StatusPill>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </DataSection>

                <DataSection title="Financial Underwriting" eyebrow="Sum-assured ratios">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <DataField label="Total Sum Assured" value={idr(credit)} mono />
                        <DataField
                            label="Annual Income"
                            value={annualIncome > 0 ? idr(annualIncome) : spajData.personal_data?.penghasilan_per_tahun}
                            mono
                        />
                        <DataField
                            label="Income Factor"
                            value={incomeFactor > 0 ? `${incomeFactor.toFixed(1)}×` : "N/A"}
                            mono
                        />
                        <DataField
                            label="Risk Level"
                            value={medicalData?.risk_assessment?.risk_level || "Pending"}
                        />
                    </div>
                    <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
                        {incomeFactor > 5
                            ? `Sum assured is ${incomeFactor.toFixed(1)}× annual income — escalate to financial UW.`
                            : incomeFactor > 0
                            ? `Sum assured is ${incomeFactor.toFixed(1)}× annual income — within acceptable range.`
                            : "Income data unavailable; financial assessment cannot be auto-evaluated."}
                    </p>
                </DataSection>
            </div>
        </div>
    );
}
