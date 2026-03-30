import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet } from "lucide-react";

interface BordereauxTabProps {
    bordereauxId: string | null;
    onGenerate: () => void;
    isGenerating: boolean;
}

export function BordereauxTab({ bordereauxId, onGenerate, isGenerating }: BordereauxTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bordereaux Generation</CardTitle>
                <CardDescription>
                    Generate final bordereaux document with all underwriting decisions and premium calculations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!bordereauxId ? (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
                        <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="mb-4 text-center text-muted-foreground">
                            Ready to generate Bordereaux based on current analysis.
                        </p>
                        <Button onClick={onGenerate} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Bordereaux"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-4">
                            <div className="p-2 bg-green-100 rounded-full">
                                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-green-800">Bordereaux Generated Successfully</h4>
                                <p className="text-sm text-green-700">ID: {bordereauxId}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1 gap-2">
                                <Download className="h-4 w-4" />
                                Download Excel
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2">
                                <Download className="h-4 w-4" />
                                Download CSV
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
