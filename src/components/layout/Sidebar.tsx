import { cn } from "@/lib/utils";
import { ClipboardCheck, FileStack, FileText, LayoutGrid, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const location = useLocation();
    const pathname = location.pathname;

    const items = [
        {
            title: "Flows",
            href: "/flows",
            icon: LayoutGrid,
        },
        {
            title: "Claims",
            href: "/claims",
            icon: FileStack,
        },
        {
            title: "Arabic Claims",
            href: "/arabic-claims",
            icon: FileText,
        },
        {
            title: "Underwriting V2",
            href: "/underwriting",
            icon: ClipboardCheck,
        },
        {
            title: "AI Chat",
            href: "/chat",
            icon: MessageSquare,
        },
    ];

    return (
        <div className={cn("pb-12 w-64 border-r border-slate-200 min-h-[calc(100vh-4rem)] hidden md:block bg-white", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-slate-800">
                        Menu
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href === "/claims" && pathname.startsWith("/claims/")) ||
                                (item.href === "/arabic-claims" && pathname.startsWith("/arabic-claims/")) ||
                                (item.href === "/chat" && pathname.startsWith("/chat"));
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                    )}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}