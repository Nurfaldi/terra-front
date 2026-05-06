import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type StatTone = "default" | "verified" | "pending" | "alert" | "primary";

interface StatCardProps {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    tone?: StatTone;
    icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({ label, value, sub, tone = "default", icon: Icon }: StatCardProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col rounded-md border bg-card px-4 py-3.5 transition",
                tone === "default" && "border-border",
                tone === "primary" && "border-[hsl(var(--primary))]/30",
                tone === "verified" && "border-[hsl(var(--verified))]/40",
                tone === "pending" && "border-[hsl(var(--pending))]/45",
                tone === "alert" && "border-[hsl(var(--destructive))]/40"
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="kpi-label">{label}</p>
                {Icon && (
                    <Icon
                        className={cn(
                            "h-3.5 w-3.5",
                            tone === "verified" && "text-[hsl(var(--verified))]",
                            tone === "pending" && "text-[hsl(38_92%_32%)]",
                            tone === "alert" && "text-[hsl(var(--destructive))]",
                            tone === "primary" && "text-[hsl(var(--primary))]",
                            tone === "default" && "text-muted-foreground"
                        )}
                    />
                )}
            </div>
            <p
                className={cn(
                    "kpi-value mt-1.5",
                    tone === "verified" && "text-[hsl(var(--verified))]",
                    tone === "pending" && "text-[hsl(38_92%_28%)]",
                    tone === "alert" && "text-[hsl(var(--destructive))]"
                )}
            >
                {value}
            </p>
            {sub && (
                <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{sub}</p>
            )}
        </div>
    );
}

export function StatusPill({
    tone = "muted",
    children,
}: {
    tone?: "verified" | "pending" | "alert" | "muted";
    children: ReactNode;
}) {
    return (
        <span className="status-pill" data-tone={tone}>
            {children}
        </span>
    );
}
