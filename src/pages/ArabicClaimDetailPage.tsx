import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Brain,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronRight,
  Download,
  PanelLeft,
  PanelLeftClose,
  Save,
  Check,
  X,
  LayoutGrid,
  Share2,
  Trash2,
  Undo2,
  Receipt,
} from "lucide-react";
import { PageDetailView } from "@/components/arabic-claims/PageViewer";
import { PageManagementBar } from "@/components/arabic-claims/PageManagementBar";
import { AnalysisPanel } from "@/components/arabic-claims/AnalysisPanel";
import { InvoiceTable } from "@/components/arabic-claims/InvoiceTable";
import { PDFViewer } from "@/components/arabic-claims/PDFViewer";
import { ShareDialog } from "@/components/arabic-claims/ShareDialog";
import { useAuth } from "@/context/AuthContext";
import { useAnalysisDiff } from "@/hooks/useAnalysisDiff";
import type { AnalysisDiffState } from "@/hooks/useAnalysisDiff";
import {
  getArabicClaimFull,
  getJobStatus,
  reanalyzeArabicClaim,
  getPdfUrls,
  getPageStatus,
  reprocessClaim,
  acceptSuggestion,
  rejectSuggestion,
} from "@/lib/arabicClaimsApi";
import { cn } from "@/lib/utils";
import type {
  ArabicClaimsData,
  PageData,
} from "@/types/arabicClaims";

const getReadabilityColor = (score: number) => {
  if (score >= 8) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 5) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
};

const getReadabilityLabel = (score: number) => {
  if (score >= 9) return "Excellent";
  if (score >= 8) return "Good";
  if (score >= 5) return "Review Needed";
  return "Illegible";
};

export default function ArabicClaimDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.username;

  // Permission & sharing state
  const [userPermission, setUserPermission] = useState<"owner" | "edit" | "view" | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const canEdit = userPermission === "owner" || userPermission === "edit";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<ArabicClaimsData | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isRegeneratingAnalysis, setIsRegeneratingAnalysis] = useState(false);
  const [editedPageNumbers, setEditedPageNumbers] = useState<number[]>([]);
  const [isPdfPanelOpen, setIsPdfPanelOpen] = useState(true);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [pagePdfUrls, setPagePdfUrls] = useState<Record<number, string>>({});

  // Page management state
  const [removedPageNumbers, setRemovedPageNumbers] = useState<number[]>([]);
  const [hasPendingPageChanges, setHasPendingPageChanges] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    pending: number;
    total: number;
  } | null>(null);

  // Regenerate modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [additionalInstruction, setAdditionalInstruction] = useState("");

  // Analysis diff state
  const {
    userAnalysis,
    diffState,
    editedFields,
    stats,
    initializeAnalysis,
    updateField,
    setLlmSuggestedAnalysis,
    acceptLlmSuggestion,
    rejectLlmSuggestion,
    acceptAllSuggestions,
    rejectAllSuggestions,
    saveEdits,
  } = useAnalysisDiff(null);

  const sortedPages = useMemo(
    () =>
      [...(claimData?.pages || [])].sort(
        (a, b) => a.page_number - b.page_number
      ),
    [claimData?.pages]
  );

  const fetchData = async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const [statusResp, fullData, pdfResp] = await Promise.all([
        getJobStatus(jobId, userId),
        getArabicClaimFull(jobId, userId),
        getPdfUrls(jobId, userId),
      ]);

      setJobStatus(statusResp.status);
      setClaimData(fullData);
      setUserPermission(fullData.user_permission ?? null);
      setEditedPageNumbers([]);
      setRemovedPageNumbers(fullData.removed_page_numbers ?? []);
      setHasPendingPageChanges(false);
      setMergedPdfUrl(pdfResp.merged_pdf_url);
      setPagePdfUrls(pdfResp.page_pdf_urls || {});

      // Initialize analysis diff state
      initializeAnalysis(fullData.analysis || null);

      // Restore pending suggestion from DB (survives refresh)
      if (fullData.suggested_analysis) {
        setLlmSuggestedAnalysis(fullData.suggested_analysis);
      }

      if (fullData.pages.length > 0) {
        const firstPage = [...fullData.pages].sort(
          (a, b) => a.page_number - b.page_number
        )[0];
        setSelectedPage(firstPage.page_number);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load claim data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  // Poll extraction status when pages are being extracted
  useEffect(() => {
    if (!extractionStatus || extractionStatus.pending === 0 || !jobId) return;

    const interval = setInterval(async () => {
      try {
        const status = await getPageStatus(jobId, userId);
        setExtractionStatus({
          pending: status.pending,
          total: status.total,
        });

        if (status.pending === 0) {
          // Extraction done — refresh pages
          const fullData = await getArabicClaimFull(jobId, userId);
          setClaimData(fullData);
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [extractionStatus, jobId, userId]);

  const selectedPageData = sortedPages.find(
    (p) => p.page_number === selectedPage
  );

  const handlePageDataChange = (
    pageNumber: number,
    updates: Partial<PageData>
  ) => {
    setClaimData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page) =>
          page.page_number === pageNumber ? { ...page, ...updates } : page
        ),
      };
    });
    setEditedPageNumbers((prev) =>
      prev.includes(pageNumber) ? prev : [...prev, pageNumber]
    );
  };

  // -- Page management handlers --

  const handleRemovePage = (pageNumber: number) => {
    setRemovedPageNumbers((prev) => [...prev, pageNumber]);
    setHasPendingPageChanges(true);
    // If removed the currently selected page, select next available
    if (selectedPage === pageNumber) {
      const remaining = sortedPages.filter(
        (p) => p.page_number !== pageNumber && !removedPageNumbers.includes(p.page_number)
      );
      setSelectedPage(remaining.length > 0 ? remaining[0].page_number : null);
    }
  };

  const handleRestorePage = (pageNumber: number) => {
    setRemovedPageNumbers((prev) => prev.filter((n) => n !== pageNumber));
    // If no more changes (removed list empty and no new pages added), clear flag
    // Keep hasPendingPageChanges true if there were added pages
  };

  const handleUndoAllRemovals = () => {
    setRemovedPageNumbers([]);
  };

  const handlePagesAdded = async () => {
    if (!jobId) return;
    setHasPendingPageChanges(true);
    try {
      const status = await getPageStatus(jobId, userId);
      setExtractionStatus({ pending: status.pending, total: status.total });
      // Refresh pages to show new pending ones
      const fullData = await getArabicClaimFull(jobId, userId);
      setClaimData(fullData);
    } catch (error) {
      console.error("Failed to refresh after adding pages:", error);
    }
  };

  const handleReprocess = async () => {
    if (!jobId || !claimData) return;
    setIsReprocessing(true);

    try {
      const editedSet = new Set(editedPageNumbers);
      const response = await reprocessClaim(
        jobId,
        {
          pages: claimData.pages
            .filter((p) => !removedPageNumbers.includes(p.page_number))
            .map((page) => ({
              ...page,
              review_status: editedSet.has(page.page_number)
                ? "reviewed_by_human"
                : "llm_extracted_unreviewed",
            })),
          edited_page_numbers: Array.from(editedSet).sort((a, b) => a - b),
          user_edited_fields: Array.from(editedFields),
          edited_analysis: userAnalysis
            ? (userAnalysis as unknown as Record<string, unknown>)
            : undefined,
          removed_page_numbers: removedPageNumbers,
          additional_instruction: additionalInstruction || undefined,
        },
        userId
      );

      // Poll for completion
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const status = await getJobStatus(response.job_id, userId);
        if (status.status === "completed") {
          // Suggestion is stored in DB — just reload everything
          setExtractionStatus(null);
          await fetchData();
          return;
        }
        if (status.status === "failed") {
          throw new Error(status.error || "Reprocessing failed");
        }
      }
      throw new Error("Reprocessing timed out");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to reprocess: ${message}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleAcceptAllSuggestions = async () => {
    if (!jobId) return;
    acceptAllSuggestions(); // Update local state immediately
    try {
      await acceptSuggestion(jobId, userId);
      await fetchData(); // Reload from DB
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
    }
  };

  const handleRejectAllSuggestions = async () => {
    if (!jobId) return;
    rejectAllSuggestions(); // Update local state immediately
    try {
      await rejectSuggestion(jobId, userId);
      await fetchData(); // Reload from DB
    } catch (err) {
      console.error("Failed to reject suggestion:", err);
    }
  };

  const handleDownload = () => {
    if (!claimData) return;
    const fileName = `${jobId || "arabic-claim"}.json`;
    const blob = new Blob([JSON.stringify(claimData, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleOpenRegenerateModal = () => {
    setAdditionalInstruction("");
    setShowRegenerateModal(true);
  };

  const handleRegenerateAnalysis = async () => {
    if (!jobId || !claimData || claimData.pages.length === 0) return;

    setShowRegenerateModal(false);
    setIsRegeneratingAnalysis(true);

    try {
      const editedSet = new Set(editedPageNumbers);
      const payloadPages = claimData.pages.map((page) => ({
        ...page,
        review_status: editedSet.has(page.page_number)
          ? "reviewed_by_human"
          : "llm_extracted_unreviewed",
      }));

      const editedAnalysisFieldsArray = Array.from(editedFields);

      const response = await reanalyzeArabicClaim(jobId, {
        pages: payloadPages,
        edited_page_numbers: Array.from(editedSet).sort((a, b) => a - b),
        user_edited_fields: editedAnalysisFieldsArray,
        edited_analysis: userAnalysis ? (userAnalysis as unknown as Record<string, unknown>) : undefined,
        additional_instruction: additionalInstruction || undefined,
      }, userId);

      // Poll for reanalysis completion
      const pollReanalysis = async (reanalyzeJobId: string) => {
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const status = await getJobStatus(reanalyzeJobId, userId);
          if (status.status === "completed") {
            // Suggestion is stored in DB — reload to pick it up
            await fetchData();
            return;
          }
          if (status.status === "failed") {
            throw new Error(status.error || "Reanalysis failed");
          }
        }
        throw new Error("Reanalysis timed out");
      };

      await pollReanalysis(response.job_id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to regenerate analysis: ${message}`);
    } finally {
      setIsRegeneratingAnalysis(false);
    }
  };

  const handleSaveEdits = () => {
    if (!userAnalysis) return;

    saveEdits();

    // Update claimData with saved analysis
    setClaimData((prev) => {
      if (!prev) return prev;
      return { ...prev, analysis: userAnalysis };
    });
  };

  const handleRemoveWarning = (index: number) => {
    if (!userAnalysis) return;
    const newWarnings = userAnalysis.risk_flags.filter((_, i) => i !== index);
    updateField("risk_flags", newWarnings.join("\n"));
  };

  const handleValidateWarning = (index: number) => {
    // Mark warning as validated - for now just log it
    // Could add a validated_flags array to track this
    console.log("Warning validated:", index);
  };

  const handleFieldChange = (fieldName: keyof AnalysisDiffState, value: string) => {
    updateField(fieldName, value);
  };

  const handleAcceptSuggestion = (fieldName: keyof AnalysisDiffState) => {
    acceptLlmSuggestion(fieldName);
  };

  const handleRejectSuggestion = (fieldName: keyof AnalysisDiffState) => {
    rejectLlmSuggestion(fieldName);
  };

  const hasEdits = stats.userEditCount > 0 || editedPageNumbers.length > 0;
  const hasSuggestions = stats.llmSuggestionCount > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading claim data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Claim</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Auto-hide Left Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40 group">
        {/* Invisible hover trigger area */}
        <div className="absolute left-0 top-0 h-full w-4 z-10" />

        {/* Sidebar that slides out on hover */}
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
            className="h-10 w-10 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/arabic-claims")}
            title="Arabic Claims List"
          >
            <FileText className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate("/arabic-claims")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsPdfPanelOpen(!isPdfPanelOpen)}
              >
                {isPdfPanelOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </Button>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Arabic Claim: {jobId?.slice(0, 8)}...
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Arabic Claims</Badge>
                  <Badge
                    className={
                      jobStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : jobStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {jobStatus?.toUpperCase()}
                  </Badge>
                  {userPermission === "view" && (
                    <Badge className="bg-slate-100 text-slate-600">
                      <Eye className="h-3 w-3 mr-1" />
                      View Only
                    </Badge>
                  )}
                  {userPermission === "edit" && (
                    <Badge className="bg-blue-100 text-blue-700">
                      Shared (Edit)
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {claimData?.total_pages} page
                    {claimData?.total_pages !== 1 ? "s" : ""}
                  </span>
                  {isReprocessing && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Reprocessing
                    </Badge>
                  )}
                  {hasPendingPageChanges && !isReprocessing && (
                    <Badge className="bg-amber-100 text-amber-800">
                      Pending reprocess
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Edits Button — edit/owner only */}
              {canEdit && hasEdits && (
                <Button
                  onClick={handleSaveEdits}
                  variant="default"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Edits
                </Button>
              )}
              {/* Share Button */}
              {userPermission && userId && (
                <Button
                  onClick={() => setShareDialogOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
              <Button
                onClick={handleDownload}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={fetchData}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* PDF Panel */}
        <div
          className={`transition-all duration-300 ease-in-out border-r bg-white ${
            isPdfPanelOpen ? "w-[45%] lg:w-[40%] xl:w-[35%]" : "w-0"
          } overflow-hidden flex flex-col min-h-0`}
        >
          <div className="flex-1 p-4 min-h-0">
            <PDFViewer
              pdfUrl={
                selectedPage && pagePdfUrls[selectedPage]
                  ? pagePdfUrls[selectedPage]
                  : mergedPdfUrl || undefined
              }
              fileName={selectedPage ? `page_${selectedPage}.pdf` : "merged.pdf"}
              currentPage={1}
            />
          </div>
        </div>

        {/* Arabic Claims Content */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="pages" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pages" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Individual Page Reading ({claimData?.pages.length || 0})
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2">
                  <Brain className="h-4 w-4" />
                  Claim Review Summary
                  {hasEdits && (
                    <Badge variant="secondary" className="ml-1">
                      {stats.userEditCount + editedPageNumbers.length} edits
                    </Badge>
                  )}
                  {hasSuggestions && (
                    <Badge variant="outline" className="ml-1 bg-green-50 text-green-700">
                      {stats.llmSuggestionCount} suggestions
                    </Badge>
                  )}
                </TabsTrigger>
                {(claimData?.invoices?.length ?? 0) > 0 && (
                  <TabsTrigger value="invoices" className="gap-2">
                    <Receipt className="h-4 w-4" />
                    Invoices ({claimData?.invoices?.length || 0})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="pages">
                <div className="space-y-4">
                  {/* Page Management Bar */}
                  {canEdit && (
                    <PageManagementBar
                      jobId={jobId!}
                      userId={userId}
                      pageCount={sortedPages.length}
                      removedCount={removedPageNumbers.length}
                      hasPendingChanges={hasPendingPageChanges}
                      isReprocessing={isReprocessing}
                      extractionStatus={extractionStatus}
                      onPagesAdded={handlePagesAdded}
                      onReprocessClick={handleReprocess}
                      onUndoAllRemovals={handleUndoAllRemovals}
                    />
                  )}

                  <Card>
                    <CardContent className="p-0">
                      {sortedPages.length > 0 ? (
                        <div className="divide-y">
                          {sortedPages.map((page) => {
                            const isRemoved = removedPageNumbers.includes(page.page_number);
                            const isPending = page.status === "pending";
                            const isFailed = page.status === "failed";

                            return (
                              <div
                                key={page.page_number}
                                className={cn(
                                  "flex items-center gap-2 group",
                                  isRemoved && "opacity-50"
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    !isRemoved && setSelectedPage(page.page_number)
                                  }
                                  className={cn(
                                    "flex-1 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                                    "flex items-center justify-between gap-3",
                                    selectedPage === page.page_number &&
                                      !isRemoved &&
                                      "bg-blue-50",
                                    isRemoved && "line-through cursor-default hover:bg-transparent"
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Eye className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span className="font-medium text-sm shrink-0">
                                      Page {page.page_number}
                                    </span>
                                    {isPending && (
                                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        Extracting
                                      </Badge>
                                    )}
                                    {isFailed && (
                                      <Badge className="bg-red-100 text-red-800 border-red-200">
                                        Failed
                                      </Badge>
                                    )}
                                    {isRemoved && (
                                      <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                                        Removed
                                      </Badge>
                                    )}
                                    {!isRemoved && !isPending && !isFailed && page.has_ambiguity && (
                                      <Badge
                                        variant="outline"
                                        className="text-amber-700 border-amber-300"
                                      >
                                        Inferred
                                      </Badge>
                                    )}
                                  </div>
                                  {!isRemoved && !isPending && !isFailed && (
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "whitespace-nowrap",
                                          getReadabilityColor(
                                            page.readability_score
                                          )
                                        )}
                                      >
                                        {page.readability_score.toFixed(1)}/10 -{" "}
                                        {getReadabilityLabel(
                                          page.readability_score
                                        )}
                                      </Badge>
                                      <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                  )}
                                </button>

                                {/* Remove / Restore button */}
                                {canEdit && (
                                  isRemoved ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 mr-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 shrink-0"
                                      onClick={() => handleRestorePage(page.page_number)}
                                      title="Restore page"
                                    >
                                      <Undo2 className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemovePage(page.page_number)}
                                      disabled={isPending}
                                      title="Remove page"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">
                          No pages found. Add pages to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div>
                    {selectedPageData ? (
                      <PageDetailView
                        page={selectedPageData}
                        invoice={claimData?.invoices?.find(
                          (inv) => inv.page_number === selectedPageData.page_number
                        ) ?? null}
                        onChange={canEdit ? (updates) =>
                          handlePageDataChange(
                            selectedPageData.page_number,
                            updates
                          ) : undefined}
                      />
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center text-slate-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          {selectedPage ? (
                            <p>
                              No OCR detail available for page{" "}
                              {selectedPage}
                            </p>
                          ) : (
                            <p>Select a page to view details</p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div>
                  {/* Action Bar */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        Claim Review Summary
                      </h2>
                      {canEdit && hasSuggestions && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={handleAcceptAllSuggestions}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Accept All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 border-red-300 hover:bg-red-50"
                            onClick={handleRejectAllSuggestions}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject All
                          </Button>
                        </div>
                      )}
                    </div>
                    {canEdit && (
                      <Button
                        onClick={handleOpenRegenerateModal}
                        disabled={isRegeneratingAnalysis}
                        className="gap-2"
                      >
                        {isRegeneratingAnalysis ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {isRegeneratingAnalysis
                          ? "Regenerating..."
                          : "Regenerate Analysis"}
                      </Button>
                    )}
                  </div>

                  <AnalysisPanel
                    analysis={userAnalysis}
                    diffState={diffState}
                    onFieldChange={handleFieldChange}
                    onAcceptSuggestion={handleAcceptSuggestion}
                    onRejectSuggestion={handleRejectSuggestion}
                    onRemoveWarning={handleRemoveWarning}
                    onValidateWarning={handleValidateWarning}
                    readOnly={!canEdit}
                  />
                </div>
              </TabsContent>

              <TabsContent value="invoices">
                <InvoiceTable invoices={claimData?.invoices ?? []} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {jobId && userId && userPermission && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          jobId={jobId}
          currentUserId={userId}
          userPermission={userPermission}
        />
      )}

      {/* Regenerate Modal */}
      <Dialog open={showRegenerateModal} onOpenChange={setShowRegenerateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              The analysis will be regenerated with your edited information preserved.
              You can add additional instructions below to guide the LLM.
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Instructions (optional)
              </label>
              <Textarea
                value={additionalInstruction}
                onChange={(e) => setAdditionalInstruction(e.target.value)}
                placeholder="e.g., Focus on extracting diagnosis details, prioritize financial information..."
                className="min-h-[100px]"
              />
            </div>
            {(stats.userEditCount > 0 || editedPageNumbers.length > 0) && (
              <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                <strong>{stats.userEditCount + editedPageNumbers.length}</strong> edit(s) will be preserved during regeneration.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerateAnalysis} disabled={isRegeneratingAnalysis}>
              {isRegeneratingAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Regeneration
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}