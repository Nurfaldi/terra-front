import type { SPAJData, MedicalAnalysisResult } from "@/types/underwriting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnderwritingRulesTabProps {
    spajData: SPAJData | null;
    medicalData: MedicalAnalysisResult | null;
}

export function UnderwritingRulesTab({ spajData, medicalData }: UnderwritingRulesTabProps) {
    if (!spajData) return null;

    const decision = medicalData?.underwriting_decision?.decision || "Pending Analysis";
    const decisionColor =
        decision === "Standard" ? "bg-green-500" :
            decision === "Sub-standard" ? "bg-yellow-500" :
                decision === "Declined" ? "bg-red-500" : "bg-gray-500";
    const age = spajData.personal_data.usia ?? 0;
    const bmi = spajData.health_data.bmi ?? 0;
    const occupationRisk = spajData.personal_data.tingkat_risiko_pekerjaan ?? 0;
    const hasDiseaseHistory =
        spajData.health_data.mengalami_penyakit ??
        Boolean(spajData.health_data.riwayat_penyakit?.length);
    const creditAmount = spajData.insurance_data.jumlah_kredit ?? 0;
    const annualIncome = spajData.inference?.penghasilan_numerik ?? 0;
    const incomeFactor =
        annualIncome > 0 ? `${(creditAmount / annualIncome).toFixed(1)}x` : "N/A";

    return (
        <div className="space-y-6">
            {/* Verdict Banner */}
            <div className={cn("p-4 rounded-lg text-white shadow-md flex items-center justify-between", decisionColor)}>
                <div>
                    <h3 className="text-lg font-bold">Underwriting Decision: {decision}</h3>
                    {medicalData?.underwriting_decision?.loading_percentage ? (
                        <p className="opacity-90">Loading: {medicalData.underwriting_decision.loading_percentage}%</p>
                    ) : null}
                </div>
                {decision === "Standard" && <CheckCircle className="h-8 w-8" />}
                {(decision === "Sub-standard" || decision === "Postponed") && <AlertTriangle className="h-8 w-8" />}
                {decision === "Declined" && <XCircle className="h-8 w-8" />}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Rule Checks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Automated Rule Checks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <RuleItem
                                label="Age Eligibility"
                                status={age < 65 ? "pass" : "fail"}
                                value={`${age} years`}
                            />
                            <RuleItem
                                label="BMI Range"
                                status={bmi >= 18.5 && bmi <= 25 ? "pass" : "warning"}
                                value={bmi.toString()}
                            />
                            <RuleItem
                                label="Occupation Risk"
                                status={occupationRisk <= 2 ? "pass" : occupationRisk <= 3 ? "warning" : "fail"}
                                value={`Class ${occupationRisk}`}
                            />
                            <RuleItem
                                label="Medical History"
                                status={!hasDiseaseHistory ? "pass" : "warning"}
                                value={hasDiseaseHistory ? "Present" : "Clean"}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Factors */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Underwriting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm font-medium">Total Sum Assured</span>
                                <span className="font-mono">{creditAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm font-medium">Annual Income</span>
                                <span className="font-mono">{spajData.personal_data.penghasilan_per_tahun}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm font-medium">Income Factor</span>
                                <span className="font-mono">{incomeFactor}</span>
                            </div>
                            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                                <p className="font-semibold mb-1">Financial Assessment:</p>
                                <p className="text-muted-foreground">
                                    Sum assured is within acceptable limits based on stated income ({incomeFactor} income).
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function RuleItem({ label, status, value }: { label: string, status: "pass" | "warning" | "fail", value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{value}</span>
                {status === "pass" && <Badge variant="default" className="bg-green-500 hover:bg-green-600">Pass</Badge>}
                {status === "warning" && <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Review</Badge>}
                {status === "fail" && <Badge variant="destructive">Fail</Badge>}
            </div>
        </div>
    )
}
