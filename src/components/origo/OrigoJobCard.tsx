import {
  ChevronRight,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrigoJobSummary } from "@/types/origo";

interface OrigoJobCardProps {
  job: OrigoJobSummary;
  formatDate: (date: string) => string;
  onClick: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function OrigoJobCard({ job, formatDate, onClick, onDelete, isDeleting }: OrigoJobCardProps) {
  const isProcessing = job.status === "running" || job.status === "queued";
  const isError = job.status === "failed";
  const isComplete = job.status === "completed";

  const overallStatus = job.result?.overall_status;
  const babyName = job.result?.baby_name;
  const totalPages = job.result?.total_pages;

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
              {/* Row 1: ID + Status Badge */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs text-blue-600 font-medium">
                  REG #{job.job_id.slice(0, 8).toUpperCase()}
                </span>

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

              {/* Row 2: Title */}
              <p className="font-semibold text-slate-800 text-base">
                {babyName || "Birth Registration"}
                {job.error && (
                  <span className="text-xs font-normal text-red-500 ml-2">
                    — {job.error}
                  </span>
                )}
              </p>

              {/* Row 3: Job ID */}
              <p className="text-sm text-slate-500 mt-0.5 font-mono">
                Job ID: {job.job_id}
              </p>

              {/* Row 4: Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Pipeline Badge */}
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs border border-teal-200">
                  {job.pipeline}
                </span>

                {/* Validation Status */}
                {isComplete && overallStatus === "pass" && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs border border-emerald-200">
                    Passed
                  </span>
                )}
                {isComplete && overallStatus === "fail" && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs border border-red-200">
                    Failed
                  </span>
                )}

                {/* Page Count */}
                {totalPages != null && totalPages > 0 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                    {totalPages} page{totalPages !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Right Side */}
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

              {/* Delete Button */}
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
}
