import { useState } from "react";
import { User, Building2, Bell, Shield, Database } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useImports } from "@/hooks/useImports";
import { exportToCsv, exportToPdf } from "@/lib/exportCsv";
import { formatETB, formatDateTime } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { profile, role, signOut } = useAuth();
  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();
  const { data: imports = [] } = useImports();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [threshold, setThreshold] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Profile updated." });
    setSaving(false);
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Brand", "Category", "Stock", "Buying Price"];
    const rows = products.map(p => [p.name, p.brand, p.category, p.qty_in_stock, p.buying_price]);
    exportToCsv("all-data.csv", headers, rows);
    toast({ title: "Exported", description: "All data exported to CSV." });
  };

  const handleExportPdf = () => {
    const headers = ["Name", "Brand", "Category", "Stock", "Buying Price"];
    const rows = products.map(p => [p.name, p.brand, p.category, p.qty_in_stock, formatETB(Number(p.buying_price))]);
    exportToPdf("TechStock Inventory Report", headers, rows);
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

  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
            <input type="email" value={profile?.email || ""} disabled className="w-full px-3 py-1.5 rounded-md border border-border bg-accent text-sm text-muted-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
            <input type="text" value={role ? role.charAt(0).toUpperCase() + role.slice(1) : "No role assigned"} disabled className="w-full px-3 py-1.5 rounded-md border border-border bg-accent text-sm text-muted-foreground" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Company</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
            <input type="text" defaultValue="TechStock ET" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
            <input type="text" defaultValue="ETB (Ethiopian Birr)" disabled className="w-full px-3 py-1.5 rounded-md border border-border bg-accent text-sm text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications & Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Low Stock Alerts</div>
              <div className="text-xs text-muted-foreground">Notify when stock drops below threshold</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Threshold:</label>
              <input type="number" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value) || 3)} className="w-16 px-2 py-1 rounded-md border border-border bg-background text-sm text-center" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Roles & Permissions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
            <span className="font-medium">Owner</span>
            <span className="text-xs text-muted-foreground">Full access — import, sell, void, adjust, delete</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
            <span className="font-medium">Manager</span>
            <span className="text-xs text-muted-foreground">Add & import products — no selling, no editing</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Database className="w-5 h-5" /> Data & Export</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportCsv} className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Export All Data (CSV)</button>
          <button onClick={handleExportPdf} className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Export All Data (PDF)</button>
          <button onClick={handleMonthlyReport} className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Monthly Report</button>
          <button onClick={handleQuarterlyReport} className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Quarterly Report</button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={signOut} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">Log Out</button>
      </div>
    </div>
  );
}
