import type { MedicalAnalysisResult, SynthesizedInsights } from "@/types/underwriting";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MedicalAnalysisTabProps {
    data: MedicalAnalysisResult | null;
}

// Verdict Banner Component - matches streamlit source styling
function VerdictBanner({
    verdict,
    loading,
    confidence,
    justification,
    hasRAGVerdict
}: {
    verdict: string;
    loading?: number;
    confidence?: string;
    justification?: string;
    hasRAGVerdict: boolean;
}) {
    const verdictConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        "Approve": {
            bg: "bg-emerald-50 border-emerald-200",
            text: "text-emerald-700",
            icon: <CheckCircle className="h-6 w-6" />
        },
        "Approve with Loading": {
            bg: "bg-amber-50 border-amber-200",
            text: "text-amber-700",
            icon: <AlertTriangle className="h-6 w-6" />
        },
        "Postpone": {
            bg: "bg-blue-50 border-blue-200",
            text: "text-blue-700",
            icon: <Clock className="h-6 w-6" />
        },
        "Reject": {
            bg: "bg-red-50 border-red-200",
            text: "text-red-700",
            icon: <XCircle className="h-6 w-6" />
        },
        "Pending": {
            bg: "bg-slate-50 border-slate-200",
            text: "text-slate-600",
            icon: <Clock className="h-6 w-6" />
        }
    };

    const config = verdictConfig[verdict] || verdictConfig["Pending"];
    const displayText = verdict === "Approve with Loading" && loading
        ? `Approve with ${loading}% Loading`
        : verdict;

    const sourceText = hasRAGVerdict
        ? "Medical Underwriting Guidelines Reference"
        : "Preliminary Document Analysis";

    return (
        <div className={cn("rounded-lg border p-6 mb-6", config.bg)}>
            <div className="flex flex-col items-center text-center">
                <div className={cn("flex items-center gap-2 mb-2", config.text)}>
                    {config.icon}
                    <h2 className="text-2xl font-bold">Final Verdict: {displayText}</h2>
                </div>
                <p className={cn("text-sm", config.text)}>
                    Confidence: {confidence || "Medium"} | Source: {sourceText}
                </p>
            </div>
            {justification && (
                <div className="mt-4 pt-4 border-t border-current/10">
                    <p className={cn("text-sm", config.text)}>{justification}</p>
                </div>
            )}
        </div>
    );
}

// Condition Analysis Card
function ConditionAnalysisCard({ condition }: { condition: {
    condition: string;
    severity: string;
    prognosis: string;
    underwriting_considerations: string[];
    recommended_action: string;
}}) {
    const [expanded, setExpanded] = useState(false);

    const severityColors: Record<string, string> = {
        "Low": "text-green-600 bg-green-50 border-green-200",
        "Moderate": "text-amber-600 bg-amber-50 border-amber-200",
        "High": "text-red-600 bg-red-50 border-red-200"
    };

    return (
        <Card className="overflow-hidden">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="font-medium">{condition.condition}</span>
                    <Badge className={cn("text-xs", severityColors[condition.severity] || "text-slate-600 bg-slate-50")}>
                        {condition.severity} Severity
                    </Badge>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </div>
            {expanded && (
                <CardContent className="pt-4 border-t space-y-3">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Prognosis:</span>
                        <p className="text-sm mt-1">{condition.prognosis || "N/A"}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Underwriting Considerations:</span>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            {condition.underwriting_considerations?.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Recommended Action:</span>
                        <p className="text-sm mt-1">{condition.recommended_action || "N/A"}</p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

export function MedicalAnalysisTab({ data }: MedicalAnalysisTabProps) {
    if (!data) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No medical analysis data available.
            </div>
        );
    }

    // Determine verdict - RAG synthesis is the Single Source of Truth
    const synthesizedInsights: SynthesizedInsights | undefined = data.synthesized_insights;
    const decision = data.underwriting_decision;

    let verdict = "Pending";
    let verdictLoading = 0;
    let verdictJustification = "";
    let verdictConfidence = "Medium";
    let hasRAGVerdict = false;

    // RAG Synthesis is the Single Source of Truth
    if (synthesizedInsights?.final_verdict) {
        const finalVerdict = synthesizedInsights.final_verdict;
        verdict = finalVerdict.decision || "Pending";
        verdictLoading = finalVerdict.loading_percentage || 0;
        verdictJustification = finalVerdict.justification || "";
        verdictConfidence = finalVerdict.confidence || "Medium";
        hasRAGVerdict = true;
    } else if (decision) {
        // Fallback to preliminary decision if RAG not available
        const decisionText = decision.decision || "Pending";

        // Map decision text to verdict
        if (decisionText === "Standard") {
            verdict = "Approve";
        } else if (decisionText === "Sub-standard") {
            verdict = "Approve with Loading";
            verdictLoading = decision.loading_percentage || 0;
        } else if (decisionText === "Postpone") {
            verdict = "Postpone";
        } else if (decisionText === "Decline" || decisionText === "Declined") {
            verdict = "Reject";
        } else {
            verdict = decisionText;
        }

        verdictJustification = decision.justification || "";
    }

    return (
        <div className="space-y-6">
            {/* Final Verdict Banner */}
            <VerdictBanner
                verdict={verdict}
                loading={verdictLoading}
                confidence={verdictConfidence}
                justification={verdictJustification}
                hasRAGVerdict={hasRAGVerdict}
            />

            {/* Synthesized Medical Insights (RAG + LLM) - The SOT */}
            {synthesizedInsights && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Medical Underwriting Guidelines Reference
                            {hasRAGVerdict && <Badge variant="outline" className="text-xs">Decision Source</Badge>}
                        </CardTitle>
                        <CardDescription>
                            AI-generated analysis based on medical underwriting guidelines
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Condition Analysis */}
                        {synthesizedInsights.condition_analysis && synthesizedInsights.condition_analysis.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold">Condition Analysis</h4>
                                <div className="space-y-2">
                                    {synthesizedInsights.condition_analysis.map((cond, i) => (
                                        <ConditionAnalysisCard key={i} condition={cond} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risk Interactions */}
                        {synthesizedInsights.risk_interactions && (
                            <div className="space-y-2">
                                <h4 className="font-semibold">Risk Interactions</h4>
                                <div className="p-3 bg-muted rounded-lg space-y-1">
                                    <p className="text-sm"><strong>Description:</strong> {synthesizedInsights.risk_interactions.description || "N/A"}</p>
                                    <p className="text-sm"><strong>Combined Risk Level:</strong> {synthesizedInsights.risk_interactions.combined_risk_level || "N/A"}</p>
                                </div>
                            </div>
                        )}

                        {/* Overall Assessment */}
                        {synthesizedInsights.overall_assessment && (
                            <div className="space-y-2">
                                <h4 className="font-semibold">Overall Assessment</h4>
                                <div className="p-3 bg-muted rounded-lg space-y-2">
                                    <p className="text-sm">{synthesizedInsights.overall_assessment.summary || "N/A"}</p>
                                    {synthesizedInsights.overall_assessment.key_risk_factors && (
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-sm font-medium">Key Risk Factors:</span>
                                            {synthesizedInsights.overall_assessment.key_risk_factors.map((f, i) => (
                                                <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>
                                            ))}
                                        </div>
                                    )}
                                    {synthesizedInsights.overall_assessment.mitigating_factors && (
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-sm font-medium">Mitigating Factors:</span>
                                            {synthesizedInsights.overall_assessment.mitigating_factors.map((f, i) => (
                                                <Badge key={i} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">{f}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {synthesizedInsights.recommendations && (
                            <div className="space-y-2">
                                <h4 className="font-semibold">Recommendations</h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {synthesizedInsights.recommendations.additional_tests && synthesizedInsights.recommendations.additional_tests.length > 0 && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <h5 className="font-medium text-blue-800 text-sm mb-1">Additional Tests</h5>
                                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                                {synthesizedInsights.recommendations.additional_tests.map((t, i) => (
                                                    <li key={i}>{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {synthesizedInsights.recommendations.follow_up_actions && synthesizedInsights.recommendations.follow_up_actions.length > 0 && (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                            <h5 className="font-medium text-purple-800 text-sm mb-1">Follow-up Actions</h5>
                                            <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                                                {synthesizedInsights.recommendations.follow_up_actions.map((a, i) => (
                                                    <li key={i}>{a}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {synthesizedInsights.recommendations.exclusions_to_consider && synthesizedInsights.recommendations.exclusions_to_consider.length > 0 && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <h5 className="font-medium text-amber-800 text-sm mb-1">Exclusions to Consider</h5>
                                            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                                                {synthesizedInsights.recommendations.exclusions_to_consider.map((e, i) => (
                                                    <li key={i}>{e}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {synthesizedInsights.recommendations.waiting_periods && synthesizedInsights.recommendations.waiting_periods.length > 0 && (
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                                            <h5 className="font-medium text-slate-800 text-sm mb-1">Waiting Periods</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                                {synthesizedInsights.recommendations.waiting_periods.map((w, i) => (
                                                    <li key={i}>{w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Risk Assessment Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Risk Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Medical Risk Score</div>
                            <div className="text-2xl font-bold">{data.risk_assessment.medical_risk_score}/100</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Occupation Risk</div>
                            <div className="text-2xl font-bold">{data.risk_assessment.occupational_risk_score}</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Overall Risk Level</div>
                            <Badge
                                variant={data.risk_assessment.overall_risk_score > 50 ? "destructive" : "default"}
                                className="text-lg px-3 py-1 mt-1"
                            >
                                {data.risk_assessment.risk_level}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Identified Risks</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.risk_assessment.identified_risks.map((risk, i) => (
                                <Badge key={i} variant="secondary" className="border-red-200 bg-red-50 text-red-700">{risk}</Badge>
                            ))}
                            {data.risk_assessment.identified_risks.length === 0 && <span className="text-muted-foreground text-sm">None identified</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Mitigating Factors</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.risk_assessment.mitigating_factors.map((factor, i) => (
                                <Badge key={i} variant="outline" className="border-green-200 bg-green-50 text-green-700">{factor}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Underwriting Decision Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Underwriting Decision Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {decision.required_follow_ups && decision.required_follow_ups.length > 0 && (
                        <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <Info className="h-5 w-5 text-blue-600 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-800 text-sm">Required Follow-ups</h4>
                                <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
                                    {decision.required_follow_ups.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {decision.exclusions && decision.exclusions.length > 0 && (
                        <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-yellow-800 text-sm">Suggested Exclusions</h4>
                                <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                                    {decision.exclusions.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {decision.waiting_periods && decision.waiting_periods.length > 0 && (
                        <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                            <Clock className="h-5 w-5 text-slate-600 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm">Waiting Periods</h4>
                                <ul className="list-disc list-inside text-sm text-slate-700 mt-1">
                                    {decision.waiting_periods.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}