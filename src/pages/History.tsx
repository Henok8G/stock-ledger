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

  // Build profit over time from sales data
  const profitByDate = sales.reduce((acc, s) => {
    const d = new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!acc[d]) acc[d] = { date: d, profit: 0, revenue: 0, cost: 0 };
    acc[d].profit += Number(s.profit);
    acc[d].revenue += Number(s.unit_selling_price) * s.qty;
    acc[d].cost += Number(s.unit_buying_price) * s.qty;
    return acc;
  }, {} as Record<string, { date: string; profit: number; revenue: number; cost: number }>);
  const profitOverTime = Object.values(profitByDate);

  // Build inventory history from imports and sales
  const inventoryHistory = [
    ...imports.flatMap(r => r.import_line_items.map(l => ({
      type: "Imported" as const,
      item: l.product_name,
      category: l.category,
      qty: l.qty,
      unit_price: Number(l.unit_buying_price),
      total: l.qty * Number(l.unit_buying_price),
      date: r.date,
    }))),
    ...sales.map(s => ({
      type: "Sold" as const,
      item: s.product_name,
      category: s.category,
      qty: s.qty,
      unit_price: Number(s.unit_selling_price),
      total: s.qty * Number(s.unit_selling_price),
      date: s.date,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = { Imported: "bg-info/10 text-info", Sold: "bg-success/10 text-success" };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || "bg-accent text-accent-foreground"}`}>{type}</span>;
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
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-accent w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-background text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Sales History" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-4 card-shadow flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent"><ShoppingCart className="w-4 h-4 text-foreground" /></div>
              <div><div className="text-xs text-muted-foreground">Total Sold</div><div className="text-lg font-semibold">{totalSold}</div></div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 card-shadow flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent"><DollarSign className="w-4 h-4 text-foreground" /></div>
              <div><div className="text-xs text-muted-foreground">Total Revenue</div><div className="text-lg font-semibold">{formatETB(totalRevenue)}</div></div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 card-shadow flex items-center gap-3">
              <div className="p-2 rounded-md bg-success/10"><TrendingUp className="w-4 h-4 text-success" /></div>
              <div><div className="text-xs text-muted-foreground">Total Profit</div><div className="text-lg font-semibold text-success">{formatETB(totalProfit)}</div></div>
            </div>
          </div>

          {profitOverTime.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                <h4 className="font-medium text-foreground mb-4">Profit Over Time</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [formatETB(value), ""]} />
                      <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 card-shadow">
                <h4 className="font-medium text-foreground mb-4">Revenue vs Cost</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [formatETB(value), ""]} />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cost" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="font-medium text-foreground">Sales Records</h4>
              <div className="flex gap-2">
                <button onClick={handleExportSales} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors"><FileDown className="w-4 h-4" /> CSV</button>
                <button onClick={handleExportSalesPdf} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors"><FileDown className="w-4 h-4" /> PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Cost</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Profit</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(s.date)}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{s.product_name}</td>
                      <td className="px-4 py-2.5 text-right">{s.qty}</td>
                      <td className="px-4 py-2.5 text-right">{formatETB(Number(s.unit_selling_price) * s.qty)}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{formatETB(Number(s.unit_buying_price) * s.qty)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-success">{formatETB(Number(s.profit))}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.payment_method}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No sales yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4 className="font-medium text-foreground">Inventory Events</h4>
            <button onClick={handleExportInventory} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors"><FileDown className="w-4 h-4" /> Export</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Event Type</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {inventoryHistory.map((e, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-2.5">{typeBadge(e.type)}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{e.item}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.category}</td>
                    <td className="px-4 py-2.5 text-right">{e.qty}</td>
                    <td className="px-4 py-2.5 text-right">{formatETB(e.unit_price)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatETB(Math.abs(e.total))}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(e.date)}</td>
                  </tr>
                ))}
                {inventoryHistory.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No history yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
