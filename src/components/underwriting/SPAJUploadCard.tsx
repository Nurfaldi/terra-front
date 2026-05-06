import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    Loader2,
    RefreshCcw,
    UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSize } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface SPAJUploadCardProps {
    onUpload: (file: File) => Promise<unknown>;
    isLoading: boolean;
    status: "idle" | "success" | "error";
    statusMessage?: string | null;
    onReset?: () => void;
}

export function SPAJUploadCard({
    onUpload,
    isLoading,
    status,
    statusMessage,
    onReset,
}: SPAJUploadCardProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted.length > 0) {
            setFile(accepted[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        disabled: isLoading || status === "success",
    });

    const handleUpload = async () => {
        if (!file) return;
        try {
            await onUpload(file);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Upload failed";
            setError(message);
        }
    };

    return (
        <section className="flex h-full flex-col rounded-md border border-border bg-card">
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Step 1
                    </p>
                    <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">
                        SPAJ Document
                    </h3>
                    <p className="text-[12px] text-muted-foreground">
                        Upload the SPAJ PDF to extract applicant, insurance, and health data.
                    </p>
                </div>
                {status === "success" ? (
                    <span className="status-pill" data-tone="verified">
                        <CheckCircle2 className="h-3 w-3" /> Extracted
                    </span>
                ) : isLoading ? (
                    <span className="status-pill" data-tone="pending">
                        <Loader2 className="h-3 w-3 animate-spin" /> Processing
                    </span>
                ) : status === "error" ? (
                    <span className="status-pill" data-tone="alert">
                        <AlertCircle className="h-3 w-3" /> Failed
                    </span>
                ) : (
                    <span className="status-pill" data-tone="muted">
                        Awaiting file
                    </span>
                )}
            </header>

            <div className="flex flex-1 flex-col gap-3 p-5">
                {status === "success" ? (
                    <div className="flex items-center gap-3 rounded-md border border-[hsl(var(--verified))]/35 bg-[hsl(var(--verified))]/5 p-3">
                        <div className="grid h-9 w-9 place-items-center rounded-md bg-[hsl(var(--verified))]/15">
                            <FileText className="h-4 w-4 text-[hsl(var(--verified))]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-foreground">
                                {file?.name || "SPAJ document"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Extraction complete — applicant data ready
                            </p>
                        </div>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "flex flex-1 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition",
                            isDragActive
                                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                                : "border-border bg-background/50 hover:border-[hsl(var(--primary))]/40 hover:bg-accent/40",
                            isLoading && "pointer-events-none opacity-60"
                        )}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center gap-1.5 px-4 py-6">
                                <FileText className="h-8 w-8 text-[hsl(var(--primary))]" />
                                <p className="text-[13px] font-medium text-foreground">
                                    {file.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground tabular-nums">
                                    {formatSize(file.size)}
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Drop a different PDF to replace
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 px-4 py-8">
                                <UploadCloud className="h-9 w-9 text-muted-foreground" />
                                <p className="text-[13px] font-semibold text-foreground">
                                    Drop SPAJ PDF here
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    or click to browse — PDF only, single file
                                </p>
                            </div>
                        )}
                    </div>
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
                        <p className="text-[11px] text-muted-foreground">Extraction locked.</p>
                        {onReset && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFile(null);
                                    onReset();
                                }}
                            >
                                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Replace SPAJ
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-[11px] text-muted-foreground">
                            {file ? "Ready to extract" : "Pick a PDF to continue"}
                        </p>
                        <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={!file || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Extracting…
                                </>
                            ) : (
                                "Extract SPAJ data"
                            )}
                        </Button>
                    </>
                )}
            </footer>
        </section>
    );
}
