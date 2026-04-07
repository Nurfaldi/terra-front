export function formatCurrency(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return "-";
  const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${formatted}` : formatted;
}

export function categoryLabel(cat: string | null | undefined): string {
  if (!cat) return "-";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
