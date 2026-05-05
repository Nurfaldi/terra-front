import { useState } from "react";
import type {
    MedicalAnalysisResult,
    SynthesizedInsights,
    ConditionAnalysis,
} from "@/types/underwriting";
import { DataField, DataSection } from "./DataField";
import { StatusPill, type StatTone } from "./StatCard";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Clock,
    Sparkles,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalAnalysisTabProps {
    data: MedicalAnalysisResult | null;
}

interface VerdictResolution {
    verdict: string;
    loading: number;
    confidence?: string;
    justification?: string;
    fromRAG: boolean;
}

function resolveVerdict(data: MedicalAnalysisResult): VerdictResolution {
    const rag = data.synthesized_insights?.final_verdict;
    if (rag) {
        return {
            verdict: rag.decision || "Pending",
            loading: rag.loading_percentage || 0,
            confidence: rag.confidence,
            justification: rag.justification,
            fromRAG: true,
        };
    }

    const dec = data.underwriting_decision;
    let v = dec?.decision || "Pending";
    if (v === "Standard") v = "Approve";
    else if (v === "Sub-standard") v = "Approve with Loading";
    else if (v === "Decline" || v === "Declined") v = "Reject";

    return {
        verdict: v,
        loading: dec?.loading_percentage || 0,
        justification: dec?.justification,
        fromRAG: false,
    };
}

const verdictMeta = (
    v: string
): { tone: StatTone; Icon: typeof CheckCircle2 } => {
    if (v === "Approve" || v === "Standard") return { tone: "verified", Icon: CheckCircle2 };
    if (v === "Approve with Loading" || v === "Sub-standard")
        return { tone: "pending", Icon: AlertTriangle };
    if (v === "Postpone") return { tone: "primary", Icon: Clock };
    if (v === "Reject" || v === "Decline" || v === "Declined")
        return { tone: "alert", Icon: XCircle };
    return { tone: "default", Icon: Clock };
};

function VerdictBanner({ resolution }: { resolution: VerdictResolution }) {
    const { tone, Icon } = verdictMeta(resolution.verdict);
    const display =
        resolution.verdict === "Approve with Loading" && resolution.loading > 0
            ? `Approve with ${resolution.loading}% Loading`
            : resolution.verdict;

    return (
        <section
            className={cn(
                "rounded-md border bg-card p-5",
                tone === "verified" && "border-[hsl(var(--verified))]/40 bg-[hsl(var(--verified))]/5",
                tone === "pending" && "border-[hsl(var(--pending))]/45 bg-[hsl(var(--pending))]/5",
                tone === "alert" && "border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5",
                tone === "primary" && "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5",
                tone === "default" && "border-border"
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            "grid h-10 w-10 place-items-center rounded-md",
                            tone === "verified" && "bg-[hsl(var(--verified))]/15 text-[hsl(var(--verified))]",
                            tone === "pending" && "bg-[hsl(var(--pending))]/15 text-[hsl(38_92%_28%)]",
                            tone === "alert" && "bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]",
                            tone === "primary" && "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]",
                            tone === "default" && "bg-muted text-muted-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Final Verdict
                        </p>
                        <h2 className="text-[20px] font-semibold leading-tight text-foreground">
                            {display}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Confidence: {resolution.confidence || "Medium"} · Source:{" "}
                            {resolution.fromRAG
                                ? "RAG synthesis (UW guidelines)"
                                : "Preliminary document analysis"}
                        </p>
                    </div>
                </div>
                {resolution.fromRAG && (
                    <span className="status-pill" data-tone="verified">
                        <Sparkles className="h-3 w-3" /> RAG-grounded
                    </span>
                )}
            </div>
            {resolution.justification && (
                <p className="mt-4 border-t border-current/10 pt-4 text-[13px] leading-relaxed text-foreground/90">
                    {resolution.justification}
                </p>
            )}
        </section>
    );
}

function ConditionCard({ condition }: { condition: ConditionAnalysis }) {
    const [open, setOpen] = useState(false);
    const sev = (condition.severity || "").toLowerCase();
    const sevTone: "verified" | "pending" | "alert" | "muted" =
        sev === "low"
            ? "verified"
            : sev === "moderate"
            ? "pending"
            : sev === "high" || sev === "severe"
            ? "alert"
            : "muted";

    return (
        <div className="overflow-hidden rounded-md border border-border bg-card">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-accent/40"
            >
                <div className="flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-foreground">
                        {condition.condition}
                    </span>
                    <StatusPill tone={sevTone}>{condition.severity || "—"} severity</StatusPill>
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>
            {open && (
                <div className="space-y-3 border-t border-border bg-background/50 p-4 text-[12px]">
                    <DataField label="Prognosis" value={condition.prognosis} />
                    {condition.underwriting_considerations &&
                        condition.underwriting_considerations.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Underwriting Considerations
                                </p>
                                <ul className="mt-1 list-inside list-disc space-y-1 text-foreground">
                                    {condition.underwriting_considerations.map((c, i) => (
                                        <li key={i}>{c}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    <DataField label="Recommended Action" value={condition.recommended_action} />
                </div>
            )}
        </div>
    );
}

function RecommendationsBlock({
    insights,
}: {
    insights: SynthesizedInsights;
}) {
    const r = insights.recommendations;
    if (!r) return null;
    const groups: Array<{ label: string; items?: string[]; tone: StatTone }> = (
        [
            { label: "Additional Tests", items: r.additional_tests, tone: "primary" },
            { label: "Follow-up Actions", items: r.follow_up_actions, tone: "verified" },
            { label: "Exclusions to Consider", items: r.exclusions_to_consider, tone: "pending" },
            { label: "Waiting Periods", items: r.waiting_periods, tone: "default" },
        ] as const
    )
        .filter((g) => g.items && g.items.length > 0)
        .map((g) => ({ ...g }));

    if (groups.length === 0) return null;

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {groups.map((g) => (
                <div
                    key={g.label}
                    className={cn(
                        "rounded-md border bg-card p-3",
                        g.tone === "primary" && "border-[hsl(var(--primary))]/25",
                        g.tone === "verified" && "border-[hsl(var(--verified))]/30",
                        g.tone === "pending" && "border-[hsl(var(--pending))]/35",
                        g.tone === "default" && "border-border"
                    )}
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {g.label}
                    </p>
                    <ul className="mt-1.5 list-inside list-disc space-y-1 text-[12px] text-foreground">
                        {g.items!.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export function MedicalAnalysisTab({ data }: MedicalAnalysisTabProps) {
    if (!data) {
        return (
            <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                Awaiting medical document analysis.
            </div>
        );
    }

    const insights = data.synthesized_insights;
    const resolution = resolveVerdict(data);
    const ra = data.risk_assessment;

    return (
        <div className="space-y-4">
            <VerdictBanner resolution={resolution} />

            {insights && (
                <DataSection
                    title="Underwriting Guidelines Reference"
                    eyebrow="RAG synthesis"
                    actions={
                        resolution.fromRAG && (
                            <span className="status-pill" data-tone="verified">
                                Decision Source
                            </span>
                        )
                    }
                >
                    <div className="space-y-5">
                        {insights.condition_analysis && insights.condition_analysis.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-[13px] font-semibold text-foreground">
                                    Condition Analysis
                                </h4>
                                <div className="space-y-2">
                                    {insights.condition_analysis.map((c, i) => (
                                        <ConditionCard key={i} condition={c} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {insights.risk_interactions && (
                            <div className="space-y-1.5">
                                <h4 className="text-[13px] font-semibold text-foreground">
                                    Risk Interactions
                                </h4>
                                <div className="rounded-md bg-muted/40 p-3 text-[12px] text-foreground space-y-1">
                                    <p>{insights.risk_interactions.description || "—"}</p>
                                    <p className="text-muted-foreground">
                                        Combined level:{" "}
                                        <span className="font-medium text-foreground">
                                            {insights.risk_interactions.combined_risk_level || "—"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {insights.overall_assessment && (
                            <div className="space-y-1.5">
                                <h4 className="text-[13px] font-semibold text-foreground">
                                    Overall Assessment
                                </h4>
                                <p className="rounded-md bg-muted/40 p-3 text-[12px] text-foreground">
                                    {insights.overall_assessment.summary || "—"}
                                </p>
                                {insights.overall_assessment.key_risk_factors &&
                                    insights.overall_assessment.key_risk_factors.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Risk factors
                                            </span>
                                            {insights.overall_assessment.key_risk_factors.map((f, i) => (
                                                <StatusPill key={i} tone="alert">
                                                    {f}
                                                </StatusPill>
                                            ))}
                                        </div>
                                    )}
                                {insights.overall_assessment.mitigating_factors &&
                                    insights.overall_assessment.mitigating_factors.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Mitigating
                                            </span>
                                            {insights.overall_assessment.mitigating_factors.map((f, i) => (
                                                <StatusPill key={i} tone="verified">
                                                    {f}
                                                </StatusPill>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        )}

                        <RecommendationsBlock insights={insights} />
                    </div>
                </DataSection>
            )}

            <DataSection title="Risk Assessment" eyebrow="Aggregate scores">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-md bg-muted/40 px-4 py-3">
                        <p className="kpi-label">Medical Risk</p>
                        <p className="kpi-value mt-1">{ra.medical_risk_score}/100</p>
                    </div>
                    <div className="rounded-md bg-muted/40 px-4 py-3">
                        <p className="kpi-label">Occupational</p>
                        <p className="kpi-value mt-1">{ra.occupational_risk_score}</p>
                    </div>
                    <div className="rounded-md bg-muted/40 px-4 py-3">
                        <p className="kpi-label">Overall Level</p>
                        <p className="kpi-value mt-1">{ra.risk_level}</p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Identified risks
                        </span>
                        {ra.identified_risks.length > 0 ? (
                            ra.identified_risks.map((r, i) => (
                                <StatusPill key={i} tone="alert">
                                    {r}
                                </StatusPill>
                            ))
                        ) : (
                            <span className="text-[12px] text-muted-foreground">None identified</span>
                        )}
                    </div>
                    {ra.mitigating_factors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Mitigating
                            </span>
                            {ra.mitigating_factors.map((f, i) => (
                                <StatusPill key={i} tone="verified">
                                    {f}
                                </StatusPill>
                            ))}
                        </div>
                    )}
                </div>
            </DataSection>
        </div>
    );
}
