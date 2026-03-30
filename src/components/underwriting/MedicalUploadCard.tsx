import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MedicalUploadCardProps {
    onUpload: (files: File[]) => Promise<any>;
    isLoading: boolean;
    isEnabled: boolean;
    status: "idle" | "success" | "error";
    onReset?: () => void;
}

export function MedicalUploadCard({ onUpload, isLoading, isEnabled, status, onReset }: MedicalUploadCardProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        disabled: !isEnabled || isLoading || status === "success",
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        try {
            await onUpload(files);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Upload failed");
        }
    };

    if (status === "success") {
        return (
            <Card className="border-green-500/50 bg-green-50/10 h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        Medical Analysis Complete
                    </CardTitle>
                    <CardDescription>
                        Medical documents have been analyzed and risk assessment generated.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 border rounded-md bg-background/50">
                                <FileText className="h-4 w-4 text-primary/50" />
                                <span className="text-sm truncate flex-1">{file.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    {onReset && (
                        <Button variant="outline" size="sm" onClick={() => {
                            setFiles([]);
                            onReset();
                        }}>
                            Analyze New Documents
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className={cn("h-full flex flex-col", !isEnabled && "opacity-50 grayscale")}>
            <CardHeader>
                <CardTitle>Medical Documents</CardTitle>
                <CardDescription>
                    Upload additional medical reports (lab results, history) for deeper analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center transition-colors flex flex-col items-center justify-center min-h-[120px]",
                        isDragActive ? "border-primary bg-accent" : "border-border",
                        !isEnabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-accent/50",
                        (isLoading) && "pointer-events-none"
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">Upload Medical PDFs</p>
                    <p className="text-xs text-muted-foreground">Multiple files allowed</p>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-accent/20 border text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="truncate max-w-[180px]">{file.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeFile(index)}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={files.length === 0 || isLoading || !isEnabled}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        "Analyze Documents"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
