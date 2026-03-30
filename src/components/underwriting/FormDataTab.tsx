import type { SPAJData } from "@/types/underwriting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormDataTabProps {
    data: SPAJData | null;
}

export function FormDataTab({ data }: FormDataTabProps) {
    if (!data) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No SPAJ data available. Please upload a SPAJ document first.
            </div>
        );
    }

    const creditAmount = data.insurance_data.jumlah_kredit ?? 0;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Insurance Policy Data</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Credit Type</Label>
                            <Input value={data.insurance_data.jenis_kredit} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>Credit Amount</Label>
                            <Input value={creditAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>Duration (Years)</Label>
                            <Input value={data.insurance_data.masa_asuransi_tahun} readOnly />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input value={data.insurance_data.tanggal_mulai} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Input value={data.insurance_data.tanggal_berakhir} readOnly />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Raw Data (JSON)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs font-mono">
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {data.data_quality_notes.length > 0 && (
                    <Card className="border-yellow-500/50 bg-yellow-50/10">
                        <CardHeader>
                            <CardTitle className="text-yellow-600 text-lg">Data Quality Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {data.data_quality_notes.map((note, i) => (
                                    <li key={i}>{note}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
