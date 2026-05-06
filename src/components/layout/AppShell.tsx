import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
    Activity,
    ClipboardCheck,
    FileStack,
    FileText,
    LayoutGrid,
    LogOut,
    MessageSquare,
    User,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
    { label: "Flows", to: "/flows", icon: LayoutGrid },
    { label: "Health Underwriting", to: "/underwriting", icon: ClipboardCheck },
    { label: "Claims", to: "/claims", icon: FileStack },
    { label: "Arabic Claims", to: "/arabic-claims", icon: FileText },
    { label: "Origo", to: "/origo", icon: Activity },
    { label: "AI Chat", to: "/chat", icon: MessageSquare },
];

interface AppShellProps {
    title: string;
    eyebrow?: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function AppShell({ title, eyebrow, subtitle, actions, children }: AppShellProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
                <div className="flex h-16 items-center px-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-[hsl(var(--verified))]/15 ring-1 ring-[hsl(var(--verified))]/30">
                            <Activity className="h-4 w-4 text-[hsl(var(--verified))]" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-[13px] font-semibold tracking-tight">Terra</p>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">Underwriting</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-slim">
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Workspace
                    </p>
                    <ul className="space-y-0.5">
                        {NAV.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.to === "/flows"}
                                    className={({ isActive }) =>
                                        cn(
                                            "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition",
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span
                                                className={cn(
                                                    "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[hsl(var(--verified))] transition-opacity",
                                                    isActive ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                            <User className="h-4 w-4 text-white/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-white">
                                {user?.username || "Guest"}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">Underwriter</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Logout"
                            className="grid h-7 w-7 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="sr-only">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="min-w-0">
                        {eyebrow && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                {eyebrow}
                            </p>
                        )}
                        <h1 className="truncate text-[17px] font-semibold leading-tight text-foreground">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </header>
                <main className="flex-1 px-6 py-6">{children}</main>
            </div>
        </div>
    );
}
