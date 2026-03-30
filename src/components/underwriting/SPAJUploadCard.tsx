import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SPAJUploadCardProps {
    onUpload: (file: File) => Promise<any>;
    isLoading: boolean;
    status: "idle" | "success" | "error";
    onReset?: () => void;
}

export function SPAJUploadCard({ onUpload, isLoading, status, onReset }: SPAJUploadCardProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
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
                        SPAJ Extracted
                    </CardTitle>
                    <CardDescription>
                        The SPAJ document has been successfully processed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-background/50">
                        <FileText className="h-8 w-8 text-primary/50" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file?.name}</p>
                            <p className="text-xs text-muted-foreground">PDF Document</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    {onReset && (
                        <Button variant="outline" size="sm" onClick={() => {
                            setFile(null);
                            onReset();
                        }}>
                            Upload Different File
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>SPAJ Upload</CardTitle>
                <CardDescription>
                    Upload the SPAJ PDF document to extract applicant data.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center h-full min-h-[160px]",
                        isDragActive ? "border-primary bg-accent" : "border-border",
                        (isLoading) && "opacity-50 pointer-events-none"
                    )}
                >
                    <input {...getInputProps()} />
                    {file ? (
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="h-10 w-10 text-primary" />
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-10 w-10 mb-2" />
                            <p className="font-medium">Drag & drop or click to upload</p>
                            <p className="text-xs">PDF files only (max 10MB)</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 mt-4 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Extracting Data...
                        </>
                    ) : (
                        "Extract SPAJ Data"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
