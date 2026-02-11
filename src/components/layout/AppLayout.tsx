import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Download,
  ShoppingCart,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  Building2,
  FileDown,
  Menu,
  X,
} from "lucide-react";

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
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

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
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Skip link */}
        <a href="#main-content" className="skip-link">Skip to content</a>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 flex flex-col
            bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${sidebarCollapsed ? "w-[56px]" : "w-[220px]"}
          `}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <div className={`flex items-center h-14 px-3 ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sidebar-accent">
              <Package className="w-4 h-4 text-sidebar-foreground" />
            </div>
            {!sidebarCollapsed && <span className="text-sm font-semibold truncate">TechStock</span>}
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-2 space-y-0.5 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors
                  ${isActive
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }
                  ${sidebarCollapsed ? "justify-center" : ""}`
                }
                aria-label={item.label}
                end={item.to === "/"}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center h-10 mx-2 mb-2 rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="flex items-center h-14 px-4 gap-3 border-b border-border bg-background shrink-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <h4 className="font-semibold text-foreground">{pageTitle}</h4>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-muted-foreground text-sm w-64">
              <Search className="w-4 h-4 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, model, SKU or serial…"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground"
                aria-label="Global search"
              />
              <kbd className="hidden md:inline text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground">⌘K</kbd>
            </div>

            {/* Quick export */}
            <button
              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
              aria-label="Quick export"
            >
              <FileDown className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                aria-label="User menu"
              >
                AM
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-border bg-popover text-popover-foreground modal-shadow py-1 animate-fade-in">
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors">
                      <Building2 className="w-4 h-4" /> Switch Company
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Page content */}
          <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
