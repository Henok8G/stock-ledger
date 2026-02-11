import { useState } from "react";
import {
  Package, ShoppingCart, Download, TrendingUp, Wallet,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, FileDown, Pencil,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  products, salesRecords, importRecords,
  profitOverTime, unitsSoldByCategory, stockByCategory, topSellingModels,
  formatETB, formatDateTime, relativeTime,
} from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";

const kpis = [
  {
    label: "Total Items in Stock",
    value: products.reduce((s, p) => s + p.qty_in_stock, 0),
    icon: Package,
    change: +4.2,
    format: (v: number) => v.toLocaleString(),
  },
  {
    label: "Items Sold (30d)",
    value: salesRecords.reduce((s, r) => s + r.qty, 0),
    icon: ShoppingCart,
    change: +12.5,
    format: (v: number) => v.toLocaleString(),
  },
  {
    label: "Items Imported (30d)",
    value: importRecords.reduce((s, r) => s + r.lines.reduce((a, l) => a + l.qty, 0), 0),
    icon: Download,
    change: -2.1,
    format: (v: number) => v.toLocaleString(),
  },
  {
    label: "Total Profit (30d)",
    value: salesRecords.reduce((s, r) => s + r.profit, 0),
    icon: TrendingUp,
    change: +8.7,
    format: (v: number) => formatETB(v),
  },
  {
    label: "Inventory Value",
    value: products.reduce((s, p) => s + p.buying_price * p.qty_in_stock, 0),
    icon: Wallet,
    change: +3.1,
    format: (v: number) => formatETB(v),
  },
];

const lowStockItems = products.filter((p) => p.qty_in_stock > 0 && p.qty_in_stock <= 3);
const outOfStock = products.filter((p) => p.qty_in_stock === 0);

export default function Dashboard() {
  const [drawerSale, setDrawerSale] = useState<typeof salesRecords[0] | null>(null);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="kpi-gradient rounded-lg border border-border p-4 card-shadow flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold text-foreground">{kpi.format(kpi.value)}</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${kpi.change >= 0 ? "text-success" : "text-destructive"}`}>
              {kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(kpi.change)}% vs prev period
            </div>
          </div>
        ))}
      </div>

      {/* Main area — two column */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left column */}
        <div className="space-y-6 min-w-0">
          {/* Profit over time */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-4">Profit Over Time</h4>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [formatETB(value), ""]}
                  />
                  <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-4))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Units sold by category */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-4">Units Sold by Category</h4>
            <div className="h-[200px]">
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

          {/* Recent sales table */}
          <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h4 className="font-medium text-foreground">Recently Sold Items</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Recent sales">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Model</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Selling</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Buying</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Profit</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRecords.slice(0, 8).map((sale) => (
                    <tr
                      key={sale.sale_id}
                      onClick={() => setDrawerSale(sale)}
                      className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setDrawerSale(sale)}
                      role="button"
                      aria-label={`View sale ${sale.sale_id}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">{sale.product_name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{sale.model}</td>
                      <td className="px-4 py-2.5 text-right">{sale.qty}</td>
                      <td className="px-4 py-2.5 text-right">{formatETB(sale.unit_selling_price * sale.qty)}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{formatETB(sale.unit_buying_price * sale.qty)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-success">{formatETB(sale.profit)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {formatDateTime(sale.date)}
                        <br />
                        <span className="text-muted-foreground/60">{relativeTime(sale.date)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Aggregated */}
            <div className="px-4 py-3 border-t border-border bg-accent/30 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Sum Selling: </span>
                <span className="font-medium">{formatETB(salesRecords.reduce((s, r) => s + r.unit_selling_price * r.qty, 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sum Buying: </span>
                <span className="font-medium">{formatETB(salesRecords.reduce((s, r) => s + r.unit_buying_price * r.qty, 0))}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Profit: </span>
                <span className="font-semibold text-success">{formatETB(salesRecords.reduce((s, r) => s + r.profit, 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick counts */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow space-y-3">
            <h4 className="font-medium text-foreground">Stock Summary</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-md bg-accent">
                <div className="text-lg font-semibold text-foreground">{products.filter((p) => p.qty_in_stock > 3).length}</div>
                <div className="text-xs text-muted-foreground">In Stock</div>
              </div>
              <div className="text-center p-2 rounded-md bg-warning/10">
                <div className="text-lg font-semibold text-warning">{lowStockItems.length}</div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
              </div>
              <div className="text-center p-2 rounded-md bg-destructive/10">
                <div className="text-lg font-semibold text-destructive">{outOfStock.length}</div>
                <div className="text-xs text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </div>

          {/* Top selling */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-3">Top Selling Models</h4>
            <div className="space-y-2">
              {topSellingModels.map((m, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-muted-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{m.brand} {m.model}</div>
                    <div className="text-xs text-muted-foreground">{m.category}</div>
                  </div>
                  <span className="text-sm font-medium text-foreground">{m.sold} sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock by category donut */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-3">Stock by Category</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stockByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value} units`, name]}
                  />
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

          {/* Alerts */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Alerts
            </h4>
            <div className="space-y-2 text-sm">
              {lowStockItems.map((p) => (
                <div key={p.sku} className="flex items-center gap-2 text-warning">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  <span className="text-foreground">{p.name}</span>
                  <span className="ml-auto text-xs font-medium">{p.qty_in_stock} left</span>
                </div>
              ))}
              {outOfStock.map((p) => (
                <div key={p.sku} className="flex items-center gap-2 text-destructive">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  <span className="text-foreground">{p.name}</span>
                  <span className="ml-auto text-xs font-medium">Out of stock</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border border-border bg-card p-4 card-shadow">
            <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Import
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <ShoppingCart className="w-4 h-4" /> Record Sale
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors">
                <FileDown className="w-4 h-4" /> Export CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors">
                <Pencil className="w-4 h-4" /> Bulk Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sale detail drawer */}
      <DetailDrawer open={!!drawerSale} onClose={() => setDrawerSale(null)} title={drawerSale ? `Sale Details` : ""}>
        {drawerSale && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Product</span><div className="font-medium">{drawerSale.product_name}</div></div>
              <div><span className="text-muted-foreground">Model</span><div className="font-medium">{drawerSale.model}</div></div>
              <div><span className="text-muted-foreground">Brand</span><div className="font-medium">{drawerSale.brand}</div></div>
              <div><span className="text-muted-foreground">Category</span><div className="font-medium">{drawerSale.category}</div></div>
              <div><span className="text-muted-foreground">Quantity</span><div className="font-medium">{drawerSale.qty}</div></div>
              <div><span className="text-muted-foreground">Payment</span><div className="font-medium">{drawerSale.payment_method}</div></div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Selling Price (unit)</span><span className="font-medium">{formatETB(drawerSale.unit_selling_price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Buying Price (unit)</span><span className="font-medium">{formatETB(drawerSale.unit_buying_price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Selling</span><span className="font-medium">{formatETB(drawerSale.unit_selling_price * drawerSale.qty)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Buying</span><span className="font-medium">{formatETB(drawerSale.unit_buying_price * drawerSale.qty)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-base"><span className="font-medium">Profit (ETB)</span><span className="font-semibold text-success">{formatETB(drawerSale.profit)}</span></div>
              <p className="text-xs text-muted-foreground">Profit = (Selling Price − Buying Price) × Qty</p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <span className="text-muted-foreground">Date & Time</span>
              <div className="font-medium">{formatDateTime(drawerSale.date)}</div>
              <div className="text-xs text-muted-foreground">{relativeTime(drawerSale.date)}</div>
            </div>
            <div><span className="text-muted-foreground">Recorded by</span><div className="font-medium">{drawerSale.entered_by}</div></div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
