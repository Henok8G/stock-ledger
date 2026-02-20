import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Imported from "./pages/Imported";
import Sales from "./pages/Sales";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import NotesPage from "./pages/Notes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading, role, roleLoading, approved } = useAuth();

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user || !role || !approved) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/imported" element={<Imported />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
