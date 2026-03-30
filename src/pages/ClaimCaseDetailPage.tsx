import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Loader2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteClaimCase,
  getClaimCase,
  getClaimCaseJson,
  reprocessClaimCase,
} from "@/lib/claimsApi";
import type { ClaimCaseStatus } from "@/types/claims";

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

export default function ClaimCaseDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams<{ caseId: string }>();
  const caseId = decodeURIComponent(params.caseId ?? "");

  const detailQuery = useQuery({
    queryKey: ["claim-case", caseId],
    queryFn: () => getClaimCase(caseId),
    enabled: Boolean(caseId),
    refetchInterval: 5000,
  });

  const reprocessMutation = useMutation({
    mutationFn: () => reprocessClaimCase(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claim-case", caseId] });
      void queryClient.invalidateQueries({ queryKey: ["claim-cases"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClaimCase(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claim-cases"] });
      navigate("/claims");
    },
  });

  const categories = useMemo(() => {
    const raw = detailQuery.data?.result && (detailQuery.data.result as Record<string, unknown>).categories;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    return Object.entries(raw as Record<string, string>);
  }, [detailQuery.data?.result]);

  const items = useMemo(() => {
    const raw = detailQuery.data?.result && (detailQuery.data.result as Record<string, unknown>).items;
    if (!Array.isArray(raw)) return [];
    return raw;
  }, [detailQuery.data?.result]);

  const handleDownloadJson = async () => {
    try {
      const payload = await getClaimCaseJson(caseId);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `${caseId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to download JSON: ${message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete case '${caseId}' and all its attempts?`)) return;
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete case: ${message}`);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-2 px-0">
              <Link to="/claims">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cases
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Case Detail: {caseId}</h1>
            <p className="text-muted-foreground">
              Review processing status, extraction output, and run history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void queryClient.invalidateQueries({ queryKey: ["claim-case", caseId] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              disabled={reprocessMutation.isPending}
              onClick={() => void reprocessMutation.mutateAsync()}
            >
              {reprocessMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Reprocess
            </Button>
            <Button variant="outline" onClick={() => void handleDownloadJson()}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {detailQuery.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading case detail...
          </div>
        )}

        {detailQuery.isError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Failed to load case detail: {String(detailQuery.error)}
          </div>
        )}

        {detailQuery.data && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Case Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Status</p>
                  <Badge className="mt-1" variant={badgeVariant(detailQuery.data.status)}>
                    {detailQuery.data.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Pages</p>
                  <p className="mt-1 text-sm">
                    {detailQuery.data.processed_pages ?? 0}/{detailQuery.data.total_pages ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Created At</p>
                  <p className="mt-1 text-sm">{formatDate(detailQuery.data.created_at)}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-xs uppercase text-muted-foreground">Source Files</p>
                  <p className="mt-1 text-sm">
                    {detailQuery.data.source_files.length
                      ? detailQuery.data.source_files.join(", ")
                      : "-"}
                  </p>
                </div>
                {detailQuery.data.error_message && (
                  <div className="md:col-span-3">
                    <p className="text-xs uppercase text-muted-foreground">Error</p>
                    <p className="mt-1 text-sm text-destructive">{detailQuery.data.error_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Attempt History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">Job ID</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Created</th>
                        <th className="px-3 py-2 font-medium">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailQuery.data.attempts.map((attempt) => (
                        <tr key={attempt.job_id} className="border-t">
                          <td className="px-3 py-2">{attempt.job_id}</td>
                          <td className="px-3 py-2">
                            <Badge variant={badgeVariant(attempt.status)}>{attempt.status}</Badge>
                          </td>
                          <td className="px-3 py-2">{formatDate(attempt.created_at)}</td>
                          <td className="px-3 py-2">{formatDate(attempt.completed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Categorization Result</CardTitle>
                <CardDescription>
                  Page-level categories from claim-processing pipeline output.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No category data available yet.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map(([pageId, category]) => (
                      <div key={pageId} className="rounded-md border bg-muted/20 px-3 py-2">
                        <p className="text-xs text-muted-foreground">{pageId}</p>
                        <p className="text-sm font-medium">{category}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Extracted Items</CardTitle>
                <CardDescription>
                  Consolidated table output generated by post-processing stages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No extracted item rows.</p>
                ) : (
                  <div className="max-h-80 overflow-auto rounded-md border p-3">
                    <pre className="text-xs">{JSON.stringify(items, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Raw JSON Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto rounded-md border bg-muted/20 p-3">
                  <pre className="text-xs">{JSON.stringify(detailQuery.data.result, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
