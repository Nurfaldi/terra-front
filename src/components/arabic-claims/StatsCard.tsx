import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-white border",
  amber: "bg-amber-50 border-amber-200",
  blue: "bg-blue-50 border-blue-200",
  emerald: "bg-emerald-50 border-emerald-200",
  red: "bg-red-50 border-red-200",
};

const textClasses = {
  default: { label: "text-slate-500", value: "text-slate-800", subtitle: "text-slate-500" },
  amber: { label: "text-amber-600", value: "text-amber-700", subtitle: "text-amber-600" },
  blue: { label: "text-blue-600", value: "text-blue-700", subtitle: "text-blue-600" },
  emerald: { label: "text-emerald-600", value: "text-emerald-700", subtitle: "text-emerald-600" },
  red: { label: "text-red-600", value: "text-red-700", subtitle: "text-red-600" },
};

export function StatsCard({
  title,
  value,
  subtitle,
  variant = "default",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  variant?: "default" | "amber" | "blue" | "emerald" | "red";
}) {
  const styles = textClasses[variant];

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-4">
        <p className={cn("text-xs uppercase tracking-wider font-medium", styles.label)}>{title}</p>
        <p className={cn("text-3xl font-bold mt-1", styles.value)}>{value}</p>
        <p className={cn("text-sm", styles.subtitle)}>{subtitle}</p>
      </CardContent>
    </Card>
  );
}
