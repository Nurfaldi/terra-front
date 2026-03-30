import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
    const { user, logout } = useAuth();
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6">
                {/* Logo and Title */}
                <div className="flex items-center gap-4">
                    <Link className="flex items-center gap-3" to="/flows">
                        <img
                            src="/olvo-logo.png"
                            alt="Olvo"
                            className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <div className="hidden md:block">
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">
                                Olvo Claims Processing
                            </h1>
                            <p className="text-xs text-slate-500 leading-tight">
                                Claim AI Dashboard
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Last Updated */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                        <span>Last updated:</span>
                        <span className="font-medium">{formatTime(lastUpdated)}</span>
                    </div>

                    {/* Language Toggle */}
                    <button className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                        <Globe className="w-3 h-3" />
                        ENGLISH
                    </button>

                    {/* User Badge */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <User className="h-4 w-4" />
                        <span>{user?.username}</span>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors h-9 w-9"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}