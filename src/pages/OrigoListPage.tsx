import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, Clock, Search, Globe, LogOut,
  LayoutGrid, FileText, Shield,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/arabic-claims/StatsCard";
import { OrigoJobCard } from "@/components/origo/OrigoJobCard";
import { UploadDialog } from "@/components/origo/UploadDialog";
import { useOrigoJobs, useOrigoDelete } from "@/hooks/useOrigoJob";

export default function OrigoListPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Data
  const { data: jobs, isLoading, isError, error } = useOrigoJobs();
  const deleteMutation = useOrigoDelete();

  const allJobs = jobs ?? [];

  const stats = {
    total: allJobs.length,
    processing: allJobs.filter(j => j.status === "running" || j.status === "queued").length,
    completed: allJobs.filter(j => j.status === "completed").length,
    failed: allJobs.filter(j => j.status === "failed").length,
  };

  // Filter
  const filteredJobs = allJobs.filter(job => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const jobId = job.job_id.toLowerCase();
      const babyName = (job.result?.baby_name || "").toLowerCase();
      return jobId.includes(search) || babyName.includes(search);
    }
    return true;
  });

  // Handlers
  const handleDelete = useCallback((jobId: string) => {
    if (confirm("Are you sure you want to delete this registration?")) {
      setDeletingId(jobId);
      deleteMutation.mutate(jobId, {
        onSuccess: () => setDeletingId(null),
        onError: () => {
          setDeletingId(null);
          alert("Failed to delete registration");
        },
      });
    }
  }, [deleteMutation]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const currentDateTime = new Date().toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Auto-hide Left Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40 group">
        <div className="absolute left-0 top-0 h-full w-4 z-10" />
        <div className="absolute left-0 top-0 h-full w-16 bg-white border-r border-slate-200 shadow-sm
                      transform -translate-x-12 group-hover:translate-x-0 transition-transform duration-200 ease-in-out
                      flex flex-col items-center py-4 gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/flows")}
            title="Back to Flows"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <div className="w-8 h-px bg-slate-200 my-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/arabic-claims")}
            title="Arabic Claims"
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-blue-600 bg-blue-50"
            title="Origo (current)"
          >
            <Shield className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/olvo-logo.png"
                alt="Olvo"
                className="h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/flows")}
              />
              <div>
                <h1 className="text-lg font-bold text-slate-800">Olvo Document Processing</h1>
                <p className="text-xs text-slate-500">Origo Birth Registration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Last updated <span className="font-semibold text-slate-700">{currentDateTime}</span>
              </span>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                ENGLISH
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut className="h-4 w-4" />
                LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">ORIGO WORKSPACE</p>
            <h2 className="text-xl font-bold text-slate-800">Birth Registrations</h2>
            <p className="text-sm text-slate-500">Showing {filteredJobs.length} of {stats.total} registrations</p>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            New Registration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            title="REGISTRATIONS LOADED"
            value={stats.total}
            subtitle="Total documents processed"
          />
          <StatsCard
            title="PROCESSING"
            value={stats.processing}
            subtitle="Running or queued"
            variant="amber"
          />
          <StatsCard
            title="VALIDATED"
            value={stats.completed}
            subtitle="Successfully validated"
            variant="emerald"
          />
          <StatsCard
            title="FAILED"
            value={stats.failed}
            subtitle="Processing errors"
            variant="red"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <div className="w-72 flex-shrink-0">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">ORIGO WORKSPACE</p>
                    <h3 className="font-bold text-slate-800">Filter registrations</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 text-xs" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">SEARCH</label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Job ID or baby name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Accepted Documents Info */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">ACCEPTED DOCUMENTS</label>
                    <div className="mt-2 space-y-1">
                      {[
                        "Surat Keterangan Lahir",
                        "KTP Ayah / Ibu",
                        "Kartu Keluarga",
                        "Buku Nikah",
                        "F-1.01 Biodata",
                        "F-2.01 Pencatatan Sipil",
                      ].map((doc) => (
                        <p key={doc} className="text-xs text-slate-500">{doc}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing {filteredJobs.length} of {stats.total} registrations
              </p>
            </div>

            <div className="space-y-3">
              {isLoading && (
                <Card className="bg-white border">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-4" />
                    <p className="text-slate-500">Loading registrations...</p>
                  </CardContent>
                </Card>
              )}

              {isError && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="py-12 text-center">
                    <p className="text-red-600">Failed to load registrations: {String(error)}</p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && filteredJobs.length === 0 && (
                <Card className="bg-white border">
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No registrations found</p>
                    {searchQuery && (
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your search</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {!isLoading && filteredJobs.map((job) => (
                <OrigoJobCard
                  key={job.job_id}
                  job={job}
                  formatDate={formatDate}
                  onClick={() => navigate(`/origo/${encodeURIComponent(job.job_id)}`)}
                  onDelete={() => handleDelete(job.job_id)}
                  isDeleting={deletingId === job.job_id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  );
}
