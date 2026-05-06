import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Stepper, type Step } from "@/components/underwriting/Stepper";
import { StatCard, StatusPill } from "@/components/underwriting/StatCard";
import { SPAJUploadCard } from "@/components/underwriting/SPAJUploadCard";
import { MedicalUploadCard } from "@/components/underwriting/MedicalUploadCard";
import { FormDataTab } from "@/components/underwriting/FormDataTab";
import { ApplicantDetailsTab } from "@/components/underwriting/ApplicantDetailsTab";
import { UnderwritingRulesTab } from "@/components/underwriting/UnderwritingRulesTab";
import { LabResultsTab } from "@/components/underwriting/LabResultsTab";
import { MedicalAnalysisTab } from "@/components/underwriting/MedicalAnalysisTab";
import { BordereauxTab } from "@/components/underwriting/BordereauxTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUnderwriting } from "@/hooks/useUnderwriting";
import {
    Activity,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    Gauge,
    RefreshCcw,
    Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StageId = "spaj" | "medical" | "bordereaux";

export default function UnderwritingPage() {
    const {
        spajResult,
        medicalResult,
        bordereauxId,
        bordereauxData,
        uploadSPAJ,
        isUploadingSPAJ,
        spajJobStatus,
        spajJobError,
        uploadMedical,
        isUploadingMedical,
        medicalJobStatus,
        medicalJobError,
        generateBordereaux,
        isGeneratingBordereaux,
        downloadBordereaux,
        reset,
        resetMedical,
    } = useUnderwriting();

    const [stage, setStage] = useState<StageId>("spaj");

    const spajRunning = isUploadingSPAJ || spajJobStatus === "running" || spajJobStatus === "queued";
    const medicalRunning =
        isUploadingMedical || medicalJobStatus === "running" || medicalJobStatus === "queued";

    const verdict =
        medicalResult?.synthesized_insights?.final_verdict?.decision ||
        medicalResult?.underwriting_decision?.decision ||
        "Pending";
    const verdictLoading =
        medicalResult?.synthesized_insights?.final_verdict?.loading_percentage ??
        medicalResult?.underwriting_decision?.loading_percentage;

    const verdictTone =
        verdict === "Approve" || verdict === "Standard"
            ? "verified"
            : verdict === "Approve with Loading" || verdict === "Sub-standard"
            ? "pending"
            : verdict === "Reject" || verdict === "Decline" || verdict === "Declined"
            ? "alert"
            : verdict === "Postpone"
            ? "primary"
            : "default";

    const steps: Step[] = useMemo(
        () => [
            {
                id: "spaj",
                label: "SPAJ Upload",
                description: spajResult ? "Extracted" : spajRunning ? "Processing" : "Pending",
                state: spajResult ? "complete" : "active",
            },
            {
                id: "medical",
                label: "Medical Analysis",
                description: medicalResult
                    ? "Analyzed"
                    : medicalRunning
                    ? "Processing"
                    : spajResult
                    ? "Ready"
                    : "Locked",
                state: medicalResult ? "complete" : spajResult ? "active" : "pending",
            },
            {
                id: "bordereaux",
                label: "Generate Bordereaux",
                description: bordereauxId ? "Ready" : medicalResult ? "Ready" : "Locked",
                state: bordereauxId ? "complete" : medicalResult ? "active" : "pending",
            },
        ],
        [spajResult, spajRunning, medicalResult, medicalRunning, bordereauxId]
    );

    const onStepClick = (id: string) => {
        if (id === "spaj") setStage("spaj");
        if (id === "medical" && spajResult) setStage("medical");
        if (id === "bordereaux" && medicalResult) setStage("bordereaux");
    };

    const handleResetAll = () => {
        if (confirm("Reset all extraction and analysis state?")) reset();
    };

    return (
        <AppShell
            eyebrow="Underwriting Workspace"
            title="Health Underwriting Pipeline"
            subtitle="SPAJ extraction → Medical analysis → Bordereaux"
            actions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetAll}
                    disabled={!spajResult && !medicalResult && !bordereauxId}
                >
                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reset
                </Button>
            }
        >
            <div className="space-y-5">
                <Stepper steps={steps} onStepClick={onStepClick} />

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard
                        label="Stage"
                        value={
                            bordereauxId ? "Bordereaux" : medicalResult ? "Bordereaux" : spajResult ? "Medical" : "SPAJ"
                        }
                        sub={`Step ${steps.filter((s) => s.state === "complete").length} of 3 complete`}
                        icon={Gauge}
                    />
                    <StatCard
                        label="SPAJ Status"
                        value={spajResult ? "Extracted" : spajRunning ? "Processing" : "Pending"}
                        sub={
                            spajResult
                                ? spajResult.personal_data?.nama_lengkap || "Applicant data ready"
                                : "Awaiting upload"
                        }
                        tone={spajResult ? "verified" : spajRunning ? "pending" : "default"}
                        icon={FileText}
                    />
                    <StatCard
                        label="Medical"
                        value={
                            medicalResult ? "Analyzed" : medicalRunning ? "Processing" : spajResult ? "Ready" : "Locked"
                        }
                        sub={
                            medicalResult
                                ? `${medicalResult.lab_results?.length ?? 0} lab tests · ${
                                      medicalResult.risk_assessment?.identified_risks?.length ?? 0
                                  } risks`
                                : spajResult
                                ? "Awaiting medical PDFs"
                                : "Upload SPAJ first"
                        }
                        tone={
                            medicalResult ? "verified" : medicalRunning ? "pending" : spajResult ? "primary" : "default"
                        }
                        icon={Stethoscope}
                    />
                    <StatCard
                        label="Verdict"
                        value={
                            verdict === "Approve with Loading" && verdictLoading
                                ? `Approve +${verdictLoading}%`
                                : verdict
                        }
                        sub={
                            medicalResult?.synthesized_insights?.final_verdict
                                ? "RAG-grounded synthesis"
                                : medicalResult
                                ? "Preliminary analysis"
                                : "Pending analysis"
                        }
                        tone={verdictTone as "verified" | "pending" | "alert" | "primary" | "default"}
                        icon={Activity}
                    />
                </div>

                <Tabs value={stage} onValueChange={(v) => setStage(v as StageId)}>
                    <TabsList className="rounded-md border border-border bg-card p-1">
                        <TabsTrigger value="spaj" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            1 · SPAJ Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="medical"
                            disabled={!spajResult}
                            className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                        >
                            <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
                            2 · Medical Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="bordereaux"
                            disabled={!medicalResult}
                            className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                        >
                            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                            3 · Bordereaux
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="spaj" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <SPAJUploadCard
                                    onUpload={uploadSPAJ}
                                    isLoading={spajRunning}
                                    status={spajResult ? "success" : spajJobError ? "error" : "idle"}
                                    statusMessage={spajJobError}
                                    onReset={spajResult ? handleResetAll : undefined}
                                />
                            </div>
                            <SummaryCard
                                title="What happens next"
                                done={!!spajResult}
                                items={[
                                    "Extract applicant, insurance, and health fields",
                                    "Compute BMI, occupation risk, income inference",
                                    "Unlock medical document analysis",
                                ]}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="medical" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <MedicalUploadCard
                                    onUpload={(files) =>
                                        uploadMedical({ files, spajResult: spajResult! })
                                    }
                                    isLoading={medicalRunning}
                                    isEnabled={!!spajResult}
                                    status={
                                        medicalResult ? "success" : medicalJobError ? "error" : "idle"
                                    }
                                    statusMessage={medicalJobError}
                                    onReset={
                                        medicalResult
                                            ? () => {
                                                  if (confirm("Replace medical analysis?")) {
                                                      resetMedical();
                                                  }
                                              }
                                            : undefined
                                    }
                                />
                            </div>
                            <SummaryCard
                                title="Pipeline"
                                done={!!medicalResult}
                                items={[
                                    "Extract lab results & vitals",
                                    "Identify risks & mitigating factors",
                                    "Retrieve UW guideline chunks (RAG)",
                                    "Synthesize verdict with loading %",
                                ]}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="bordereaux" className="mt-4">
                        <BordereauxTab
                            canGenerate={!!spajResult && !!medicalResult}
                            bordereauxId={bordereauxId}
                            bordereauxData={bordereauxData}
                            isGenerating={isGeneratingBordereaux}
                            onGenerate={generateBordereaux}
                            onDownload={downloadBordereaux}
                        />
                    </TabsContent>
                </Tabs>

                {spajResult && (
                    <section className="space-y-3">
                        <header className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Output
                                </p>
                                <h2 className="text-[16px] font-semibold text-foreground">
                                    Underwriting Workbench
                                </h2>
                            </div>
                            {medicalResult ? (
                                <StatusPill tone="verified">
                                    <CheckCircle2 className="h-3 w-3" /> Full data available
                                </StatusPill>
                            ) : (
                                <StatusPill tone="pending">SPAJ-only view</StatusPill>
                            )}
                        </header>

                        <Tabs defaultValue="form-data">
                            <TabsList className="flex w-full flex-wrap gap-1 rounded-md border border-border bg-card p-1">
                                <ResultTab value="form-data">Form Data</ResultTab>
                                <ResultTab value="rules">Underwriting Rules</ResultTab>
                                <ResultTab value="applicant">Applicant Details</ResultTab>
                                <ResultTab value="lab" disabled={!medicalResult}>
                                    Lab Results
                                </ResultTab>
                                <ResultTab value="analysis" disabled={!medicalResult}>
                                    Medical Analysis
                                </ResultTab>
                                <ResultTab value="bordereaux" disabled={!medicalResult}>
                                    Bordereaux
                                </ResultTab>
                            </TabsList>

                            <TabsContent value="form-data" className="mt-4">
                                <FormDataTab data={spajResult} />
                            </TabsContent>
                            <TabsContent value="rules" className="mt-4">
                                <UnderwritingRulesTab
                                    spajData={spajResult}
                                    medicalData={medicalResult}
                                />
                            </TabsContent>
                            <TabsContent value="applicant" className="mt-4">
                                <ApplicantDetailsTab data={spajResult} />
                            </TabsContent>
                            <TabsContent value="lab" className="mt-4">
                                <LabResultsTab data={medicalResult} />
                            </TabsContent>
                            <TabsContent value="analysis" className="mt-4">
                                <MedicalAnalysisTab data={medicalResult} />
                            </TabsContent>
                            <TabsContent value="bordereaux" className="mt-4">
                                <BordereauxTab
                                    canGenerate={!!spajResult && !!medicalResult}
                                    bordereauxId={bordereauxId}
                                    bordereauxData={bordereauxData}
                                    isGenerating={isGeneratingBordereaux}
                                    onGenerate={generateBordereaux}
                                    onDownload={downloadBordereaux}
                                />
                            </TabsContent>
                        </Tabs>
                    </section>
                )}
            </div>
        </AppShell>
    );
}

function ResultTab({
    value,
    disabled,
    children,
}: {
    value: string;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <TabsTrigger
            value={value}
            disabled={disabled}
            className={cn(
                "rounded-sm px-3 py-1.5 text-[12px] font-medium",
                "data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
            )}
        >
            {children}
        </TabsTrigger>
    );
}

function SummaryCard({
    title,
    items,
    done,
}: {
    title: string;
    items: string[];
    done: boolean;
}) {
    return (
        <aside className="flex h-full flex-col rounded-md border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {title}
            </p>
            <ul className="mt-3 flex-1 space-y-2 text-[12px] text-foreground">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                            className={cn(
                                "mt-0.5 h-3.5 w-3.5 shrink-0",
                                done ? "text-[hsl(var(--verified))]" : "text-muted-foreground/50"
                            )}
                        />
                        <span className={cn(!done && "text-muted-foreground")}>{item}</span>
                    </li>
                ))}
            </ul>
            {done && (
                <p className="mt-3 rounded-md bg-[hsl(var(--verified))]/5 px-3 py-2 text-[11px] text-[hsl(var(--verified))]">
                    All checks passed for this stage.
                </p>
            )}
        </aside>
    );
}
