import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { useRecordSale } from "@/hooks/useSales";
import { formatETB } from "@/data/mockData";
import type { Product } from "@/hooks/useProducts";

const paymentMethods = ["Cash", "Card", "Mobile"];

interface SoldModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export default function SoldModal({ open, onClose, product }: SoldModalProps) {
  const [qty, setQty] = useState(1);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const recordSale = useRecordSale();

  if (!open) return null;

  const profit = (sellingPrice - Number(product.buying_price)) * qty;
  const maxQty = product.qty_in_stock;

  const handleSubmit = () => {
    if (!sellingPrice || qty < 1) return;

    recordSale.mutate(
      {
        product_id: product.id,
        product_name: product.name,
        brand: product.brand,
        category: product.category,
        qty,
        unit_selling_price: sellingPrice,
        unit_buying_price: Number(product.buying_price),
        payment_method: paymentMethod,
        notes,
      },
      {
        onSuccess: () => {
          setQty(1); setSellingPrice(0); setPaymentMethod("Cash"); setNotes("");
          onClose();
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg modal-shadow w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Record Sale
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Auto-filled product info */}
            <div className="rounded-md border border-border bg-accent/30 p-3 space-y-1">
              <div className="text-sm font-medium text-foreground">{product.name}</div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{product.brand}</span>
                <span>{product.category}</span>
                <span>Stock: {product.qty_in_stock}</span>
              </div>
              <div className="text-xs text-muted-foreground">Buying Price: {formatETB(Number(product.buying_price))}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity *</label>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={qty}
                  onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm"
                />
                <span className="text-xs text-muted-foreground mt-0.5 block">{maxQty} available</span>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Selling Price (ETB) *</label>
                <input
                  type="number"
                  min={0}
                  value={sellingPrice || ""}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Per unit"
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm"
              >
                {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this sale…"
                rows={2}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            {/* Profit preview */}
            {sellingPrice > 0 && (
              <div className="rounded-md border border-border bg-accent/30 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">{formatETB(sellingPrice * qty)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-medium">{formatETB(Number(product.buying_price) * qty)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Estimated Profit</span>
                  <span className={`font-semibold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatETB(profit)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
            <button onClick={onClose} className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={recordSale.isPending || !sellingPrice || qty < 1}
              className="px-4 py-1.5 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {recordSale.isPending ? "Recording…" : "Record Sale"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
