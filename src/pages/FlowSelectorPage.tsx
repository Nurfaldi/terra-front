import { Link, useNavigate } from "react-router-dom";
import { FileStack, FileText, ShieldCheck } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FlowSelectorPage() {
  const navigate = useNavigate();

  return (
    <PageContainer showSidebar={false}>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Logo and Title */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/olvo-logo.png"
              alt="Olvo"
              className="h-12 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/flows")}
            />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Olvo Claims Processing
          </h1>
          <p className="text-slate-500">
            Choose a workflow. Claims, Arabic Claims, and Underwriting are isolated entry points.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FileStack className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-slate-800">Claims Flow</CardTitle>
              <CardDescription className="text-slate-500">
                New case intake, case list, status tracking, and claim detail review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/claims">Open Claims</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-slate-800">Arabic Claims</CardTitle>
              <CardDescription className="text-slate-500">
                Arabic medical document OCR, translation, and claim analysis pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/arabic-claims">Open Arabic Claims</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-slate-800">Underwriting Flow</CardTitle>
              <CardDescription className="text-slate-500">
                Existing underwriting V2 pipeline for SPAJ and medical analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
                <Link to="/underwriting">Open Underwriting</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}