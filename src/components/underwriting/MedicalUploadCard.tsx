import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    Loader2,
    Lock,
    Plus,
    UploadCloud,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSize } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface MedicalUploadCardProps {
    onUpload: (files: File[]) => Promise<unknown>;
    isLoading: boolean;
    isEnabled: boolean;
    status: "idle" | "success" | "error";
    statusMessage?: string | null;
    onReset?: () => void;
}

export function MedicalUploadCard({
    onUpload,
    isLoading,
    isEnabled,
    status,
    statusMessage,
    onReset,
}: MedicalUploadCardProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((accepted: File[]) => {
        setFiles((prev) => [...prev, ...accepted]);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        disabled: !isEnabled || isLoading || status === "success",
    });

    const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

    const handleUpload = async () => {
        if (files.length === 0) return;
        try {
            await onUpload(files);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Upload failed";
            setError(message);
        }
    };

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

    return (
        <section
            className={cn(
                "flex h-full flex-col rounded-md border bg-card transition",
                !isEnabled ? "border-dashed border-border opacity-70" : "border-border"
            )}
        >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Step 2
                    </p>
                    <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">
                        Medical Documents
                    </h3>
                    <p className="text-[12px] text-muted-foreground">
                        Lab results, MMR, and clinical notes — multiple PDFs allowed.
                    </p>
                </div>
                {!isEnabled ? (
                    <span className="status-pill" data-tone="muted">
                        <Lock className="h-3 w-3" /> Awaiting SPAJ
                    </span>
                ) : status === "success" ? (
                    <span className="status-pill" data-tone="verified">
                        <CheckCircle2 className="h-3 w-3" /> Analyzed
                    </span>
                ) : isLoading ? (
                    <span className="status-pill" data-tone="pending">
                        <Loader2 className="h-3 w-3 animate-spin" /> Analyzing
                    </span>
                ) : status === "error" ? (
                    <span className="status-pill" data-tone="alert">
                        <AlertCircle className="h-3 w-3" /> Failed
                    </span>
                ) : (
                    <span className="status-pill" data-tone="muted">Ready</span>
                )}
            </header>

            <div className="flex flex-1 flex-col gap-3 p-5">
                {status === "success" ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-md border border-[hsl(var(--verified))]/35 bg-[hsl(var(--verified))]/5 p-3">
                            <div className="grid h-9 w-9 place-items-center rounded-md bg-[hsl(var(--verified))]/15">
                                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--verified))]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-foreground">
                                    {files.length} document{files.length === 1 ? "" : "s"} analyzed
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Risk assessment and synthesized insights ready
                                </p>
                            </div>
                        </div>
                        {files.length > 0 && (
                            <ul className="max-h-[140px] space-y-1 overflow-y-auto pr-1 scrollbar-slim">
                                {files.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2 rounded-sm bg-background/60 px-2 py-1.5 text-[12px]"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="truncate flex-1">{f.name}</span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums">
                                            {formatSize(f.size)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <>
                        <div
                            {...getRootProps()}
                            className={cn(
                                "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-7 text-center transition",
                                isDragActive
                                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                                    : "border-border bg-background/50 hover:border-[hsl(var(--primary))]/40 hover:bg-accent/40",
                                (!isEnabled || isLoading) && "pointer-events-none opacity-60"
                            )}
                        >
                            <input {...getInputProps()} />
                            <UploadCloud className="h-7 w-7 text-muted-foreground" />
                            <p className="mt-1.5 text-[13px] font-semibold text-foreground">
                                Drop medical PDFs
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                or click to browse — multiple PDFs supported
                            </p>
                        </div>

                        {files.length > 0 && (
                            <ul className="max-h-[140px] space-y-1 overflow-y-auto pr-1 scrollbar-slim">
                                {files.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2 rounded-md border border-border bg-background/50 px-2.5 py-1.5 text-[12px]"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                                        <span className="truncate flex-1">{f.name}</span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums">
                                            {formatSize(f.size)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}

                {(error || statusMessage) && status !== "success" && (
                    <div className="flex items-start gap-2 rounded-md border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-2.5 text-[12px] text-[hsl(var(--destructive))]">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{error || statusMessage}</span>
                    </div>
                )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-border bg-background/50 px-5 py-3">
                {status === "success" ? (
                    <>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                            {files.length} file{files.length === 1 ? "" : "s"} · {formatSize(totalBytes)}
                        </p>
                        {onReset && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFiles([]);
                                    onReset();
                                }}
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add more docs
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                            {files.length === 0
                                ? "No files queued"
                                : `${files.length} file${files.length === 1 ? "" : "s"} · ${formatSize(totalBytes)}`}
                        </p>
                        <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={files.length === 0 || isLoading || !isEnabled}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Analyzing…
                                </>
                            ) : (
                                "Analyze documents"
                            )}
                        </Button>
                    </>
                )}
            </footer>
        </section>
    );
}
