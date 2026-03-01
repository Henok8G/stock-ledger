import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { ImportRecord } from "@/hooks/useImports";
import PhotoGallery from "@/components/shared/PhotoGallery";
import PhotoUploadField from "@/components/shared/PhotoUploadField";
import { useProducts } from "@/hooks/useProducts";
import { useUploadProductPhotos } from "@/hooks/useProductPhotos";

interface EditImportModalProps {
  open: boolean;
  onClose: () => void;
  importRecord: ImportRecord;
}

export default function EditImportModal({ open, onClose, importRecord }: EditImportModalProps) {
  const { data: products = [] } = useProducts();
  const uploadPhotos = useUploadProductPhotos();
  const qc = useQueryClient();

  const [supplier, setSupplier] = useState(importRecord.supplier);
  const [date, setDate] = useState(new Date(importRecord.date).toISOString().split("T")[0]);
  const [lines, setLines] = useState(
    importRecord.import_line_items.map(l => ({
      id: l.id,
      product_name: l.product_name,
      brand: l.brand,
      category: l.category,
      description: l.description || "",
      qty: l.qty,
      unit_buying_price: Number(l.unit_buying_price),
      photos: [] as File[],
    }))
  );
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const updateLine = (index: number, updates: Partial<typeof lines[0]>) => {
    setLines(prev => prev.map((l, i) => (i === index ? { ...l, ...updates } : l)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update the import record
      const { error: recErr } = await supabase
        .from("import_records")
        .update({ supplier, date })
        .eq("id", importRecord.id);
      if (recErr) throw recErr;

      // Update each line item
      for (const line of lines) {
        const { error: lineErr } = await supabase
          .from("import_line_items")
          .update({
            product_name: line.product_name,
            brand: line.brand,
            category: line.category,
            description: line.description,
            qty: line.qty,
            unit_buying_price: line.unit_buying_price,
          })
          .eq("id", line.id);
        if (lineErr) throw lineErr;

        // Upload new photos
        if (line.photos.length > 0) {
          const matchedProduct = products.find(p => p.name === line.product_name && p.brand === line.brand);
          if (matchedProduct) {
            uploadPhotos.mutate({ productId: matchedProduct.id, files: line.photos });
          }
        }
      }

      qc.invalidateQueries({ queryKey: ["imports"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Updated", description: "Import record updated." });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg modal-shadow w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 className="text-base font-semibold text-foreground">Edit Import</h3>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground" aria-label="Close"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Supplier</label>
                <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Line Items</h4>
              {lines.map((line, i) => {
                const matchedProduct = products.find(p => p.name === line.product_name && p.brand === line.brand);
                return (
                  <div key={line.id} className="rounded-md border border-border p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name</label>
                        <input type="text" value={line.product_name} onChange={(e) => updateLine(i, { product_name: e.target.value })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Brand</label>
                        <input type="text" value={line.brand} onChange={(e) => updateLine(i, { brand: e.target.value })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                        <input type="text" value={line.category} onChange={(e) => updateLine(i, { category: e.target.value })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                        <input type="text" value={line.description} onChange={(e) => updateLine(i, { description: e.target.value })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
                        <input type="number" min={1} value={line.qty} onChange={(e) => updateLine(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Buying Price (ETB)</label>
                        <input type="number" min={0} value={line.unit_buying_price || ""} onChange={(e) => updateLine(i, { unit_buying_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                      </div>
                    </div>
                    <PhotoUploadField files={line.photos} onChange={(files) => updateLine(i, { photos: files })} />
                    {matchedProduct && <PhotoGallery productId={matchedProduct.id} allowUpload />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
            <button onClick={onClose} className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
