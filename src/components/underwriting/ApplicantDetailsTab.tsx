import type { SPAJData } from "@/types/underwriting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApplicantDetailsTabProps {
    data: SPAJData | null;
}

export function ApplicantDetailsTab({ data }: ApplicantDetailsTabProps) {
    if (!data) return null;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input value={data.personal_data.nama_lengkap} readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Gender</Label>
                            <Input value={data.personal_data.jenis_kelamin} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>Date of Birth</Label>
                            <Input value={data.personal_data.tanggal_lahir} readOnly />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Age</Label>
                            <Input value={data.personal_data.usia} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>Marital Status</Label>
                            <Input value={data.personal_data.status_perkawinan} readOnly />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>ID Number (KTP)</Label>
                        <Input value={data.personal_data.nomor_identitas} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>Occupation Risk Level</Label>
                        <Input value={data.personal_data.tingkat_risiko_pekerjaan} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>Annual Income</Label>
                        <Input value={data.personal_data.penghasilan_per_tahun} readOnly />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Height (cm)</Label>
                            <Input value={data.health_data.tinggi_badan_cm} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>Weight (kg)</Label>
                            <Input value={data.health_data.berat_badan_kg} readOnly />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>BMI</Label>
                            <Input value={data.health_data.bmi} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label>BMI Category</Label>
                            <Input value={data.health_data.bmi_category} readOnly />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Stated Health Status</Label>
                        <Input value={data.health_data.keadaan_sehat ? "Healthy" : "Not Healthy"} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>Has Disease History</Label>
                        <Input value={data.health_data.mengalami_penyakit ? "Yes" : "No"} readOnly />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
