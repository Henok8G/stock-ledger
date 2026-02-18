import { useState } from "react";
import { Search, FileDown, ShoppingCart, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSales, useRecordSale, useDeleteSale, type SaleRecord } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { formatETB, formatDateTime } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const paymentMethods = ["All", "Cash", "Card", "Mobile"];

export default function Sales() {
  const { data: sales = [], isLoading } = useSales();
  const { data: products = [] } = useProducts();
  const recordSale = useRecordSale();
  const deleteSale = useDeleteSale();
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [drawerSale, setDrawerSale] = useState<SaleRecord | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  

  // Sale form state
  const [saleCategory, setSaleCategory] = useState("");
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQty, setSaleQty] = useState(1);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [salePayment, setSalePayment] = useState("Cash");
  const [saleNotes, setSaleNotes] = useState("");

  const filtered = sales.filter((s) => {
    if (search && !`${s.product_name} ${s.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (paymentFilter !== "All" && s.payment_method !== paymentFilter) return false;
    return true;
  });

  const availableProducts = products.filter(p => p.qty_in_stock > 0 && (saleCategory === "" || p.category === saleCategory));
  const selectedProduct = products.find(p => p.id === saleProductId);

  const handleExport = () => {
    const headers = ["Date", "Item", "Qty", "Selling", "Buying", "Profit", "Payment"];
    const rows = filtered.map(s => [formatDateTime(s.date), s.product_name, s.qty, Number(s.unit_selling_price) * s.qty, Number(s.unit_buying_price) * s.qty, Number(s.profit), s.payment_method]);
    exportToCsv("sales.csv", headers, rows);
    toast({ title: "Exported", description: `${filtered.length} sales exported to CSV.` });
  };

  const handleRecordSale = () => {
    if (!saleProductId || !salePrice || !selectedProduct) {
      toast({ title: "Missing fields", description: "Please select an item and enter a selling price.", variant: "destructive" });
      return;
    }

    recordSale.mutate(
      {
        product_id: saleProductId,
        product_name: selectedProduct.name,
        brand: selectedProduct.brand,
        category: selectedProduct.category,
        qty: saleQty,
        unit_selling_price: salePrice,
        unit_buying_price: Number(selectedProduct.buying_price),
        payment_method: salePayment,
        notes: saleNotes,
      },
      {
        onSuccess: () => {
          setShowRecordForm(false);
          setSaleCategory(""); setSaleProductId(""); setSaleQty(1); setSalePrice(0); setSaleNotes("");
        },
      }
    );
  };

  const handleDelete = (s: SaleRecord) => {
    if (role !== "owner") {
      toast({ title: "Permission Denied", description: "Only owners can delete sales.", variant: "destructive" });
      return;
    }
    deleteSale.mutate(s.id);
    setDrawerSale(null);
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading sales…</div>;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {showRecordForm && (
        <div className="rounded-lg border border-border bg-card p-4 card-shadow animate-fade-in">
          <h4 className="font-medium text-foreground mb-4">Record New Sale</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select value={saleCategory} onChange={(e) => { setSaleCategory(e.target.value); setSaleProductId(""); }} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm">
                <option value="">All categories…</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Item</label>
              <select value={saleProductId} onChange={(e) => setSaleProductId(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm">
                <option value="">Select item…</option>
                {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.qty_in_stock} available)</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
              <input type="number" min={1} max={selectedProduct?.qty_in_stock || 999} value={saleQty} onChange={(e) => setSaleQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Selling Price (ETB)</label>
              <input type="number" value={salePrice || ""} onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)} placeholder="Enter selling price" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
              <select value={salePayment} onChange={(e) => setSalePayment(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm">
                <option>Cash</option><option>Card</option><option>Mobile</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <input type="text" value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Optional notes…" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
            </div>
            <div className="flex items-end">
              <button onClick={handleRecordSale} disabled={recordSale.isPending} className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity w-full justify-center disabled:opacity-50">
                <ShoppingCart className="w-4 h-4" /> {recordSale.isPending ? "Recording…" : "Record Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-sm flex-1 min-w-[200px] max-w-[360px] overflow-hidden">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground truncate" />
        </div>

        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-foreground">
          {paymentMethods.map((m) => <option key={m} value={m}>{m === "All" ? "All Payments" : m}</option>)}
        </select>

        <div className="flex-1" />

        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
          <FileDown className="w-4 h-4" /> Export
        </button>

        {role === "owner" && (
          <button onClick={() => setShowRecordForm((o) => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <ShoppingCart className="w-4 h-4" /> {showRecordForm ? "Hide Form" : "Record Sale"}
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card card-shadow overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Selling</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Buying</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Profit</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Payment</th>
                <th className="w-12 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => setDrawerSale(s)} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors" role="button">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(s.date)}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.product_name}</td>
                  <td className="px-4 py-2.5 text-right">{s.qty}</td>
                  <td className="px-4 py-2.5 text-right">{formatETB(Number(s.unit_selling_price) * s.qty)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{formatETB(Number(s.unit_buying_price) * s.qty)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-success">{formatETB(Number(s.profit))}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.payment_method === "Cash" ? "bg-success/10 text-success" : s.payment_method === "Card" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"}`}>{s.payment_method}</span>
                  </td>
                  <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-accent transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => handleDelete(s)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No sales recorded yet.</td></tr>
              )}
            </tbody>
          </table>
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
              <div className="flex justify-between"><span className="text-muted-foreground">Selling Price (unit)</span><span className="font-medium">{formatETB(Number(drawerSale.unit_selling_price))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Buying Price (unit)</span><span className="font-medium">{formatETB(Number(drawerSale.unit_buying_price))}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-base"><span className="font-medium">Profit (ETB)</span><span className="font-semibold text-success">{formatETB(Number(drawerSale.profit))}</span></div>
            </div>
            <div className="h-px bg-border" />
            <div><span className="text-muted-foreground">Date & Time</span><div className="font-medium">{formatDateTime(drawerSale.date)}</div></div>
            {drawerSale.notes && <div><span className="text-muted-foreground">Notes</span><div className="font-medium">{drawerSale.notes}</div></div>}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
