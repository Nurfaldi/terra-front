import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, Clock, ChevronRight, X,
  Search, Receipt, Globe, LogOut, Activity, Trash2, Download, BarChart3,
  Loader2, RotateCcw, LayoutGrid, FileText, Share2, Users, Eye, Pencil,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  listArabicClaimsJobs,
  uploadArabicClaim,
  deleteArabicClaim,
} from "@/lib/arabicClaimsApi";
import { CASE_TYPES, CASE_TYPE_LABELS } from "@/types/arabicClaims";
import type { ArabicClaimsJobSummary } from "@/types/arabicClaims";
import { ShareDialog } from "@/components/arabic-claims/ShareDialog";
import { StatsCard } from "@/components/arabic-claims/StatsCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Type filter options
type ClaimCategoryFilter = "all" | "claims" | "underwriting";

// Claim Card Component - matching reference layout
interface ClaimCardProps {
  job: ArabicClaimsJobSummary;
  formatDate: (date: string) => string;
  onClick: () => void;
  onDelete: () => void;
  onShare: () => void;
  isDeleting: boolean;
}

const ClaimCard = ({ job, formatDate, onClick, onDelete, onShare, isDeleting }: ClaimCardProps) => {
  const caseCategory = job.input_data?.category || "CLAIMS";
  const isClaims = caseCategory === "CLAIMS" || caseCategory === "claims";

  const isProcessing = job.status === "running" || job.status === "queued";
  const isError = job.status === "failed";
  const isComplete = job.status === "completed";

  // Derive effective case type: user-provided claim_type, or LLM-inferred from result
  const inferredCaseType = (job.result?.analysis as Record<string, unknown> | undefined)?.inferred_case_type as string | undefined;
  const effectiveCaseType = job.claim_type || inferredCaseType || "";

  // Claimant name: user-provided → OCR-detected → empty
  const userClaimantName = job.input_data?.claimant_name as string | undefined;
  const ocrClaimantName = (job.result?.analysis as Record<string, unknown> | undefined)?.claimant_name as string | undefined;
  const displayClaimantName = userClaimantName || ocrClaimantName || "";

  // Claim ID: user-provided → fallback to job hash
  const userClaimId = job.input_data?.claim_id as string | undefined;
  const displayClaimId = userClaimId || `CLAIM #${job.job_id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="relative group">
      <Card
        className={cn(
          "bg-white border shadow-sm transition-all",
          !isProcessing && "hover:shadow-md cursor-pointer",
          isError && "border-red-200 bg-red-50/10"
        )}
        onClick={!isProcessing ? onClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              {/* Row 1: Claim ID + Status Badge */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs text-blue-600 font-medium">
                  {displayClaimId}
                </span>

                {/* Status Badge */}
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                  isProcessing && "bg-blue-100 text-blue-700",
                  isError && "bg-red-100 text-red-700",
                  isComplete && "bg-emerald-100 text-emerald-700"
                )}>
                  {isProcessing && <><Loader2 className="h-3 w-3 animate-spin" /> Processing</>}
                  {isError && "Error"}
                  {isComplete && "Complete"}
                </span>
              </div>

              {/* Row 2: Claimant Name + Case Type */}
              <p className="font-semibold text-slate-800 text-base">
                {displayClaimantName || (isClaims ? "Claims" : "Underwriting")}
                {effectiveCaseType ? ` • ${CASE_TYPE_LABELS[effectiveCaseType as keyof typeof CASE_TYPE_LABELS] || effectiveCaseType}` : ""}
                {job.error &&
                  <span className="text-xs font-normal text-red-500 ml-2">
                    — {job.error}
                  </span>
                }
              </p>

              {/* Row 3: Job ID */}
              <p className="text-sm text-slate-500 mt-0.5 font-mono">
                Job ID: {job.job_id}
              </p>

              {/* Row 4: Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Category Badge */}
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  isClaims
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-purple-50 text-purple-600 border border-purple-200"
                )}>
                  {isClaims ? "Claims" : "Underwriting"}
                </span>

                {/* Claim Type (user-provided or LLM-inferred) */}
                {effectiveCaseType && effectiveCaseType !== "UNKNOWN" && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                    {CASE_TYPE_LABELS[effectiveCaseType as keyof typeof CASE_TYPE_LABELS] || effectiveCaseType}
                  </span>
                )}

                {/* Pipeline */}
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs border border-teal-200">
                  {job.pipeline}
                </span>

                {/* Sharing badges */}
                {job.shared_by && (
                  <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-xs border border-violet-200 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Shared by {job.shared_by}
                  </span>
                )}
                {job.permission === "view" && job.shared_by && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    View only
                  </span>
                )}
                {job.permission === "edit" && job.shared_by && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-200 flex items-center gap-1">
                    <Pencil className="h-3 w-3" />
                    Can edit
                  </span>
                )}
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex gap-6 text-right flex-shrink-0 items-center">
              {/* Created Date */}
              {job.created_at && !isProcessing && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Created</p>
                  <p className="font-medium text-slate-700">{formatDate(job.created_at)}</p>
                </div>
              )}

              {/* Retry Button */}
              {isError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Add retry functionality
                  }}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </Button>
              )}

              {/* Share Button — visible to anyone with access */}
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {/* Delete Button — only for owners */}
              {(!job.permission || job.permission === "owner") && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Arrow */}
            {!isProcessing && !isError && (
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Page Component
export default function ArabicClaimsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const userId = user?.username;

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareJobId, setShareJobId] = useState<string | null>(null);
  const [shareJobPermission, setShareJobPermission] = useState<"owner" | "edit" | "view">("owner");

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [claimType, setClaimType] = useState("");
  const [claimId, setClaimId] = useState("");
  const [claimantName, setClaimantName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ClaimCategoryFilter>("all");
  const [claimTypeFilter, setClaimTypeFilter] = useState<string>("all");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Jobs Query with polling
  const jobsQuery = useQuery({
    queryKey: ["arabic-claims-jobs", userId],
    queryFn: () => listArabicClaimsJobs(undefined, userId),
    refetchInterval: 5000,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: () => uploadArabicClaim(selectedFiles, claimType, userId, claimId, claimantName),
    onSuccess: () => {
      setSelectedFiles([]);
      setClaimType("");
      setClaimId("");
      setClaimantName("");
      setShowUploadModal(false);
      void queryClient.invalidateQueries({
        queryKey: ["arabic-claims-jobs"],
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      console.log("Deleting job:", jobId);
      const result = await deleteArabicClaim(jobId, userId);
      console.log("Delete result:", result);
      return result;
    },
    onSuccess: async (_, jobId) => {
      console.log("Delete success for job:", jobId);
      setDeletingId(null);
      // Force refetch the jobs list
      await queryClient.refetchQueries({
        queryKey: ["arabic-claims-jobs"],
      });
      console.log("Refetch complete");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      setDeletingId(null);
      const message = error instanceof Error ? error.message : "Failed to delete";
      alert(message);
    },
  });

  // Computed values
  const allJobs = jobsQuery.data ?? [];

  const stats = {
    total: allJobs.length,
    processing: allJobs.filter(j => j.status === "running" || j.status === "queued").length,
    completed: allJobs.filter(j => j.status === "completed").length,
    failed: allJobs.filter(j => j.status === "failed").length,
  };

  // Filter cases based on all filters
  const filteredCases = allJobs.filter(job => {
    // Category filter (Claims/Underwriting)
    const jobCategory = (job.input_data?.category || "claims").toLowerCase();
    if (categoryFilter !== "all" && jobCategory !== categoryFilter) {
      return false;
    }

    // Claim Type filter — match against user-provided OR LLM-inferred case type
    if (claimTypeFilter !== "all") {
      const inferredType = (job.result?.analysis as Record<string, unknown> | undefined)?.inferred_case_type as string | undefined;
      const effective = job.claim_type || inferredType || "";
      if (effective !== claimTypeFilter) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const jobId = job.job_id.toLowerCase();
      return jobId.includes(search);
    }

    return true;
  });

  // Handlers
  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    try {
      await uploadMutation.mutateAsync();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload: ${message}`);
    }
  };

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleShare = useCallback((job: ArabicClaimsJobSummary) => {
    setShareJobId(job.job_id);
    setShareJobPermission((job.permission as "owner" | "edit" | "view") || "owner");
    setShareDialogOpen(true);
  }, []);

  const handleDelete = useCallback((jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      setDeletingId(jobId);
      deleteMutation.mutate(jobId);
    }
  }, [deleteMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type === "application/pdf" ||
      f.type.startsWith("image/")
    );
    if (files.length) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setClaimTypeFilter("all");
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
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
            onClick={() => navigate("/claims")}
            title="Claims"
          >
            <Receipt className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-blue-600 bg-blue-50"
            title="Claims (current)"
          >
            <FileText className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <img
                src="/olvo-logo.png"
                alt="Olvo"
                className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/flows")}
              />
              <div>
                <h1 className="text-lg font-bold text-slate-800">Olvo Claims Processing</h1>
                <p className="text-xs text-slate-500">Claim AI Dashboard</p>
              </div>
            </div>

            {/* Right Section */}
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
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">CLAIM WORKSPACE</p>
            <h2 className="text-xl font-bold text-slate-800">All Claims</h2>
            <p className="text-sm text-slate-500">Showing {filteredCases.length} of {stats.total} claims</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/arabic-claims/dashboard")}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            {stats.total > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 mr-2"
                onClick={() => {
                  // TODO: Download all functionality
                }}
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSelectedFiles([]);
                setClaimType("");
                setClaimId("");
                setClaimantName("");
                setShowUploadModal(true);
              }}
            >
              <Upload className="h-4 w-4" />
              New Claim
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            title="CLAIMS LOADED"
            value={stats.total}
            subtitle="Total claims processed"
          />
          <StatsCard
            title="PROCESSING"
            value={stats.processing}
            subtitle="Running or queued"
            variant="amber"
          />
          <StatsCard
            title="COMPLETED"
            value={stats.completed}
            subtitle="Successfully processed"
            variant="emerald"
          />
          <StatsCard
            title="FAILED"
            value={stats.failed}
            subtitle="Processing errors"
            variant="red"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <div className="w-72 flex-shrink-0">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">CLAIM WORKSPACE</p>
                    <h3 className="font-bold text-slate-800">Filter and prioritize cases</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 text-xs" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">SEARCH</label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Job ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CATEGORY</label>
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        variant={categoryFilter === "all" ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => setCategoryFilter("all")}
                      >
                        All categories
                      </Button>
                      <Button
                        variant={categoryFilter === "claims" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "justify-start",
                          categoryFilter === "claims" && "bg-blue-500 hover:bg-blue-600"
                        )}
                        onClick={() => setCategoryFilter("claims")}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Claims
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start opacity-40 cursor-not-allowed"
                        disabled
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Underwriting
                      </Button>
                    </div>
                  </div>

                  {/* Claim Type Filter */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CLAIM TYPE</label>
                    <select
                      className="w-full mt-2 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={claimTypeFilter}
                      onChange={(e) => setClaimTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {CASE_TYPES.map((ct) => (
                        <option key={ct} value={ct}>{CASE_TYPE_LABELS[ct]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Case List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing {filteredCases.length} of {stats.total} claims
              </p>
            </div>

            <div className="space-y-3">
              {jobsQuery.isLoading && (
                <Card className="bg-white border">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-4" />
                    <p className="text-slate-500">Loading claims...</p>
                  </CardContent>
                </Card>
              )}

              {jobsQuery.isError && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="py-12 text-center">
                    <p className="text-red-600">Failed to load claims: {String(jobsQuery.error)}</p>
                  </CardContent>
                </Card>
              )}

              {!jobsQuery.isLoading && filteredCases.length === 0 && (
                <Card className="bg-white border">
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No claims found</p>
                    {searchQuery && (
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your search filters</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {!jobsQuery.isLoading && filteredCases.map((job) => (
                <ClaimCard
                  key={job.job_id}
                  job={job}
                  formatDate={formatDate}
                  onClick={() => navigate(`/arabic-claims/${encodeURIComponent(job.job_id)}`)}
                  onDelete={() => handleDelete(job.job_id)}
                  onShare={() => handleShare(job)}
                  isDeleting={deletingId === job.job_id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {shareJobId && userId && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          jobId={shareJobId}
          currentUserId={userId}
          userPermission={shareJobPermission}
        />
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Claim</DialogTitle>
            <DialogDescription>Upload documents to process a new claim</DialogDescription>
          </DialogHeader>

          {/* Drag & Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-modal')?.click()}
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, TIFF</p>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-red-500 flex-shrink-0"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Claim Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Claim ID</label>
              <Input
                placeholder="e.g. CLM-2026-001 (optional)"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Claimant Name</label>
              <Input
                placeholder="e.g. Ahmad Hassan (auto-detected if empty)"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Claim Type (optional)</label>
              <select
                className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
              >
                <option value="">-- Select --</option>
                {CASE_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{CASE_TYPE_LABELS[ct]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Process Button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Process {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {/* Hidden File Input */}
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff"
            className="hidden"
            id="file-upload-modal"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files ?? []);
              setSelectedFiles(prev => [...prev, ...newFiles]);
              e.target.value = '';
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}