import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, Receipt } from "lucide-react";
import type { PageData, InvoiceData } from "@/types/arabicClaims";

interface PageViewerProps {
  page: PageData;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PageViewer({ page, isSelected, onClick }: PageViewerProps) {
  const getReadabilityColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Good";
    if (score >= 5) return "Review Needed";
    return "Illegible";
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Page {page.page_number}
          </CardTitle>
          <div className="flex items-center gap-2">
            {page.is_invoice && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                <Receipt className="h-3 w-3 mr-1" />
                Invoice
              </Badge>
            )}
            {page.has_ambiguity && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Inferred
              </Badge>
            )}
            <Badge variant="outline" className={getReadabilityColor(page.readability_score)}>
              {page.readability_score.toFixed(1)}/10 -{" "}
              {getReadabilityLabel(page.readability_score)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Original Text</p>
          <div className="bg-slate-50 p-2 rounded text-sm max-h-24 overflow-hidden" dir="rtl">
            {page.original_text.slice(0, 200)}
            {page.original_text.length > 200 && "..."}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Medical Translation</p>
          <div className="bg-blue-50 p-2 rounded text-sm max-h-24 overflow-hidden">
            {page.medical_translation.slice(0, 200)}
            {page.medical_translation.length > 200 && "..."}
          </div>
        </div>
        {page.key_medical_terms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {page.key_medical_terms.slice(0, 5).map((term, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {term}
              </Badge>
            ))}
            {page.key_medical_terms.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{page.key_medical_terms.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return "-";
  const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${formatted}` : formatted;
}

function categoryLabel(cat: string | null | undefined): string {
  if (!cat) return "-";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface PageDetailViewProps {
  page: PageData;
  invoice?: InvoiceData | null;
  onChange?: (updates: Partial<PageData>) => void;
}

export function PageDetailView({ page, invoice, onChange }: PageDetailViewProps) {
  const updateField = (updates: Partial<PageData>) => {
    onChange?.(updates);
  };

  const removeKeyMedicalTerm = (index: number) => {
    const next = page.key_medical_terms.filter((_, i) => i !== index);
    updateField({ key_medical_terms: next });
  };

  const addKeyMedicalTerm = () => {
    const value = window.prompt("Add key medical term");
    if (!value?.trim()) return;
    updateField({ key_medical_terms: [...page.key_medical_terms, value.trim()] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Page {page.page_number} Details</h3>
        <div className="flex gap-2">
          {page.has_ambiguity && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Contains Inferred Text
            </Badge>
          )}
        </div>
      </div>

      {/* Readability */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Readability Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-blue-600">
              {page.readability_score.toFixed(1)}
              <span className="text-sm text-slate-400">/10</span>
            </div>
            {page.readability_notes && (
              <p className="text-sm text-slate-600">{page.readability_notes}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Translation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Medical Translation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-48 overflow-y-auto">
            <div
              className="p-3 bg-blue-50 rounded whitespace-pre-wrap"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateField({ medical_translation: e.currentTarget.innerText })}
            >
              {page.medical_translation}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inferred Text */}
      {page.inferred_text && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Inferred Text (Ambiguous Sections)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-3 bg-amber-50 rounded whitespace-pre-wrap"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateField({ inferred_text: e.currentTarget.innerText || null })
              }
            >
              {page.inferred_text}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Medical Terms */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Key Medical Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {page.key_medical_terms.map((term, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1">
                <span>{term}</span>
                <button
                  type="button"
                  className="ml-1 text-xs leading-none opacity-70 hover:opacity-100"
                  onClick={() => removeKeyMedicalTerm(i)}
                  aria-label={`Remove ${term}`}
                >
                  x
                </button>
              </Badge>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            onClick={addKeyMedicalTerm}
          >
            + Add term
          </button>
        </CardContent>
      </Card>

      {/* Invoice Extraction */}
      {invoice && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Invoice Extraction
                {invoice.invoice_number && (
                  <span className="font-normal text-muted-foreground">
                    #{invoice.invoice_number}
                  </span>
                )}
              </CardTitle>
              {invoice.total_charge != null && (
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(invoice.total_charge, invoice.currency)}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              {invoice.provider_name && <span>Provider: <span className="text-foreground">{invoice.provider_name}</span></span>}
              {invoice.patient_name && <span>Patient: <span className="text-foreground">{invoice.patient_name}</span></span>}
              {invoice.singular_data?.practitioner != null && (
                <span>Doctor: <span className="text-foreground">{`${invoice.singular_data.practitioner}`}</span></span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {invoice.line_items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1.5 font-medium w-8">#</th>
                      <th className="px-2 py-1.5 font-medium">Description</th>
                      <th className="px-2 py-1.5 font-medium">Category</th>
                      <th className="px-2 py-1.5 font-medium text-right">Qty</th>
                      <th className="px-2 py-1.5 font-medium text-right">Unit Price</th>
                      <th className="px-2 py-1.5 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.line_items.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="px-2 py-1.5 text-muted-foreground">{item.row_number}</td>
                        <td className="px-2 py-1.5 max-w-[250px]">{item.description || "-"}</td>
                        <td className="px-2 py-1.5">
                          {item.benefit_category ? (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {categoryLabel(item.benefit_category)}
                            </Badge>
                          ) : "-"}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono">{item.quantity ?? "-"}</td>
                        <td className="px-2 py-1.5 text-right font-mono">
                          {formatCurrency(item.unit_price, item.currency ?? invoice.currency)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono font-medium">
                          {formatCurrency(item.total_price, item.currency ?? invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {invoice.total_charge != null && (
                    <tfoot className="bg-muted/50 font-medium text-xs">
                      <tr>
                        <td colSpan={5} className="px-2 py-1.5 text-right">Total</td>
                        <td className="px-2 py-1.5 text-right font-mono">
                          {formatCurrency(invoice.total_charge, invoice.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No line items extracted.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
