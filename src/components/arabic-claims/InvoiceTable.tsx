import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, categoryLabel } from "@/lib/invoiceUtils";
import type { InvoiceData } from "@/types/arabicClaims";

interface InvoiceTableProps {
  invoices: InvoiceData[];
  onPageClick?: (pageNumber: number) => void;
}

export function InvoiceTable({ invoices, onPageClick }: InvoiceTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No invoices detected in this claim.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {invoices.map((invoice, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {invoice.invoice_number
                  ? `Invoice ${invoice.invoice_number}`
                  : `Invoice (Page ${invoice.page_number})`}
              </CardTitle>
              <div className="flex items-center gap-2">
                {invoice.currency && invoice.total_charge != null && (
                  <Badge variant="secondary" className="text-sm font-mono">
                    Total: {formatCurrency(invoice.total_charge, invoice.currency)}
                  </Badge>
                )}
                {onPageClick && (
                  <button
                    onClick={() => onPageClick(invoice.page_number)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Page {invoice.page_number}
                  </button>
                )}
              </div>
            </div>
            {/* Invoice header info */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mt-1">
              {invoice.provider_name && <span>Provider: <span className="text-foreground">{invoice.provider_name}</span></span>}
              {invoice.patient_name && <span>Patient: <span className="text-foreground">{invoice.patient_name}</span></span>}
              {invoice.singular_data?.practitioner != null && (
                <span>Doctor: <span className="text-foreground">{`${invoice.singular_data.practitioner}`}</span></span>
              )}
              {invoice.singular_data?.admission_date != null && (
                <span>Admission: <span className="text-foreground">{`${invoice.singular_data.admission_date}`}</span></span>
              )}
              {invoice.singular_data?.discharge_date != null && (
                <span>Discharge: <span className="text-foreground">{`${invoice.singular_data.discharge_date}`}</span></span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {invoice.line_items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No line items extracted.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium w-10">#</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium text-right">Qty</th>
                      <th className="px-3 py-2 font-medium">Unit</th>
                      <th className="px-3 py-2 font-medium text-right">Unit Price</th>
                      <th className="px-3 py-2 font-medium text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.line_items.map((item, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-muted/50">
                        <td className="px-3 py-2 text-muted-foreground">{item.row_number}</td>
                        <td className="px-3 py-2 font-medium max-w-[300px]">{item.description || "-"}</td>
                        <td className="px-3 py-2">
                          {item.benefit_category ? (
                            <Badge variant="outline" className="text-xs">
                              {categoryLabel(item.benefit_category)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{item.quantity ?? "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.unit || "-"}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(item.unit_price, item.currency ?? invoice.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium">
                          {formatCurrency(item.total_price, item.currency ?? invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table footer with total */}
                  {invoice.total_charge != null && (
                    <tfoot className="bg-muted/50 font-medium">
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right">Grand Total</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(invoice.total_charge, invoice.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
            {invoice.summary && (
              <p className="text-xs text-muted-foreground mt-2">{invoice.summary}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
