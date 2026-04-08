import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import UnderwritingPage from "./pages/UnderwritingPage";
import FlowSelectorPage from "./pages/FlowSelectorPage";
import ClaimsCasesPage from "./pages/ClaimsCasesPage";
import ClaimCaseDetailPage from "./pages/ClaimCaseDetailPage";
import ArabicClaimsPage from "./pages/ArabicClaimsPage";
import ArabicClaimsDashboardPage from "./pages/ArabicClaimsDashboardPage";
import ArabicClaimDetailPage from "./pages/ArabicClaimDetailPage";
import ChatPage from "./pages/ChatPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/flows" replace />} />
              <Route path="/flows" element={<FlowSelectorPage />} />
              <Route path="/claims" element={<ClaimsCasesPage />} />
              <Route path="/claims/:caseId" element={<ClaimCaseDetailPage />} />
              <Route path="/arabic-claims" element={<ArabicClaimsPage />} />
              <Route path="/arabic-claims/dashboard" element={<ArabicClaimsDashboardPage />} />
              <Route path="/arabic-claims/:jobId" element={<ArabicClaimDetailPage />} />
              <Route path="/underwriting" element={<UnderwritingPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
