import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "complete" | "active" | "pending";

export interface Step {
    id: string;
    label: string;
    description?: string;
    state: StepState;
}

interface StepperProps {
    steps: Step[];
    onStepClick?: (id: string) => void;
}

export function Stepper({ steps, onStepClick }: StepperProps) {
    return (
        <ol className="flex items-stretch w-full overflow-hidden rounded-md border border-border bg-card">
            {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                const clickable = !!onStepClick && step.state !== "pending";
                return (
                    <li key={step.id} className="relative flex flex-1 min-w-0">
                        <button
                            type="button"
                            disabled={!clickable}
                            aria-current={step.state === "active" ? "step" : undefined}
                            onClick={() => onStepClick?.(step.id)}
                            className={cn(
                                "flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition",
                                clickable ? "cursor-pointer hover:bg-accent/40" : "cursor-default",
                                step.state === "active" && "bg-accent/30"
                            )}
                        >
                            <span
                                className={cn(
                                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold ring-1 transition",
                                    step.state === "complete" &&
                                        "bg-[hsl(var(--verified))] text-[hsl(var(--verified-foreground))] ring-[hsl(var(--verified))]",
                                    step.state === "active" &&
                                        "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ring-[hsl(var(--primary))]",
                                    step.state === "pending" &&
                                        "bg-background text-muted-foreground ring-border"
                                )}
                            >
                                {step.state === "complete" ? (
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                ) : (
                                    idx + 1
                                )}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span
                                    className={cn(
                                        "block truncate text-[13px] font-semibold",
                                        step.state === "pending"
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                                {step.description && (
                                    <span className="block truncate text-[11px] text-muted-foreground">
                                        {step.description}
                                    </span>
                                )}
                            </span>
                        </button>
                        {!isLast && (
                            <span
                                aria-hidden
                                className="pointer-events-none absolute right-0 top-0 h-full w-px bg-border"
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
