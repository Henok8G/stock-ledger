import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import {
  LayoutDashboard, Package, Download, History, Settings, StickyNote,
  ChevronLeft, ChevronRight, Search, Moon, Sun, LogOut, Menu, X, Bell,
} from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";
import { requestNotificationPermission, useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface LayoutContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be within AppLayout");
  return ctx;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/imported", label: "Imported", icon: Download },
  { to: "/history", label: "History", icon: History },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const { data: companySettings } = useCompanySettings();
  const companyName = companySettings?.company_name || "TechStock";
  const isOwner = role === "owner";

  useEffect(() => {
    if (!isOwner) return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      setShowNotifDialog(true);
    }
  }, [isOwner]);

  const handleAllowNotifications = async () => {
    setShowNotifDialog(false);
    await requestNotificationPermission();
  };

  useBrowserNotifications(isOwner);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);
  const toggleDarkMode = useCallback(() => {
    setDarkMode((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const pageTitle = navItems.find((n) => n.to === location.pathname)?.label ?? "Dashboard";

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode }}>
      <AlertDialog open={showNotifDialog} onOpenChange={setShowNotifDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-center">Enable Notifications</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Get instant alerts when new products are added or imports are recorded — even when the app is in the background.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={handleAllowNotifications}>Allow notifications</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex h-screen overflow-hidden bg-background">
        <a href="#main-content" className="skip-link">Skip to content</a>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
        )}

        <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "w-[56px]" : "w-[216px]"}`}>
          <div className={`flex items-center h-[52px] px-3 border-b border-sidebar-border/40 ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-accent">
              <Package className="w-4 h-4 text-sidebar-foreground" />
            </div>
            {!sidebarCollapsed && <span className="text-[13px] font-semibold truncate tracking-[-0.01em]">{companyName}</span>}
          </div>

          <nav className="flex-1 py-3 space-y-0.5 px-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${isActive ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"} ${sidebarCollapsed ? "justify-center" : ""}`}
                end={item.to === "/"}>
                <item.icon className="w-[16px] h-[16px] shrink-0 opacity-80" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <button onClick={toggleSidebar} className="hidden lg:flex items-center justify-center h-9 mx-2 mb-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center h-[52px] px-4 gap-3 border-b border-border/80 bg-background/80 glass-header shrink-0 sticky top-0 z-30">
            <button onClick={() => setMobileOpen((o) => !o)} className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <h4 className="font-semibold text-foreground text-[15px] tracking-[-0.01em]">{pageTitle}</h4>
            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-2 px-3 py-[6px] rounded-lg bg-accent/50 text-muted-foreground text-[13px] w-52 overflow-hidden border border-border/40">
              <Search className="w-3.5 h-3.5 shrink-0 opacity-40" />
              <input type="text" placeholder="Search…" className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/40 text-foreground truncate" />
            </div>

            <button onClick={toggleDarkMode} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {role === "owner" && <NotificationBell />}

            <div className="relative">
              <button onClick={() => setUserMenuOpen((o) => !o)} className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold tracking-wide hover:opacity-90 transition-opacity">
                {(profile?.full_name || "U").slice(0, 2).toUpperCase()}
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-popover text-popover-foreground modal-shadow py-1.5 animate-scale-in">
                    <button onClick={() => { setUserMenuOpen(false); signOut(); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-destructive hover:bg-accent rounded-lg mx-0.5 transition-colors" style={{ width: "calc(100% - 4px)" }}>
                      <LogOut className="w-3.5 h-3.5" /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
