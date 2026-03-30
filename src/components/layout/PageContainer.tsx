import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    showSidebar?: boolean;
}

export function PageContainer({ children, className, showSidebar = true }: PageContainerProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="flex flex-1 container max-w-screen-2xl mx-auto px-4 md:px-8 border-x border-border/40">
                {showSidebar && <Sidebar />}
                <main className={cn("flex-1 py-6 md:py-8 md:pl-8", className)}>
                    {children}
                </main>
            </div>
        </div>
    );
}
