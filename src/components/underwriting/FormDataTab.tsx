import type { SPAJExtractionResult } from "@/types/underwriting";
import { DataField, DataSection } from "./DataField";
import { AlertTriangle } from "lucide-react";

interface FormDataTabProps {
    data: SPAJExtractionResult | null;
}

const idr = (n?: number) =>
    typeof n === "number"
        ? n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
        : undefined;

export function FormDataTab({ data }: FormDataTabProps) {
    if (!data) {
        return (
            <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No SPAJ data available — upload a SPAJ document to begin.
            </div>
        );
    }

    const ins = data.insurance_data;
    const da = data.data_asuransi;

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
                <DataSection title="Insurance Policy" eyebrow="Core fields">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
                        <DataField label="Credit Type" value={ins?.jenis_kredit} />
                        <DataField label="Credit Amount" value={idr(ins?.jumlah_kredit)} mono />
                        <DataField label="Term (years)" value={ins?.masa_asuransi_tahun} mono />
                        <DataField label="Term (months)" value={ins?.masa_asuransi_bulan} mono />
                        <DataField label="Start Date" value={ins?.tanggal_mulai} mono />
                        <DataField label="End Date" value={ins?.tanggal_berakhir} mono />
                        <DataField label="Bank" value={ins?.nama_bank} />
                        <DataField label="Branch" value={ins?.cabang_bank} />
                    </div>
                </DataSection>

                {da && (
                    <DataSection title="Data Asuransi" eyebrow="Nested SPAJ">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
                            <DataField label="Jenis Kredit" value={da.jenis_kredit} />
                            <DataField label="Jumlah Kredit" value={idr(da.jumlah_kredit)} mono />
                            <DataField label="Bunga" value={da.bunga} />
                            <DataField label="Cara Pembayaran" value={da.cara_pembayaran} />
                            <DataField
                                label="Masa Asuransi"
                                value={
                                    da.masa_asuransi
                                        ? `${da.masa_asuransi.tahun ?? "-"}y ${da.masa_asuransi.bulan ?? 0}m`
                                        : undefined
                                }
                                mono
                            />
                            <DataField
                                label="Periode"
                                value={
                                    da.periode_asuransi
                                        ? `${da.periode_asuransi.mulai ?? "-"} → ${da.periode_asuransi.berakhir ?? "-"}`
                                        : undefined
                                }
                                mono
                            />
                            <DataField
                                label="Premi Ditagih"
                                value={
                                    da.premi_ditagih_ke
                                        ? `${da.premi_ditagih_ke.bank ?? ""} ${da.premi_ditagih_ke.cabang ?? ""}`.trim() || undefined
                                        : undefined
                                }
                            />
                            <DataField
                                label="Penerima Manfaat"
                                value={
                                    da.penerima_manfaat_asuransi
                                        ? `${da.penerima_manfaat_asuransi.bank ?? ""} ${da.penerima_manfaat_asuransi.cabang ?? ""}`.trim() ||
                                          undefined
                                        : undefined
                                }
                            />
                        </div>
                    </DataSection>
                )}
            </div>

            <div className="space-y-4">
                <DataSection title="Quality Notes" eyebrow="Extraction">
                    {data.data_quality_notes && data.data_quality_notes.length > 0 ? (
                        <ul className="space-y-2">
                            {data.data_quality_notes.map((note, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 rounded-md border border-[hsl(var(--pending))]/40 bg-[hsl(var(--pending))]/5 px-3 py-2 text-[12px] text-[hsl(38_92%_28%)]"
                                >
                                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[12px] text-muted-foreground">No quality issues flagged.</p>
                    )}
                </DataSection>

                {typeof data.extraction_confidence === "number" && (
                    <DataSection title="Extraction Confidence">
                        <div className="flex items-end justify-between">
                            <p className="kpi-value">
                                {(data.extraction_confidence * 100).toFixed(0)}%
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                                Agent self-rated
                            </span>
                        </div>
                    </DataSection>
                )}
            </div>
        </div>
    );
}
