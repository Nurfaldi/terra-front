import type { MedicalAnalysisResult } from "@/types/underwriting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LabResultsTabProps {
    data: MedicalAnalysisResult | null;
}

export function LabResultsTab({ data }: LabResultsTabProps) {
    if (!data) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No medical analysis results available.
            </div>
        );
    }

    if (data.lab_results.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No lab results extracted from documents.
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Laboratory Results</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Test Name</th>
                                <th className="px-4 py-3 font-medium">Result</th>
                                <th className="px-4 py-3 font-medium">Unit</th>
                                <th className="px-4 py-3 font-medium">Ref. Range</th>
                                <th className="px-4 py-3 font-medium">Interpretation</th>
                                <th className="px-4 py-3 font-medium">Significance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.lab_results.map((item, index) => (
                                <tr key={index} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{item.test_name}</td>
                                    <td className="px-4 py-3 font-mono">{item.result}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.reference_range}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={item.interpretation === "Normal" ? "outline" : "destructive"}
                                            className={item.interpretation === "Normal" ? "bg-green-500/10 text-green-700 border-green-200" : ""}
                                        >
                                            {item.interpretation}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={item.clinical_significance}>
                                        {item.clinical_significance}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
