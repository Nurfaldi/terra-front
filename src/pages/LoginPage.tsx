import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Hardcoded login for demo purposes
        if (username === "rey_user1" && password === "2345") {
            // Simulating token
            login(username, "mock-token-" + Date.now());
            navigate("/flows");
        } else {
            setError("Invalid credentials (try: rey_user1 / 2345)");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                <div className="bg-white border text-slate-800 shadow-sm rounded-lg">
                    {/* Header */}
                    <div className="text-center pb-6 pt-8 px-6">
                        {/* Logo */}
                        <div className="flex justify-center mb-4">
                            <img
                                src="/olvo-logo.png"
                                alt="Olvo"
                                className="h-12 object-contain"
                            />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">
                            Olvo Claims Processing
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Sign in to Claim AI Dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <div className="px-6 pb-8">
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Error Alert */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Username Field */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-slate-700 text-sm font-medium block">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="pl-9 w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-slate-700 text-sm font-medium block">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="pl-9 pr-9 w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors mt-2 h-10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    © 2026 Arabic Claims POC - Claim AI Dashboard
                </p>
            </div>
        </div>
    );
}