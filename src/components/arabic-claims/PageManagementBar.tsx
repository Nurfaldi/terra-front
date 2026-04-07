import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, RefreshCw, Upload, Undo2 } from "lucide-react";
import { addPages } from "@/lib/arabicClaimsApi";

interface PageManagementBarProps {
  jobId: string;
  userId?: string;
  pageCount: number;
  removedCount: number;
  hasPendingChanges: boolean;
  isReprocessing: boolean;
  extractionStatus: { pending: number; total: number } | null;
  onPagesAdded: () => void;
  onReprocessClick: () => void;
  onUndoAllRemovals: () => void;
}

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.tif,.tiff";

export function PageManagementBar({
  jobId,
  userId,
  pageCount,
  removedCount,
  hasPendingChanges,
  isReprocessing,
  extractionStatus,
  onPagesAdded,
  onReprocessClick,
  onUndoAllRemovals,
}: PageManagementBarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExtracting =
    extractionStatus !== null && extractionStatus.pending > 0;

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(
      (f) => f.type === "application/pdf" || f.type.startsWith("image/")
    );
    if (!validFiles.length) return;

    setIsUploading(true);
    try {
      await addPages(jobId, validFiles, userId);
      onPagesAdded();
    } catch (error) {
      console.error("Failed to add pages:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-2">
      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isReprocessing}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" />
          )}
          {isUploading ? "Uploading..." : "Add Pages"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileInput}
        />

        {removedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndoAllRemovals}
            disabled={isReprocessing}
            className="text-slate-500"
          >
            <Undo2 className="h-3.5 w-3.5 mr-1" />
            Restore {removedCount} removed
          </Button>
        )}

        <div className="flex-1" />

        {/* Extraction progress */}
        {isExtracting && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Extracting {extractionStatus.total - extractionStatus.pending}/
            {extractionStatus.total}
          </Badge>
        )}

        {/* Reprocess button */}
        {hasPendingChanges && !isExtracting && (
          <Button
            size="sm"
            onClick={onReprocessClick}
            disabled={isReprocessing || pageCount - removedCount === 0}
          >
            {isReprocessing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            {isReprocessing ? "Reprocessing..." : "Reprocess Case"}
          </Button>
        )}
      </div>

      {/* Drop zone (only visible when dragging) */}
      {isDragOver && (
        <div
          className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-blue-700">
            Drop files to add pages
          </p>
        </div>
      )}

      {/* Invisible drag target covering the bar area */}
      {!isDragOver && (
        <div
          className="absolute inset-0 pointer-events-none"
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
        />
      )}
    </div>
  );
}
