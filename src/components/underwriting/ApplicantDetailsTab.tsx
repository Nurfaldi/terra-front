import type { SPAJExtractionResult } from "@/types/underwriting";
import { DataField, DataSection } from "./DataField";
import { StatusPill } from "./StatCard";

interface ApplicantDetailsTabProps {
    data: SPAJExtractionResult | null;
}

export function ApplicantDetailsTab({ data }: ApplicantDetailsTabProps) {
    if (!data) return null;

    const p = data.personal_data;
    const h = data.health_data;
    const dp = data.data_peserta;
    const dk = data.data_kesehatan;

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <DataSection title="Personal" eyebrow="Applicant">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DataField label="Full Name" value={p?.nama_lengkap} className="col-span-2" />
                    <DataField label="Gender" value={p?.jenis_kelamin} />
                    <DataField label="Age" value={p?.usia} mono />
                    <DataField label="Date of Birth" value={p?.tanggal_lahir} mono />
                    <DataField label="Place of Birth" value={p?.tempat_lahir} />
                    <DataField label="ID Number" value={p?.nomor_identitas} mono />
                    <DataField label="Marital Status" value={p?.status_perkawinan} />
                    <DataField label="Citizenship" value={p?.warga_negara} />
                    <DataField
                        label="Occupation Risk"
                        value={p?.tingkat_risiko_pekerjaan ? `Class ${p.tingkat_risiko_pekerjaan}` : undefined}
                    />
                    <DataField label="Occupation" value={p?.pekerjaan} className="col-span-2" />
                    <DataField label="Company" value={p?.nama_perusahaan} />
                    <DataField label="Industry" value={p?.jenis_usaha} />
                    <DataField label="Annual Income" value={p?.penghasilan_per_tahun} mono />
                    <DataField label="Source of Funds" value={p?.sumber_dana} />
                </div>
            </DataSection>

            <DataSection title="Health" eyebrow="Self-declared">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DataField label="Height" value={h?.tinggi_badan_cm ? `${h.tinggi_badan_cm} cm` : undefined} mono />
                    <DataField label="Weight" value={h?.berat_badan_kg ? `${h.berat_badan_kg} kg` : undefined} mono />
                    <DataField label="BMI" value={h?.bmi?.toFixed?.(1) ?? h?.bmi} mono />
                    <DataField label="BMI Category" value={h?.bmi_category} />
                    <div className="col-span-2 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Stated Health
                        </span>
                        {h?.keadaan_sehat ? (
                            <StatusPill tone="verified">Healthy</StatusPill>
                        ) : (
                            <StatusPill tone="pending">Issues reported</StatusPill>
                        )}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Disease History
                        </span>
                        {h?.mengalami_penyakit ? (
                            <StatusPill tone="alert">Yes</StatusPill>
                        ) : (
                            <StatusPill tone="muted">None</StatusPill>
                        )}
                    </div>
                    {h?.detail_kondisi_saat_ini && (
                        <DataField
                            label="Current Condition"
                            value={h.detail_kondisi_saat_ini}
                            className="col-span-2"
                        />
                    )}
                    {h?.riwayat_penyakit && h.riwayat_penyakit.length > 0 && (
                        <div className="col-span-2 space-y-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Disease History
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {h.riwayat_penyakit.map((d, i) => (
                                    <StatusPill key={i} tone="pending">
                                        {d}
                                    </StatusPill>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DataSection>

            {dp && (
                <DataSection title="Data Peserta" eyebrow="Nested SPAJ">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <DataField label="Nama Lengkap" value={dp.nama_lengkap} className="col-span-2" />
                        <DataField label="Identitas" value={`${dp.bukti_identitas ?? ""} ${dp.nomor_bukti_identitas ?? ""}`.trim()} />
                        <DataField label="Status" value={dp.status_perkawinan} />
                        <DataField label="No. HP" value={dp.no_handphone} mono />
                        <DataField label="Email" value={dp.alamat_email} />
                        <DataField label="Sumber Dana" value={dp.sumber_dana} />
                        <DataField label="Tujuan Asuransi" value={dp.tujuan_asuransi} />
                        {dp.alamat_rumah && (
                            <DataField
                                label="Alamat"
                                value={`${dp.alamat_rumah.alamat ?? ""} ${dp.alamat_rumah.kode_pos ?? ""}`.trim() || undefined}
                                className="col-span-2"
                            />
                        )}
                        {dp.pekerjaan && (
                            <>
                                <DataField label="Jabatan" value={dp.pekerjaan.jabatan} />
                                <DataField label="Bagian" value={dp.pekerjaan.bagian} />
                                <DataField label="Perusahaan" value={dp.pekerjaan.perusahaan} className="col-span-2" />
                                <DataField label="Jenis Usaha" value={dp.pekerjaan.jenis_usaha} />
                                <DataField
                                    label="Risiko"
                                    value={dp.pekerjaan.tingkat_risiko_pekerjaan}
                                    mono
                                />
                            </>
                        )}
                        {dp.penghasilan && (
                            <>
                                <DataField label="Penghasilan/tahun" value={dp.penghasilan.penghasilan_per_tahun} />
                                <DataField label="Sumber" value={dp.penghasilan.sumber} />
                            </>
                        )}
                    </div>
                </DataSection>
            )}

            {dk && (
                <DataSection title="Data Kesehatan" eyebrow="Nested SPAJ">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <DataField
                            label="Berat Badan"
                            value={dk.berat_badan_kg ? `${dk.berat_badan_kg} kg` : undefined}
                            mono
                        />
                        <DataField
                            label="Tinggi Badan"
                            value={dk.tinggi_badan_cm ? `${dk.tinggi_badan_cm} cm` : undefined}
                            mono
                        />
                        <div className="col-span-2 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Perubahan BB (12 bln)
                            </span>
                            {dk.perubahan_berat_badan?.berubah_dalam_12_bulan_terakhir ? (
                                <StatusPill tone="pending">Berubah</StatusPill>
                            ) : (
                                <StatusPill tone="muted">Stabil</StatusPill>
                            )}
                        </div>
                        {dk.perubahan_berat_badan?.penjelasan && (
                            <DataField
                                label="Penjelasan"
                                value={dk.perubahan_berat_badan.penjelasan}
                                className="col-span-2"
                            />
                        )}
                        <div className="col-span-2 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Pemeriksaan Medis
                            </span>
                            {dk.riwayat_pemeriksaan_medis?.pernah_melakukan_pemeriksaan ? (
                                <StatusPill tone="pending">Pernah</StatusPill>
                            ) : (
                                <StatusPill tone="muted">Belum</StatusPill>
                            )}
                        </div>
                        {dk.riwayat_pemeriksaan_medis?.penjelasan && (
                            <DataField
                                label="Detail Pemeriksaan"
                                value={dk.riwayat_pemeriksaan_medis.penjelasan}
                                className="col-span-2"
                            />
                        )}
                        {dk.detail_penyakit && dk.detail_penyakit.length > 0 && (
                            <div className="col-span-2 space-y-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Penyakit Dilaporkan
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {dk.detail_penyakit.map((d, i) => (
                                        <StatusPill key={i} tone="pending">
                                            {d}
                                        </StatusPill>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DataSection>
            )}
        </div>
    );
}
