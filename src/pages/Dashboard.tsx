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
  "hsl(222, 84%, 11%)", "hsl(210, 92%, 45%)", "hsl(142, 60%, 40%)",
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
    { label: "Active Products", value: activeProducts, icon: Package, format: (v: number) => v.toLocaleString() },
    { label: "Items Sold", value: totalSold, icon: ShoppingCart, format: (v: number) => v.toLocaleString() },
    { label: "Items Imported", value: totalImported, icon: Download, format: (v: number) => v.toLocaleString() },
    { label: "Total Profit", value: totalProfit, icon: TrendingUp, format: (v: number) => formatETB(v) },
  ];

  // Units sold by category
  const soldByCategory = sales.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.qty;
    return acc;
  }, {} as Record<string, number>);
  const unitsSoldByCategory = Object.entries(soldByCategory).map(([category, units]) => ({ category, units }));

  // Stock by category
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
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-gradient rounded-lg border border-border p-4 card-shadow flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold text-foreground">{kpi.format(kpi.value)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6 min-w-0">
          {unitsSoldByCategory.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 card-shadow">
              <h4 className="font-medium text-foreground mb-4">Units Sold by Category</h4>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitsSoldByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="units" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h4 className="font-medium text-foreground">Recently Sold Items</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Selling</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Profit</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 8).map((sale) => (
                    <tr key={sale.id} onClick={() => setDrawerSale(sale)} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors" role="button">
                      <td className="px-4 py-2.5 font-medium text-foreground">{sale.product_name}</td>
                      <td className="px-4 py-2.5 text-right">{sale.qty}</td>
                      <td className="px-4 py-2.5 text-right">{formatETB(Number(sale.unit_selling_price) * sale.qty)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-success">{formatETB(Number(sale.profit))}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatDateTime(sale.date)}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No sales yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {sales.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-accent/30 flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Sum Selling: </span>
                  <span className="font-medium">{formatETB(sales.reduce((s, r) => s + Number(r.unit_selling_price) * r.qty, 0))}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Profit: </span>
                  <span className="font-semibold text-success">{formatETB(totalProfit)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {stockByCategory.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 card-shadow">
              <h4 className="font-medium text-foreground mb-3">Stock by Category</h4>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                      {stockByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number, name: string) => [`${value} units`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {stockByCategory.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowAddImport(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Import
              </button>
              {role === "owner" && (
                <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 px-3 py-2 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  <ShoppingCart className="w-4 h-4" /> Record Sale
                </button>
              )}
              <button onClick={handleExportCsv} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors">
                <FileDown className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors">
                <Pencil className="w-4 h-4" /> Manage Stock
              </button>
              <button onClick={() => navigate("/notes")} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors col-span-2">
                <StickyNote className="w-4 h-4" /> Take Note
              </button>
            </div>
          </div>

          {/* Recent Notes Widget */}
          <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-muted-foreground" /> Recent Notes
              </h4>
              <button onClick={() => navigate("/notes")} className="text-xs text-primary hover:underline">View all</button>
            </div>
            <div className="divide-y divide-border">
              {notes.length === 0 && (
                <div className="px-4 py-5 text-center text-sm text-muted-foreground">No notes yet.</div>
              )}
              {notes.slice(0, 4).map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate("/notes")}
                  className="px-4 py-2.5 hover:bg-accent/30 cursor-pointer transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{note.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{note.content || "No content"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{format(new Date(note.updated_at), "MMM d")}</span>
                </div>
              ))}
            </div>
            {notes.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border bg-accent/20">
                <button onClick={() => navigate("/notes")} className="w-full text-xs text-center text-primary hover:underline">
                  Open Notes →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailDrawer open={!!drawerSale} onClose={() => setDrawerSale(null)} title="Sale Details">
        {drawerSale && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Product</span><div className="font-medium">{drawerSale.product_name}</div></div>
              <div><span className="text-muted-foreground">Brand</span><div className="font-medium">{drawerSale.brand}</div></div>
              <div><span className="text-muted-foreground">Category</span><div className="font-medium">{drawerSale.category}</div></div>
              <div><span className="text-muted-foreground">Quantity</span><div className="font-medium">{drawerSale.qty}</div></div>
              <div><span className="text-muted-foreground">Payment</span><div className="font-medium">{drawerSale.payment_method}</div></div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Selling (unit)</span><span className="font-medium">{formatETB(Number(drawerSale.unit_selling_price))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Buying (unit)</span><span className="font-medium">{formatETB(Number(drawerSale.unit_buying_price))}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-base"><span className="font-medium">Profit</span><span className="font-semibold text-success">{formatETB(Number(drawerSale.profit))}</span></div>
            </div>
            <div className="h-px bg-border" />
            <div><span className="text-muted-foreground">Date</span><div className="font-medium">{formatDateTime(drawerSale.date)}</div></div>
          </div>
        )}
      </DetailDrawer>

      <AddImportModal open={showAddImport} onClose={() => setShowAddImport(false)} />
    </div>
  );
}
