import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, FileDown } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { salesRecords, profitOverTime, formatETB, formatDateTime, relativeTime } from "@/data/mockData";

const tabs = ["Sales History", "Inventory History"] as const;

const inventoryHistory = [
  { type: "Imported", item: "HP EliteBook 840 G6", category: "Laptop", qty: 6, unit_price: 45000, total: 270000, date: "2026-02-10T09:30:00+03:00", actor: "admin" },
  { type: "Sold", item: "Dell Latitude 5590", category: "Laptop", qty: 2, unit_price: 62000, total: 124000, date: "2026-02-10T16:10:00+03:00", actor: "admin" },
  { type: "Imported", item: "Lenovo ThinkPad T480", category: "Laptop", qty: 4, unit_price: 38000, total: 152000, date: "2026-02-08T14:15:00+03:00", actor: "admin" },
  { type: "Sold", item: "Lenovo ThinkPad T480", category: "Laptop", qty: 1, unit_price: 46000, total: 46000, date: "2026-02-06T11:15:00+03:00", actor: "manager1" },
  { type: "Imported", item: "Asus VivoBook 15", category: "Laptop", qty: 3, unit_price: 28000, total: 84000, date: "2026-02-09T08:45:00+03:00", actor: "admin" },
  { type: "Sold", item: "Asus VivoBook 15", category: "Laptop", qty: 2, unit_price: 35000, total: 70000, date: "2026-02-04T10:30:00+03:00", actor: "admin" },
  { type: "Adjusted", item: "Blue Yeti Microphone", category: "Mic", qty: -1, unit_price: 5500, total: -5500, date: "2026-02-05T12:00:00+03:00", actor: "admin" },
  { type: "Imported", item: "Seagate 2TB External HDD", category: "Accessory", qty: 10, unit_price: 3200, total: 32000, date: "2026-02-03T15:30:00+03:00", actor: "manager1" },
];

const typeBadge = (type: string) => {
  const styles: Record<string, string> = {
    Imported: "bg-info/10 text-info",
    Sold: "bg-success/10 text-success",
    Adjusted: "bg-warning/10 text-warning",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || "bg-accent text-accent-foreground"}`}>{type}</span>;
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Sales History");

  const totalSold = salesRecords.reduce((s, r) => s + r.qty, 0);
  const totalRevenue = salesRecords.reduce((s, r) => s + r.unit_selling_price * r.qty, 0);
  const totalProfit = salesRecords.reduce((s, r) => s + r.profit, 0);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-accent w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab ? "bg-background text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Sales History" ? (
        <div className="space-y-6">
          {/* Info tiles */}
          <div className="grid grid-cols-3 gap-3">
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

          {/* Charts */}
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

          {/* Read-only sales table */}
          <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="font-medium text-foreground">Sales Records</h4>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
                <FileDown className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Sales history">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sale ID</th>
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
                  {salesRecords.map((s) => (
                    <tr key={s.sale_id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{s.sale_id}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(s.date)}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{s.product_name}</td>
                      <td className="px-4 py-2.5 text-right">{s.qty}</td>
                      <td className="px-4 py-2.5 text-right">{formatETB(s.unit_selling_price * s.qty)}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{formatETB(s.unit_buying_price * s.qty)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-success">{formatETB(s.profit)}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Inventory History tab */
        <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4 className="font-medium text-foreground">Inventory Events</h4>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
              <FileDown className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Inventory history">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Event Type</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Actor</th>
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
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {formatDateTime(e.date)}<br />
                      <span className="text-muted-foreground/60">{relativeTime(e.date)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{e.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
