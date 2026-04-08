import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Globe, LogOut, Loader2, AlertCircle, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/arabic-claims/StatsCard";
import { getAnalyticsDashboard } from "@/lib/arabicClaimsApi";
import { CASE_TYPE_LABELS } from "@/types/arabicClaims";
import type { AnalyticsDashboard } from "@/types/arabicClaims";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function ChartCard({ title, children, isEmpty }: { title: string; children: React.ReactNode; isEmpty?: boolean }) {
  return (
    <Card className="bg-white border">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[260px] text-sm text-slate-400">No data available</div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default function ArabicClaimsDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.username || "";

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currency, setCurrency] = useState<"USD" | "AED">("USD");

  const { data, isLoading, error } = useQuery<AnalyticsDashboard>({
    queryKey: ["arabic-claims-analytics", userId, currency, dateFrom, dateTo],
    queryFn: () => getAnalyticsDashboard(userId, currency, dateFrom || undefined, dateTo || undefined),
    enabled: !!userId,
  });

  const currentDateTime = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50">
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
                <h1 className="text-lg font-bold text-slate-800">Olvo Claims Processing</h1>
                <p className="text-xs text-slate-500">Claims Analytics Dashboard</p>
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
                onClick={() => { logout(); navigate("/login", { replace: true }); }}
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/arabic-claims")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">ANALYTICS</p>
              <h2 className="text-xl font-bold text-slate-800">Claims Analytics Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
              <Button
                variant={currency === "USD" ? "default" : "ghost"}
                size="sm"
                className={currency === "USD" ? "bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs" : "h-7 px-3 text-xs text-slate-600"}
                onClick={() => setCurrency("USD")}
              >
                USD
              </Button>
              <Button
                variant={currency === "AED" ? "default" : "ghost"}
                size="sm"
                className={currency === "AED" ? "bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs" : "h-7 px-3 text-xs text-slate-600"}
                onClick={() => setCurrency("AED")}
              >
                AED
              </Button>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">From</label>
              <Input
                type="date"
                className="w-40 h-9"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">To</label>
              <Input
                type="date"
                className="w-40 h-9"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-500">Loading analytics...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Failed to load analytics data. Please try again.</span>
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <>
            {/* Conversion Warnings */}
            {data.conversion_warnings.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-3 flex items-start gap-2 text-amber-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Currency conversion warnings</p>
                    {data.conversion_warnings.map((w, i) => (
                      <p key={i} className="text-amber-600">{w}</p>
                    ))}
                    <p className="text-xs text-amber-500 mt-1">Amounts without exchange rates are shown unconverted.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-5 gap-4">
              <StatsCard title="TOTAL CLAIMS" value={data.total_claims} subtitle="Claims processed" variant="blue" />
              <StatsCard title="PROVIDERS" value={data.total_providers} subtitle="Unique providers" />
              <StatsCard title="TOTAL AMOUNT" value={`${currency} ${formatAmount(data.total_invoice_amount)}`} subtitle={`Consolidated in ${currency}`} variant="emerald" />
              <StatsCard title="LINE ITEMS" value={data.total_line_items} subtitle="Total line items" />
              <StatsCard title="AVG READABILITY" value={data.average_readability.toFixed(2)} subtitle="Document quality" variant="amber" />
            </div>

            {/* Donut Charts Row */}
            <div className="grid grid-cols-2 gap-4">
              <ChartCard title="Claim Type Breakdown" isEmpty={data.claim_type_breakdown.length === 0}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.claim_type_breakdown.map(ct => ({
                        ...ct,
                        label: CASE_TYPE_LABELS[ct.claim_type as keyof typeof CASE_TYPE_LABELS] || ct.claim_type,
                      }))}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {data.claim_type_breakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title={`Currency Breakdown (in ${currency})`} isEmpty={data.currency_breakdown.length === 0}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.currency_breakdown}
                      dataKey="total_amount"
                      nameKey="currency"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {data.currency_breakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currency} ${formatAmount(value)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Bar Charts 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              <ChartCard title="Top ICD-10 by Count" isEmpty={data.top_icd_by_count.length === 0}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={data.top_icd_by_count} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis type="category" dataKey="code" width={80} tick={{ fill: "#334155", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, _name: string, props: { payload: { description: string } }) => [value, props.payload.description]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Provider by Count" isEmpty={data.top_providers_by_count.length === 0}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={data.top_providers_by_count} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis type="category" dataKey="provider_name" width={120} tick={{ fill: "#334155", fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="claim_count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Claims" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top ICD-10 by Amount" isEmpty={data.top_icd_by_amount.length === 0}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={data.top_icd_by_amount} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={formatAmount} />
                    <YAxis type="category" dataKey="code" width={80} tick={{ fill: "#334155", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, _name: string, props: { payload: { description: string } }) => [formatAmount(value), props.payload.description]}
                    />
                    <Bar dataKey="total_amount" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Provider by Amount" isEmpty={data.top_providers_by_amount.length === 0}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={data.top_providers_by_amount} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={formatAmount} />
                    <YAxis type="category" dataKey="provider_name" width={120} tick={{ fill: "#334155", fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => formatAmount(value)} />
                    <Bar dataKey="total_amount" fill="#10b981" radius={[0, 4, 4, 0]} name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Claims Over Time */}
            <ChartCard title="Claims Over Time" isEmpty={data.claims_over_time.length === 0}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.claims_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={formatAmount} />
                  <Tooltip formatter={(value: number, name: string) => [name === "Amount" ? formatAmount(value) : value, name]} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="claim_count" stroke="#3b82f6" strokeWidth={2} name="Claims" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="total_amount" stroke="#10b981" strokeWidth={2} name="Amount" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Summary Table */}
            <Card className="bg-white border">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Summary Table</h3>
                {data.claims_table.length === 0 ? (
                  <div className="text-sm text-slate-400 text-center py-8">No claims found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Claimant</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Category</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Provider(s)</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">ICD-10</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.claims_table.map((row) => (
                          <tr
                            key={row.job_id}
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                            onClick={() => navigate(`/arabic-claims/${row.job_id}`)}
                          >
                            <td className="py-2 px-3 text-slate-700">{row.claimant_name || "-"}</td>
                            <td className="py-2 px-3 text-slate-600">{row.category}</td>
                            <td className="py-2 px-3 text-slate-600">
                              {CASE_TYPE_LABELS[row.claim_type as keyof typeof CASE_TYPE_LABELS] || row.claim_type}
                            </td>
                            <td className="py-2 px-3 text-slate-600 max-w-[160px] truncate">
                              {row.provider_names.join(", ") || "-"}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {row.icd_codes.slice(0, 3).map(c => c.code).join(", ") || "-"}
                              {row.icd_codes.length > 3 && ` +${row.icd_codes.length - 3}`}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-700 font-medium">
                              {row.total_amount != null ? `${row.currency || ""} ${formatAmount(row.total_amount)}` : "-"}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                row.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                row.status === "failed" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-xs">
                              {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
