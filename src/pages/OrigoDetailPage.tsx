import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useOrigoJobFull, useOrigoRerun, useOrigoPatch } from "../hooks/useOrigoJob";
import {
  ORIGO_DOCUMENT_TYPE_LABELS,
  type OrigoPage,
  type OrigoValidationResult,
  type OrigoDocumentType,
} from "../types/origo";

export default function OrigoDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useOrigoJobFull(jobId);
  const rerunMutation = useOrigoRerun(jobId || "");
  const _patchMutation = useOrigoPatch(jobId || "");

  const [activeTab, setActiveTab] = useState<"documents" | "validation">("documents");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load job data</p>
      </div>
    );
  }

  const isProcessing = data.status === "queued" || data.status === "running";
  const selectedPage = data.pages.find((p) => p.page_id === selectedPageId) || data.pages[0];

  // Group pages by category
  const pagesByCategory: Record<string, OrigoPage[]> = {};
  for (const page of data.pages) {
    const cat = page.category || "unknown";
    if (!pagesByCategory[cat]) pagesByCategory[cat] = [];
    pagesByCategory[cat].push(page);
  }

  const passCount = data.validation_results.filter((r) => r.status === "pass").length;
  const failCount = data.validation_results.filter((r) => r.status === "fail").length;
  const warnCount = data.validation_results.filter((r) => r.status === "warning").length;

  const toggleRule = (ruleId: string) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/origo")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {data.baby_name || `Job ${jobId?.slice(0, 8)}`}
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{data.total_pages} pages</span>
              {data.father_name && <span>Ayah: {data.father_name}</span>}
              {data.mother_name && <span>Ibu: {data.mother_name}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="flex items-center gap-1 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </span>
          )}
          {data.overall_validation_status === "pass" && (
            <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
              <CheckCircle className="h-4 w-4" /> All Passed
            </span>
          )}
          {data.overall_validation_status === "fail" && (
            <span className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              <XCircle className="h-4 w-4" /> {failCount} Failed
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => rerunMutation.mutate(undefined)}
            disabled={rerunMutation.isPending || isProcessing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${rerunMutation.isPending ? "animate-spin" : ""}`} />
            Rerun
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-4">
          {(["documents", "validation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "documents" ? (
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Documents ({data.total_pages})
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4" /> Validation ({passCount}/{data.validation_results.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "documents" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar: doc groups + page list */}
            <div className="col-span-3 space-y-2">
              {Object.entries(pagesByCategory).map(([cat, pages]) => (
                <Card key={cat}>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      {ORIGO_DOCUMENT_TYPE_LABELS[cat as OrigoDocumentType] || cat}
                    </p>
                    {pages.map((page) => (
                      <button
                        key={page.page_id}
                        onClick={() => setSelectedPageId(page.page_id)}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                          selectedPage?.page_id === page.page_id
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>Page {page.page_number}</span>
                          {page.manually_reviewed && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                              Edited
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main: image + extracted data */}
            <div className="col-span-9 grid grid-cols-2 gap-6">
              {/* Image viewer */}
              <Card>
                <CardContent className="p-4">
                  {selectedPage?.image_url ? (
                    <img
                      src={selectedPage.image_url}
                      alt={`Page ${selectedPage.page_number}`}
                      className="w-full rounded border"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      No image available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extracted data */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Extracted Data
                    {selectedPage?.category && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({ORIGO_DOCUMENT_TYPE_LABELS[selectedPage.category as OrigoDocumentType] || selectedPage.category})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {selectedPage?.extraction ? (
                    <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
                      {Object.entries(selectedPage.extraction).map(([key, value]) => {
                        if (value === null || value === undefined) return null;
                        if (typeof value === "object" && !Array.isArray(value)) return null;
                        return (
                          <div key={key} className="flex justify-between items-start text-sm border-b pb-1">
                            <span className="text-gray-500 text-xs min-w-0 break-words">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="font-medium text-right ml-2 min-w-0 break-words">
                              {String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No data extracted</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "validation" && (
          <div className="space-y-4">
            {/* Summary banner */}
            {data.overall_validation_status === "pass" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">All Validation Rules Passed</p>
                  <p className="text-sm text-green-600">
                    No inconsistencies found across {data.total_pages} document pages.
                  </p>
                </div>
              </div>
            ) : data.overall_validation_status === "fail" ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">
                    {failCount} Validation Rule{failCount !== 1 ? "s" : ""} Failed
                  </p>
                  <p className="text-sm text-red-600">
                    Review inconsistencies below. {warnCount > 0 && `${warnCount} warning(s).`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                <p className="text-gray-600">Validation pending...</p>
              </div>
            )}

            {/* Validation rule cards */}
            <div className="space-y-2">
              {data.validation_results.map((vr: OrigoValidationResult) => (
                <Card key={vr.rule_id}>
                  <button
                    onClick={() => toggleRule(vr.rule_id)}
                    className="w-full text-left p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {vr.status === "pass" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : vr.status === "fail" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs">
                          !
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-sm">{vr.rule_name}</p>
                        <p className="text-xs text-gray-500">{vr.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {vr.reviewed && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            vr.llm_verdict === "pass"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          LLM: {vr.llm_verdict === "pass" ? "Resolved" : "Confirmed"}
                        </span>
                      )}
                      {expandedRules.has(vr.rule_id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedRules.has(vr.rule_id) && (
                    <CardContent className="pt-0 pb-4 px-4 border-t">
                      {/* Conflicting values table */}
                      {Object.keys(vr.conflicting_values).length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Conflicting Values:
                          </p>
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1 text-xs text-gray-500">Field</th>
                                <th className="text-left py-1 text-xs text-gray-500">Document</th>
                                <th className="text-left py-1 text-xs text-gray-500">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(vr.conflicting_values).map(([field, docs]) =>
                                Object.entries(docs as Record<string, string>).map(
                                  ([doc, value], i) => (
                                    <tr key={`${field}-${doc}`} className="border-b">
                                      {i === 0 && (
                                        <td
                                          className="py-1.5 text-xs text-gray-600"
                                          rowSpan={Object.keys(docs).length}
                                        >
                                          {field.replace(/_/g, " ")}
                                        </td>
                                      )}
                                      <td className="py-1.5 text-xs">{doc}</td>
                                      <td className="py-1.5 text-xs font-medium">{value}</td>
                                    </tr>
                                  )
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* LLM reasoning */}
                      {vr.llm_reasoning && (
                        <div className="mt-3 bg-gray-50 rounded p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">LLM Review:</p>
                          <p className="text-sm text-gray-700">{vr.llm_reasoning}</p>
                        </div>
                      )}

                      {/* View in document buttons */}
                      {vr.source_pages.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {vr.source_pages.map((pageRef) => (
                            <Button
                              key={pageRef}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const page = data.pages.find(
                                  (p) => p.page_id === pageRef || p.category === pageRef
                                );
                                if (page) {
                                  setSelectedPageId(page.page_id);
                                  setActiveTab("documents");
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View: {ORIGO_DOCUMENT_TYPE_LABELS[pageRef as OrigoDocumentType] || pageRef}
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
