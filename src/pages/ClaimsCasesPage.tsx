import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, RefreshCw, RotateCcw, Search, Trash2, Upload } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteClaimCase,
  listClaimCases,
  reprocessClaimCase,
  uploadClaimCase,
} from "@/lib/claimsApi";
import type { ClaimCaseStatus, ClaimCaseSummary } from "@/types/claims";

const STATUS_OPTIONS = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "ERROR"] as const;

function badgeVariant(status: ClaimCaseStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "COMPLETED") return "default";
  if (status === "ERROR") return "destructive";
  if (status === "PROCESSING") return "secondary";
  return "outline";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ClaimsCasesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [caseIdInput, setCaseIdInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("ALL");

  const casesQuery = useQuery({
    queryKey: ["claim-cases", statusFilter],
    queryFn: () => listClaimCases(statusFilter === "ALL" ? undefined : statusFilter),
    refetchInterval: 5000,
  });

  const createCaseMutation = useMutation({
    mutationFn: async () => uploadClaimCase(selectedFiles, caseIdInput),
    onSuccess: () => {
      setCaseIdInput("");
      setSelectedFiles([]);
      void queryClient.invalidateQueries({ queryKey: ["claim-cases"] });
    },
  });

  const reprocessMutation = useMutation({
    mutationFn: (caseId: string) => reprocessClaimCase(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claim-cases"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (caseId: string) => deleteClaimCase(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claim-cases"] });
    },
  });

  const filteredCases = useMemo(() => {
    const allCases = casesQuery.data?.cases ?? [];
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return allCases;
    return allCases.filter((caseItem) => {
      return (
        caseItem.case_id.toLowerCase().includes(keyword) ||
        caseItem.job_id.toLowerCase().includes(keyword) ||
        caseItem.source_files.join(" ").toLowerCase().includes(keyword)
      );
    });
  }, [casesQuery.data?.cases, searchQuery]);

  const handleCreateCase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFiles.length) return;

    try {
      await createCaseMutation.mutateAsync();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload case: ${message}`);
    }
  };

  const handleReprocess = async (caseId: string) => {
    try {
      await reprocessMutation.mutateAsync(caseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to reprocess case '${caseId}': ${message}`);
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!window.confirm(`Delete all attempts for case '${caseId}'?`)) return;
    try {
      await deleteMutation.mutateAsync(caseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete case '${caseId}': ${message}`);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Claims Case Management</h1>
            <p className="text-muted-foreground">
              New case intake, processing status, and case detail review.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["claim-cases"] })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">New Case</CardTitle>
            <CardDescription>Upload claim documents to start processing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateCase}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="case-id">Case ID (Optional)</Label>
                  <Input
                    id="case-id"
                    placeholder="e.g. rs-jakarta-001"
                    value={caseIdInput}
                    onChange={(event) => setCaseIdInput(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claim-files">Files</Label>
                  <Input
                    id="claim-files"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                    onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!selectedFiles.length || createCaseMutation.isPending}>
                  {createCaseMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Start Case
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "No files selected"}
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Case List</CardTitle>
            <CardDescription>Track all claims pipeline runs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search case id, job id, file name"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number])
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {casesQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading cases...
              </div>
            )}

            {casesQuery.isError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                Failed to load cases: {String(casesQuery.error)}
              </div>
            )}

            {!casesQuery.isLoading && filteredCases.length === 0 && (
              <p className="text-sm text-muted-foreground">No cases found.</p>
            )}

            {filteredCases.length > 0 && (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium">Case ID</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Pages</th>
                      <th className="px-3 py-2 font-medium">Created</th>
                      <th className="px-3 py-2 font-medium">Source Files</th>
                      <th className="px-3 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((caseItem: ClaimCaseSummary) => (
                      <tr key={caseItem.case_id} className="border-t">
                        <td className="px-3 py-2 align-top">
                          <p className="font-medium">{caseItem.case_id}</p>
                          <p className="text-xs text-muted-foreground">Job: {caseItem.job_id}</p>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <Badge variant={badgeVariant(caseItem.status)}>{caseItem.status}</Badge>
                          {caseItem.error_message && (
                            <p className="mt-1 max-w-xs text-xs text-destructive">
                              {caseItem.error_message}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {caseItem.processed_pages ?? 0}/{caseItem.total_pages ?? 0}
                        </td>
                        <td className="px-3 py-2 align-top">{formatDate(caseItem.created_at)}</td>
                        <td className="px-3 py-2 align-top">{caseItem.source_files.join(", ") || "-"}</td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/claims/${encodeURIComponent(caseItem.case_id)}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={reprocessMutation.isPending}
                              onClick={() => void handleReprocess(caseItem.case_id)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reprocess
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() => void handleDelete(caseItem.case_id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
