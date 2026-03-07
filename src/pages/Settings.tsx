import { useState, useEffect } from "react";
import { User, Building2, Bell, Shield, Database, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useImports } from "@/hooks/useImports";
import { useCompanySettings, useUpdateCompanyName } from "@/hooks/useCompanySettings";
import { useTeamMembers, useUpdateUserRole } from "@/hooks/useTeamMembers";
import { exportToCsv, exportToPdf } from "@/lib/exportCsv";
import { formatETB, formatDateTime } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { profile, role, user, signOut } = useAuth();
  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();
  const { data: imports = [] } = useImports();
  const { data: companySettings } = useCompanySettings();
  const updateCompanyName = useUpdateCompanyName();
  const { data: teamMembers = [] } = useTeamMembers();
  const updateUserRole = useUpdateUserRole();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [threshold, setThreshold] = useState(1);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);

  useEffect(() => {
    if (companySettings?.company_name) setCompanyName(companySettings.company_name);
  }, [companySettings?.company_name]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("user_id", user?.id || "");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Profile updated." });
    setSaving(false);
  };

  const handleSaveCompany = () => {
    if (!companySettings?.id) return;
    updateCompanyName.mutate({ id: companySettings.id, company_name: companyName });
  };

  const handleRoleChange = (userId: string, newRole: "owner" | "manager") => {
    updateUserRole.mutate({ user_id: userId, role: newRole });
  };

  const otherMembers = teamMembers.filter(m => m.user_id !== user?.id);

  const handleExportCsv = () => {
    const headers = ["Name", "Brand", "Category", "Stock", "Buying Price"];
    const rows = products.map(p => [p.name, p.brand, p.category, p.qty_in_stock, p.buying_price]);
    exportToCsv("all-data.csv", headers, rows);
    toast({ title: "Exported", description: "All data exported to CSV." });
  };

  const handleExportPdf = () => {
    const headers = ["Name", "Brand", "Category", "Stock", "Buying Price"];
    const rows = products.map(p => [p.name, p.brand, p.category, p.qty_in_stock, formatETB(Number(p.buying_price))]);
    exportToPdf("Inventory Report", headers, rows);
  };

  const handleMonthlyReport = () => {
    const headers = ["Date", "Item", "Qty", "Revenue", "Cost", "Profit", "Payment"];
    const rows = sales.map(s => [formatDateTime(s.date), s.product_name, s.qty, formatETB(Number(s.unit_selling_price) * s.qty), formatETB(Number(s.unit_buying_price) * s.qty), formatETB(Number(s.profit)), s.payment_method]);
    exportToPdf("Monthly Sales Report", headers, rows);
  };

  const handleQuarterlyReport = () => {
    const totalRevenue = sales.reduce((s, r) => s + Number(r.unit_selling_price) * r.qty, 0);
    const totalCost = sales.reduce((s, r) => s + Number(r.unit_buying_price) * r.qty, 0);
    const totalProfit = sales.reduce((s, r) => s + Number(r.profit), 0);
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Revenue", formatETB(totalRevenue)],
      ["Total Cost", formatETB(totalCost)],
      ["Total Profit", formatETB(totalProfit)],
      ["Total Items Sold", sales.reduce((s, r) => s + r.qty, 0)],
      ["Total Imports", imports.length],
      ["Current Stock Count", products.reduce((s, p) => s + p.qty_in_stock, 0)],
    ];
    exportToPdf("Quarterly Summary Report", headers, rows);
  };

  const sectionClass = "rounded-xl border border-border/80 bg-card p-6 card-shadow space-y-4";
  const labelClass = "text-[12px] font-medium text-muted-foreground mb-1.5 block";
  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[13px] focus:ring-2 focus:ring-ring/20 focus:border-ring outline-none transition-all";
  const disabledInputClass = "w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/40 text-[13px] text-muted-foreground";

  return (
    <div className="space-y-5 max-w-[800px] mx-auto animate-fade-in">
      {/* Profile */}
      <div className={sectionClass}>
        <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-[15px] tracking-[-0.01em]"><User className="w-4 h-4 text-muted-foreground" /> Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={profile?.email || ""} disabled className={disabledInputClass} />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input type="text" value={role ? role.charAt(0).toUpperCase() + role.slice(1) : "No role assigned"} disabled className={disabledInputClass} />
          </div>
          <div className="flex items-end">
            <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className={sectionClass}>
        <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-[15px] tracking-[-0.01em]"><Building2 className="w-4 h-4 text-muted-foreground" /> Company</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input type="text" defaultValue="ETB (Ethiopian Birr)" disabled className={disabledInputClass} />
          </div>
          <div className="flex items-end">
            <button onClick={handleSaveCompany} disabled={updateCompanyName.isPending} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
              {updateCompanyName.isPending ? "Saving…" : "Save Company"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={sectionClass}>
        <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-[15px] tracking-[-0.01em]"><Bell className="w-4 h-4 text-muted-foreground" /> Notifications & Alerts</h3>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
          <div>
            <div className="text-[13px] font-medium text-foreground">Low Stock Alerts</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Notify when stock drops below threshold</div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12px] text-muted-foreground">Threshold:</label>
            <input type="number" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value) || 3)} className="w-16 px-2.5 py-1.5 rounded-lg border border-border bg-background text-[13px] text-center focus:ring-2 focus:ring-ring/20 outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className={sectionClass}>
        <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-[15px] tracking-[-0.01em]"><Shield className="w-4 h-4 text-muted-foreground" /> Roles & Permissions</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="font-medium text-[13px]">Owner</span>
            <span className="text-[12px] text-muted-foreground">Full access — import, sell, edit, delete, manage team</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="font-medium text-[13px]">Manager</span>
            <span className="text-[12px] text-muted-foreground">Can import & view products — no selling, editing, or deleting</span>
          </div>
        </div>
      </div>

      {/* Team */}
      {role === "owner" && (
        <div className={sectionClass}>
          <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-[15px] tracking-[-0.01em]"><Users className="w-4 h-4 text-muted-foreground" /> Team Members</h3>
          {otherMembers.length === 0 ? (
            <p className="text-[13px] text-muted-foreground py-2">No other team members yet.</p>
          ) : (
            <div className="space-y-2">
              {otherMembers.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between p-4 rounded-lg border border-border/80 bg-muted/20">
                  <div className="min-w-0">
                    <div className="font-medium text-[13px] text-foreground truncate">{m.full_name || "Unnamed"}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{m.email}</div>
                  </div>
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.user_id, e.target.value as "owner" | "manager")}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-[13px] text-foreground ml-3 shrink-0"
                  >
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data */}
      <div className={sectionClass}>
        <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-[15px] tracking-[-0.01em]"><Database className="w-4 h-4 text-muted-foreground" /> Data & Export</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportCsv} className="px-4 py-2.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">Export All Data (CSV)</button>
          <button onClick={handleExportPdf} className="px-4 py-2.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">Export All Data (PDF)</button>
          <button onClick={handleMonthlyReport} className="px-4 py-2.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">Monthly Report</button>
          <button onClick={handleQuarterlyReport} className="px-4 py-2.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">Quarterly Report</button>
        </div>
      </div>

      <div className="flex justify-end pb-4">
        <button onClick={signOut} className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all">Log Out</button>
      </div>
    </div>
  );
}
