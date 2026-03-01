import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useAddImport } from "@/hooks/useImports";
import { useUploadProductPhotos } from "@/hooks/useProductPhotos";
import { supabase } from "@/integrations/supabase/client";
import PhotoUploadField from "@/components/shared/PhotoUploadField";

const categories = ["Laptop", "Mouse", "Keyboard", "Mic", "Accessory", "Storage", "Peripheral", "Misc"];
const brandsByCategory: Record<string, string[]> = {
  Laptop: ["HP", "Lenovo", "Dell", "Asus", "Acer", "Chromebook", "Other"],
  Mouse: ["Logitech", "HP", "Dell", "Other"],
  Keyboard: ["Logitech", "HP", "Dell", "Other"],
  Mic: ["Blue", "HyperX", "Other"],
  Accessory: ["Seagate", "SanDisk", "Rain Design", "Other"],
  Storage: ["Seagate", "SanDisk", "Western Digital", "Other"],
  Peripheral: ["Logitech", "HP", "Other"],
  Misc: ["Other"],
};

interface LineItem {
  category: string;
  brand: string;
  customBrand: string;
  description: string;
  qty: number;
  unit_buying_price: number;
  product_name: string;
  photos: File[];
}

const emptyLine = (): LineItem => ({
  category: "", brand: "", customBrand: "", description: "", qty: 1, unit_buying_price: 0, product_name: "", photos: [],
});

interface AddImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddImportModal({ open, onClose }: AddImportModalProps) {
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const addImport = useAddImport();
  const uploadPhotos = useUploadProductPhotos();

  if (!open) return null;

  const updateLine = (index: number, updates: Partial<LineItem>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...updates } : l)));
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCost = lines.reduce((sum, l) => sum + l.qty * l.unit_buying_price, 0);

  const handleSubmit = () => {
    const validLines = lines.filter(l => l.product_name && l.category && (l.brand === "Other" ? l.customBrand : l.brand));
    if (!validLines.length) return;

    addImport.mutate(
      {
        supplier,
        date,
        lines: validLines.map(l => ({
          product_name: l.product_name,
          brand: l.brand === "Other" ? l.customBrand : l.brand,
          category: l.category,
          description: l.description,
          qty: l.qty,
          unit_buying_price: l.unit_buying_price,
        })),
      },
      {
        onSuccess: async () => {
          // Upload photos for each product
          for (const line of validLines) {
            if (line.photos.length > 0) {
              const brandName = line.brand === "Other" ? line.customBrand : line.brand;
              const { data: product } = await supabase
                .from("products")
                .select("id")
                .eq("name", line.product_name)
                .eq("brand", brandName)
                .maybeSingle();
              if (product) {
                uploadPhotos.mutate({ productId: product.id, files: line.photos });
              }
            }
          }
          setLines([emptyLine()]); setSupplier(""); setDate(new Date().toISOString().split("T")[0]);
          onClose();
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg modal-shadow w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 className="text-base font-semibold text-foreground">Add Import</h3>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground" aria-label="Close"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Supplier</label>
                <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Import</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Line Items</h4>
                <button onClick={() => setLines((prev) => [...prev, emptyLine()])} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <Plus className="w-3 h-3" /> Add line
                </button>
              </div>

              {lines.map((line, i) => (
                <div key={i} className="rounded-md border border-border p-3 space-y-3 relative">
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(i)} className="absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-destructive transition-colors" aria-label="Remove line">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                      <select value={line.category} onChange={(e) => updateLine(i, { category: e.target.value, brand: "", customBrand: "" })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm">
                        <option value="">Select category…</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Brand</label>
                      <select value={line.brand} onChange={(e) => updateLine(i, { brand: e.target.value })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" disabled={!line.category}>
                        <option value="">Select brand…</option>
                        {(brandsByCategory[line.category] || []).map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      {line.brand === "Other" && (
                        <input type="text" value={line.customBrand} onChange={(e) => updateLine(i, { customBrand: e.target.value })} placeholder="Enter brand name" className="w-full mt-1 px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name</label>
                    <input type="text" value={line.product_name} onChange={(e) => updateLine(i, { product_name: e.target.value })} placeholder="e.g. HP EliteBook 840 G6" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Description / Specs</label>
                    <textarea value={line.description} onChange={(e) => updateLine(i, { description: e.target.value })} placeholder="Specifications, notes…" rows={2} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
                      <input type="number" min={1} value={line.qty} onChange={(e) => updateLine(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Buying Price (ETB per unit)</label>
                      <input type="number" min={0} value={line.unit_buying_price || ""} onChange={(e) => updateLine(i, { unit_buying_price: parseFloat(e.target.value) || 0 })} placeholder="Enter buying price (ETB)" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
                    </div>
                  </div>
                  <PhotoUploadField files={line.photos} onChange={(files) => updateLine(i, { photos: files })} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-border shrink-0">
            <div className="text-sm text-muted-foreground">Total Cost: <span className="font-semibold text-foreground">{totalCost.toLocaleString()} ETB</span></div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={addImport.isPending} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {addImport.isPending ? "Adding…" : "Add Import"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
