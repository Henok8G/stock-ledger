import { useState } from "react";
import {
  Package, ShoppingCart, Download, TrendingUp,
  Plus, FileDown, Pencil, StickyNote,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useImports } from "@/hooks/useImports";
import { useNotes } from "@/hooks/useNotes";
import { formatETB, formatDateTime } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import AddImportModal from "@/components/shared/AddImportModal";
import { useNavigate } from "react-router-dom";
import { exportToCsv } from "@/lib/exportCsv";
import type { SaleRecord } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const PIE_COLORS = [
  "hsl(222, 84%, 11%)", "hsl(210, 92%, 45%)", "hsl(152, 56%, 38%)",
  "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 50%)",
  "hsl(180, 60%, 40%)", "hsl(320, 60%, 50%)",
];

export default function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();
  const { data: imports = [] } = useImports();
  const { data: notes = [] } = useNotes();
  const [drawerSale, setDrawerSale] = useState<SaleRecord | null>(null);
  const [showAddImport, setShowAddImport] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();

  const totalSold = sales.reduce((s, r) => s + r.qty, 0);
  const totalImported = imports.reduce((s, r) => s + r.import_line_items.reduce((a, l) => a + l.qty, 0), 0);
  const totalProfit = sales.reduce((s, r) => s + Number(r.profit), 0);
  const activeProducts = products.filter((p) => p.qty_in_stock > 0).length;

  const kpis = [
    { label: "Active Products", value: activeProducts, icon: Package, format: (v: number) => v.toLocaleString(), accent: "text-primary", bg: "bg-primary/8" },
    { label: "Items Sold", value: totalSold, icon: ShoppingCart, format: (v: number) => v.toLocaleString(), accent: "text-info", bg: "bg-info/8" },
    { label: "Items Imported", value: totalImported, icon: Download, format: (v: number) => v.toLocaleString(), accent: "text-warning", bg: "bg-warning/8" },
    { label: "Total Profit", value: totalProfit, icon: TrendingUp, format: (v: number) => formatETB(v), accent: "text-success", bg: "bg-success/8" },
  ];

  const soldByCategory = sales.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.qty;
    return acc;
  }, {} as Record<string, number>);
  const unitsSoldByCategory = Object.entries(soldByCategory).map(([category, units]) => ({ category, units }));

  const stockByCat = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.qty_in_stock;
    return acc;
  }, {} as Record<string, number>);
  const stockByCategory = Object.entries(stockByCat).map(([name, value], i) => ({
    name, value, color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const handleExportCsv = () => {
    const headers = ["Name", "Brand", "Category", "Stock", "Buying Price"];
    const rows = products.map(p => [p.name, p.brand, p.category, p.qty_in_stock, p.buying_price]);
    exportToCsv("inventory-export.csv", headers, rows);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border/80 bg-card p-4 card-shadow hover:card-shadow-hover transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em]">{kpi.label}</span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.accent}`}>
                <kpi.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[22px] font-bold text-foreground tracking-tight tabular-nums">{kpi.format(kpi.value)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6 min-w-0">
          {unitsSoldByCategory.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-card p-5 card-shadow">
              <h4 className="font-semibold text-foreground mb-4 text-[14px] tracking-[-0.01em]">Units Sold by Category</h4>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitsSoldByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="units" fill="hsl(var(--chart-1))" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border/80 bg-card card-shadow overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border/80">
              <h4 className="font-semibold text-foreground text-[14px] tracking-[-0.01em]">Recently Sold Items</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Item</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Qty</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Selling</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Profit</th>
                    <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 8).map((sale) => (
                    <tr key={sale.id} onClick={() => setDrawerSale(sale)} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" role="button">
                      <td className="px-5 py-3 font-medium text-foreground">{sale.product_name}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{sale.qty}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatETB(Number(sale.unit_selling_price) * sale.qty)}</td>
                      <td className="px-5 py-3 text-right font-medium text-success tabular-nums">{formatETB(Number(sale.profit))}</td>
                      <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDateTime(sale.date)}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-[13px]">No sales recorded yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {sales.length > 0 && (
              <div className="px-5 py-3 border-t border-border/80 bg-muted/25 flex flex-wrap gap-6 text-[13px]">
                <div>
                  <span className="text-muted-foreground">Sum Selling: </span>
                  <span className="font-semibold tabular-nums">{formatETB(sales.reduce((s, r) => s + Number(r.unit_selling_price) * r.qty, 0))}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Profit: </span>
                  <span className="font-bold text-success tabular-nums">{formatETB(totalProfit)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card p-4 card-shadow">
            <h4 className="font-semibold text-foreground mb-3 text-[14px] tracking-[-0.01em]">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowAddImport(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Import
              </button>
              {role === "owner" && (
                <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-success text-success-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all">
                  <ShoppingCart className="w-3.5 h-3.5" /> Record Sale
                </button>
              )}
              <button onClick={handleExportCsv} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">
                <FileDown className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">
                <Pencil className="w-3.5 h-3.5" /> Manage Stock
              </button>
              <button onClick={() => navigate("/notes")} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all col-span-2">
                <StickyNote className="w-3.5 h-3.5" /> Take Note
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card card-shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center gap-2 text-[14px] tracking-[-0.01em]">
                <StickyNote className="w-3.5 h-3.5 text-muted-foreground" /> Recent Notes
              </h4>
              <button onClick={() => navigate("/notes")} className="text-[12px] text-primary hover:underline font-medium">View all</button>
            </div>
            <div className="divide-y divide-border/50">
              {notes.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">No notes yet</div>
              )}
              {notes.slice(0, 4).map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate("/notes")}
                  className="px-4 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{note.title}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{note.content || "No content"}</div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">{format(new Date(note.updated_at), "MMM d")}</span>
                </div>
              ))}
            </div>
            {notes.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border/80 bg-muted/20">
                <button onClick={() => navigate("/notes")} className="w-full text-[12px] text-center text-primary hover:underline font-medium">
                  Open Notes →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailDrawer open={!!drawerSale} onClose={() => setDrawerSale(null)} title="Sale Details">
        {drawerSale && (
          <div className="space-y-4 text-[13px]">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground text-[12px]">Product</span><div className="font-medium mt-0.5">{drawerSale.product_name}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Brand</span><div className="font-medium mt-0.5">{drawerSale.brand}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Category</span><div className="font-medium mt-0.5">{drawerSale.category}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Quantity</span><div className="font-medium mt-0.5">{drawerSale.qty}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Payment</span><div className="font-medium mt-0.5">{drawerSale.payment_method}</div></div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Selling (unit)</span><span className="font-medium tabular-nums">{formatETB(Number(drawerSale.unit_selling_price))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Buying (unit)</span><span className="font-medium tabular-nums">{formatETB(Number(drawerSale.unit_buying_price))}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-[15px]"><span className="font-medium">Profit</span><span className="font-bold text-success tabular-nums">{formatETB(Number(drawerSale.profit))}</span></div>
            </div>
            <div className="h-px bg-border" />
            <div><span className="text-muted-foreground text-[12px]">Date</span><div className="font-medium mt-0.5">{formatDateTime(drawerSale.date)}</div></div>
          </div>
        )}
      </DetailDrawer>

      <AddImportModal open={showAddImport} onClose={() => setShowAddImport(false)} />
    </div>
  );
}
