import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DataFieldProps {
    label: string;
    value?: ReactNode;
    mono?: boolean;
    className?: string;
}

export function DataField({ label, value, mono, className }: DataFieldProps) {
    const display =
        value === undefined || value === null || value === "" ? (
            <span className="text-muted-foreground/60">—</span>
        ) : (
            value
        );

    return (
        <div className={cn("flex flex-col gap-1 min-w-0", className)}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </span>
            <span
                className={cn(
                    "truncate text-[13px] text-foreground",
                    mono && "font-mono tabular-nums"
                )}
                title={typeof display === "string" ? display : undefined}
            >
                {display}
            </span>
        </div>
    );
}

interface DataSectionProps {
    title: string;
    eyebrow?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
}

export function DataSection({ title, eyebrow, children, className, actions }: DataSectionProps) {
    return (
        <section className={cn("rounded-md border border-border bg-card", className)}>
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                <div>
                    {eyebrow && (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {eyebrow}
                        </p>
                    )}
                    <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
                </div>
                {actions}
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}
