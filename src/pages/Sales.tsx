import { useState } from "react";
import { Search, FileDown, ShoppingCart, Paperclip } from "lucide-react";
import { salesRecords, products, formatETB, formatDateTime, relativeTime } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import type { SaleRecord } from "@/data/mockData";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "@/hooks/use-toast";

const paymentMethods = ["All", "Cash", "Card", "Mobile"];

export default function Sales() {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [drawerSale, setDrawerSale] = useState<SaleRecord | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);

  // Sale form state
  const [saleCategory, setSaleCategory] = useState("");
  const [saleSku, setSaleSku] = useState("");
  const [saleQty, setSaleQty] = useState(1);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [salePayment, setSalePayment] = useState("Cash");
  const [saleNotes, setSaleNotes] = useState("");

  const filtered = salesRecords.filter((s) => {
    if (search && !`${s.product_name} ${s.model} ${s.sku}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (paymentFilter !== "All" && s.payment_method !== paymentFilter) return false;
    return true;
  });

  const availableProducts = products.filter(p => p.qty_in_stock > 0 && (saleCategory === "" || p.category === saleCategory));

  const handleExport = () => {
    const headers = ["Date", "Item", "Model", "Qty", "Selling", "Buying", "Profit", "Payment", "By"];
    const rows = filtered.map(s => [formatDateTime(s.date), s.product_name, s.model, s.qty, s.unit_selling_price * s.qty, s.unit_buying_price * s.qty, s.profit, s.payment_method, s.entered_by]);
    exportToCsv("sales.csv", headers, rows);
    toast({ title: "Exported", description: `${filtered.length} sales exported to CSV.` });
  };

  const handleRecordSale = () => {
    if (!saleSku || !salePrice) {
      toast({ title: "Missing fields", description: "Please select an item and enter a selling price.", variant: "destructive" });
      return;
    }
    toast({ title: "Sale Recorded", description: "Sale would be saved to database (requires database connection)." });
    setShowRecordForm(false);
    setSaleCategory("");
    setSaleSku("");
    setSaleQty(1);
    setSalePrice(0);
    setSaleNotes("");
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {showRecordForm && (
        <div className="rounded-lg border border-border bg-card p-4 card-shadow animate-fade-in">
          <h4 className="font-medium text-foreground mb-4">Record New Sale</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select value={saleCategory} onChange={(e) => { setSaleCategory(e.target.value); setSaleSku(""); }} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" aria-label="Select category">
                <option value="">All categories…</option>
                <option>Laptop</option><option>Mouse</option><option>Keyboard</option><option>Mic</option><option>Accessory</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Item</label>
              <select value={saleSku} onChange={(e) => setSaleSku(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" aria-label="Select item">
                <option value="">Select item…</option>
                {availableProducts.map((p) => <option key={p.sku} value={p.sku}>{p.name} ({p.qty_in_stock} available)</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
              <input type="number" min={1} value={saleQty} onChange={(e) => setSaleQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" aria-label="Quantity" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Selling Price (ETB)</label>
              <input type="number" value={salePrice || ""} onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)} placeholder="Enter selling price" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" aria-label="Selling price" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
              <select value={salePayment} onChange={(e) => setSalePayment(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" aria-label="Payment method">
                <option>Cash</option><option>Card</option><option>Mobile</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Attachment</label>
              <input type="file" accept=".jpg,.png,.pdf" className="w-full text-xs text-muted-foreground file:mr-2 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground file:text-xs file:font-medium" aria-label="Attach proof" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <input type="text" value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Optional notes…" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" aria-label="Notes" />
            </div>
            <div className="flex items-end">
              <button onClick={handleRecordSale} className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity w-full justify-center">
                <ShoppingCart className="w-4 h-4" /> Record Sale
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-sm flex-1 min-w-[200px] max-w-[360px] overflow-hidden">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground truncate" aria-label="Search sales" />
        </div>

        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-foreground" aria-label="Filter by payment method">
          {paymentMethods.map((m) => <option key={m} value={m}>{m === "All" ? "All Payments" : m}</option>)}
        </select>

        <div className="flex-1" />

        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
          <FileDown className="w-4 h-4" /> Export
        </button>

        <button onClick={() => setShowRecordForm((o) => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-4 h-4" /> {showRecordForm ? "Hide Form" : "Record Sale"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Sales records">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Model</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Selling</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Buying</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Profit</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Payment</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">By</th>
                <th className="w-8 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.sale_id} onClick={() => setDrawerSale(s)} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setDrawerSale(s)} role="button" aria-label={`View sale details`}>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(s.date)}<br /><span className="text-muted-foreground/60">{relativeTime(s.date)}</span></td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.product_name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.model}</td>
                  <td className="px-4 py-2.5 text-right">{s.qty}</td>
                  <td className="px-4 py-2.5 text-right">{formatETB(s.unit_selling_price * s.qty)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{formatETB(s.unit_buying_price * s.qty)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-success">{formatETB(s.profit)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.payment_method === "Cash" ? "bg-success/10 text-success" : s.payment_method === "Card" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"}`}>{s.payment_method}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{s.entered_by}</td>
                  <td className="px-4 py-2.5">{s.attachment && <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <div className="h-px bg-border" />
              <div className="flex justify-between text-base"><span className="font-medium">Profit (ETB)</span><span className="font-semibold text-success">{formatETB(drawerSale.profit)}</span></div>
            </div>
            <div className="h-px bg-border" />
            <div><span className="text-muted-foreground">Date & Time</span><div className="font-medium">{formatDateTime(drawerSale.date)}</div></div>
            <div><span className="text-muted-foreground">Recorded by</span><div className="font-medium">{drawerSale.entered_by}</div></div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
