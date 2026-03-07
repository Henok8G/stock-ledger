import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, FileDown } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSales } from "@/hooks/useSales";
import { useImports } from "@/hooks/useImports";
import { formatETB, formatDateTime } from "@/data/mockData";
import { exportToCsv, exportToPdf } from "@/lib/exportCsv";
import { toast } from "@/hooks/use-toast";

const tabs = ["Sales History", "Inventory History"] as const;

export default function HistoryPage() {
  const { data: sales = [] } = useSales();
  const { data: imports = [] } = useImports();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Sales History");

  const totalSold = sales.reduce((s, r) => s + r.qty, 0);
  const totalRevenue = sales.reduce((s, r) => s + Number(r.unit_selling_price) * r.qty, 0);
  const totalProfit = sales.reduce((s, r) => s + Number(r.profit), 0);

  const profitByDate = sales.reduce((acc, s) => {
    const d = new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!acc[d]) acc[d] = { date: d, profit: 0, revenue: 0, cost: 0 };
    acc[d].profit += Number(s.profit);
    acc[d].revenue += Number(s.unit_selling_price) * s.qty;
    acc[d].cost += Number(s.unit_buying_price) * s.qty;
    return acc;
  }, {} as Record<string, { date: string; profit: number; revenue: number; cost: number }>);
  const profitOverTime = Object.values(profitByDate);

  const inventoryHistory = [
    ...imports.flatMap(r => r.import_line_items.map(l => ({
      type: "Imported" as const, item: l.product_name, category: l.category,
      qty: l.qty, unit_price: Number(l.unit_buying_price),
      total: l.qty * Number(l.unit_buying_price), date: r.date,
    }))),
    ...sales.map(s => ({
      type: "Sold" as const, item: s.product_name, category: s.category,
      qty: s.qty, unit_price: Number(s.unit_selling_price),
      total: s.qty * Number(s.unit_selling_price), date: s.date,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = { Imported: "bg-info/10 text-info", Sold: "bg-success/10 text-success" };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[type] || "bg-accent text-accent-foreground"}`}>{type}</span>;
  };

  const handleExportSales = () => {
    const headers = ["Date", "Item", "Qty", "Revenue", "Cost", "Profit", "Payment"];
    const rows = sales.map(s => [formatDateTime(s.date), s.product_name, s.qty, Number(s.unit_selling_price) * s.qty, Number(s.unit_buying_price) * s.qty, Number(s.profit), s.payment_method]);
    exportToCsv("sales-history.csv", headers, rows);
    toast({ title: "Exported", description: `${sales.length} sales records exported.` });
  };

  const handleExportSalesPdf = () => {
    const headers = ["Date", "Item", "Qty", "Revenue", "Cost", "Profit", "Payment"];
    const rows = sales.map(s => [formatDateTime(s.date), s.product_name, s.qty, formatETB(Number(s.unit_selling_price) * s.qty), formatETB(Number(s.unit_buying_price) * s.qty), formatETB(Number(s.profit)), s.payment_method]);
    exportToPdf("Sales History Report", headers, rows);
  };

  const handleExportInventory = () => {
    const headers = ["Type", "Item", "Category", "Qty", "Unit Price", "Total", "Date"];
    const rows = inventoryHistory.map(e => [e.type, e.item, e.category, e.qty, e.unit_price, Math.abs(e.total), formatDateTime(e.date)]);
    exportToCsv("inventory-history.csv", headers, rows);
    toast({ title: "Exported", description: `${inventoryHistory.length} inventory events exported.` });
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-[6px] rounded-md text-[13px] font-medium transition-all duration-150 ${activeTab === tab ? "bg-card text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Sales History" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/80 bg-card p-4 card-shadow flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-muted/60"><ShoppingCart className="w-4 h-4 text-foreground" /></div>
              <div><div className="text-[11px] text-muted-foreground uppercase tracking-[0.05em] font-medium">Total Sold</div><div className="text-lg font-bold tracking-tight tabular-nums">{totalSold}</div></div>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 card-shadow flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-muted/60"><DollarSign className="w-4 h-4 text-foreground" /></div>
              <div><div className="text-[11px] text-muted-foreground uppercase tracking-[0.05em] font-medium">Total Revenue</div><div className="text-lg font-bold tracking-tight tabular-nums">{formatETB(totalRevenue)}</div></div>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 card-shadow flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/8"><TrendingUp className="w-4 h-4 text-success" /></div>
              <div><div className="text-[11px] text-muted-foreground uppercase tracking-[0.05em] font-medium">Total Profit</div><div className="text-lg font-bold text-success tracking-tight tabular-nums">{formatETB(totalProfit)}</div></div>
            </div>
          </div>

          {profitOverTime.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/80 bg-card p-5 card-shadow">
                <h4 className="font-semibold text-foreground mb-4 text-[14px] tracking-[-0.01em]">Profit Over Time</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} formatter={(value: number) => [formatETB(value), ""]} />
                      <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-border/80 bg-card p-5 card-shadow">
                <h4 className="font-semibold text-foreground mb-4 text-[14px] tracking-[-0.01em]">Revenue vs Cost</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} formatter={(value: number) => [formatETB(value), ""]} />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-4))" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="cost" fill="hsl(var(--chart-5))" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border/80 bg-card card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/80">
              <h4 className="font-semibold text-foreground text-[14px] tracking-[-0.01em]">Sales Records</h4>
              <div className="flex gap-2">
                <button onClick={handleExportSales} className="flex items-center gap-1.5 px-3 py-[6px] rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-accent active:scale-[0.98] transition-all"><FileDown className="w-3.5 h-3.5" /> CSV</button>
                <button onClick={handleExportSalesPdf} className="flex items-center gap-1.5 px-3 py-[6px] rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-accent active:scale-[0.98] transition-all"><FileDown className="w-3.5 h-3.5" /> PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Date</th>
                    <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Item</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Qty</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Revenue</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Cost</th>
                    <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Profit</th>
                    <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/25 transition-colors">
                      <td className="px-5 py-3 text-[12px] text-muted-foreground">{formatDateTime(s.date)}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{s.product_name}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{s.qty}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatETB(Number(s.unit_selling_price) * s.qty)}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{formatETB(Number(s.unit_buying_price) * s.qty)}</td>
                      <td className="px-5 py-3 text-right font-medium text-success tabular-nums">{formatETB(Number(s.profit))}</td>
                      <td className="px-5 py-3 text-[12px] text-muted-foreground">{s.payment_method}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-[13px]">No sales yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/80">
            <h4 className="font-semibold text-foreground text-[14px] tracking-[-0.01em]">Inventory Events</h4>
            <button onClick={handleExportInventory} className="flex items-center gap-1.5 px-3 py-[6px] rounded-lg border border-border bg-card text-[12px] font-medium hover:bg-accent active:scale-[0.98] transition-all"><FileDown className="w-3.5 h-3.5" /> Export</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Event Type</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Item</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Category</th>
                  <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Qty</th>
                  <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Unit Price</th>
                  <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Total</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {inventoryHistory.map((e, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/25 transition-colors">
                    <td className="px-5 py-3">{typeBadge(e.type)}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{e.item}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.category}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{e.qty}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatETB(e.unit_price)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{formatETB(Math.abs(e.total))}</td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground">{formatDateTime(e.date)}</td>
                  </tr>
                ))}
                {inventoryHistory.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-[13px]">No history yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
