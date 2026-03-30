import { useAuth } from "@/context/AuthContext";
import { useUnderwriting } from "@/hooks/useUnderwriting";
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
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, Activity, LogOut, Globe, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Stats Card Component - from arabic_claims theme
function StatsCard({
    title,
    value,
    subtitle,
    variant = "default"
}: {
    title: string;
    value: string | number;
    subtitle: string;
    variant?: "default" | "amber" | "blue" | "emerald" | "red";
}) {
    const variantClasses = {
        default: "bg-white border",
        amber: "bg-amber-50 border-amber-200",
        blue: "bg-blue-50 border-blue-200",
        emerald: "bg-emerald-50 border-emerald-200",
        red: "bg-red-50 border-red-200",
    };

    const textClasses = {
        default: { label: "text-slate-500", value: "text-slate-800", subtitle: "text-slate-500" },
        amber: { label: "text-amber-600", value: "text-amber-700", subtitle: "text-amber-600" },
        blue: { label: "text-blue-600", value: "text-blue-700", subtitle: "text-blue-600" },
        emerald: { label: "text-emerald-600", value: "text-emerald-700", subtitle: "text-emerald-600" },
        red: { label: "text-red-600", value: "text-red-700", subtitle: "text-red-600" },
    };

    const styles = textClasses[variant];

    return (
        <Card className={variantClasses[variant]}>
            <CardContent className="p-4">
                <p className={cn("text-xs uppercase tracking-wider font-medium", styles.label)}>{title}</p>
                <p className={cn("text-3xl font-bold mt-1", styles.value)}>{value}</p>
                <p className={cn("text-sm", styles.subtitle)}>{subtitle}</p>
            </CardContent>
        </Card>
    );
}

export default function UnderwritingPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const {
        spajResult,
        medicalResult,
        bordereauxId,
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
        reset,
    } = useUnderwriting();

    const handleSPAJReset = () => {
        if (confirm("Resetting will clear all current progress. Continue?")) {
            reset();
        }
    };

    // Calculate stats
    const stats = {
        step: spajResult ? (medicalResult ? 2 : 1) : 0,
        spajStatus: spajResult ? "Completed" : (isUploadingSPAJ || spajJobStatus === "running" ? "Processing" : "Pending"),
        medicalStatus: medicalResult ? "Completed" : (isUploadingMedical || medicalJobStatus === "running" ? "Processing" : (spajResult ? "Ready" : "Waiting")),
        verdict: medicalResult?.synthesized_insights?.final_verdict?.decision || medicalResult?.underwriting_decision?.decision || "Pending"
    };

    const currentDateTime = new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Auto-hide Left Sidebar */}
            <div className="fixed left-0 top-0 h-full z-40 group">
                <div className="absolute left-0 top-0 h-full w-4 z-10" />
                <div className="absolute left-0 top-0 h-full w-16 bg-white border-r border-slate-200 shadow-sm
                              transform -translate-x-12 group-hover:translate-x-0 transition-transform duration-200 ease-in-out
                              flex flex-col items-center py-4 gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => navigate("/flows")}
                        title="Back to Flows"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                    <div className="w-8 h-px bg-slate-200 my-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-blue-600 bg-blue-50"
                        title="Health Underwriting (current)"
                    >
                        <Activity className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-50">
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src="/olvo-logo.png"
                                alt="Olvo"
                                className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => navigate("/flows")}
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Health Underwriting Pipeline</h1>
                                <p className="text-xs text-slate-500">AI-Powered Insurance Underwriting</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500">
                                Last updated <span className="font-semibold text-slate-700">{currentDateTime}</span>
                            </span>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Globe className="h-4 w-4" />
                                ENGLISH
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-slate-600"
                                onClick={() => {
                                    logout();
                                    navigate("/login", { replace: true });
                                }}
                            >
                                <LogOut className="h-4 w-4" />
                                LOGOUT
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">UNDERWRITING WORKSPACE</p>
                        <h2 className="text-xl font-bold text-slate-800">Health Insurance Underwriting</h2>
                        <p className="text-sm text-slate-500">Two-step pipeline: SPAJ extraction → Medical analysis</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleSPAJReset}>
                            <RefreshCcw className="h-4 w-4" />
                            Reset Pipeline
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-4 gap-4">
                    <StatsCard
                        title="STEP"
                        value={stats.step === 2 ? "Complete" : `Step ${stats.step + 1}`}
                        subtitle={stats.step === 2 ? "Pipeline finished" : "In progress"}
                    />
                    <StatsCard
                        title="SPAJ STATUS"
                        value={stats.spajStatus}
                        subtitle={spajResult ? "Data extracted" : "Awaiting upload"}
                        variant={spajResult ? "emerald" : "default"}
                    />
                    <StatsCard
                        title="MEDICAL STATUS"
                        value={stats.medicalStatus}
                        subtitle={medicalResult ? "Analysis complete" : "Awaiting SPAJ"}
                        variant={medicalResult ? "emerald" : (spajResult ? "amber" : "default")}
                    />
                    <StatsCard
                        title="VERDICT"
                        value={stats.verdict}
                        subtitle={medicalResult ? "Final decision" : "Pending analysis"}
                        variant={
                            stats.verdict === "Approve" || stats.verdict === "Standard" ? "emerald" :
                            stats.verdict === "Approve with Loading" || stats.verdict === "Sub-standard" ? "amber" :
                            stats.verdict === "Reject" || stats.verdict === "Decline" ? "red" : "default"
                        }
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-4">
                {/* Upload Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                    <div className="col-span-3">
                        <SPAJUploadCard
                            onUpload={uploadSPAJ}
                            isLoading={isUploadingSPAJ || spajJobStatus === "running" || spajJobStatus === "queued"}
                            status={spajResult ? "success" : (spajJobError ? "error" : "idle")}
                            onReset={spajResult ? handleSPAJReset : undefined}
                        />
                        {spajJobError && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                {spajJobError}
                            </div>
                        )}
                    </div>
                    <div className="col-span-4">
                        <MedicalUploadCard
                            onUpload={(files) => uploadMedical({ files, spajResult: spajResult! })}
                            isLoading={isUploadingMedical || medicalJobStatus === "running" || medicalJobStatus === "queued"}
                            isEnabled={!!spajResult}
                            status={medicalResult ? "success" : (medicalJobError ? "error" : "idle")}
                            onReset={() => { /* Medical specific reset if needed */ }}
                        />
                        {medicalJobError && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                {medicalJobError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {spajResult && (
                    <Tabs defaultValue="form-data" className="space-y-4">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="form-data">Policy Data</TabsTrigger>
                            <TabsTrigger value="applicant">Applicant Details</TabsTrigger>
                            <TabsTrigger value="rules">Rules Check</TabsTrigger>
                            <TabsTrigger value="lab">Lab Results</TabsTrigger>
                            <TabsTrigger value="analysis" disabled={!medicalResult}>Medical Analysis</TabsTrigger>
                            <TabsTrigger value="bordereaux" disabled={!medicalResult}>Bordereaux</TabsTrigger>
                        </TabsList>

                        <TabsContent value="form-data" className="space-y-4">
                            <FormDataTab data={spajResult} />
                        </TabsContent>

                        <TabsContent value="applicant" className="space-y-4">
                            <ApplicantDetailsTab data={spajResult} />
                        </TabsContent>

                        <TabsContent value="rules" className="space-y-4">
                            <UnderwritingRulesTab spajData={spajResult} medicalData={medicalResult} />
                        </TabsContent>

                        <TabsContent value="lab" className="space-y-4">
                            <LabResultsTab data={medicalResult} />
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-4">
                            <MedicalAnalysisTab data={medicalResult} />
                        </TabsContent>

                        <TabsContent value="bordereaux" className="space-y-4">
                            <BordereauxTab
                                bordereauxId={bordereauxId}
                                onGenerate={generateBordereaux}
                                isGenerating={isGeneratingBordereaux}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}