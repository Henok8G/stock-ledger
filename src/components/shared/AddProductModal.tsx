import { useState } from "react";
import { X } from "lucide-react";
import { useAddProduct } from "@/hooks/useProducts";
import { useUploadProductPhotos } from "@/hooks/useProductPhotos";
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

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProductModal({ open, onClose }: AddProductModalProps) {
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState(1);
  const [buyingPrice, setBuyingPrice] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [photos, setPhotos] = useState<File[]>([]);

  const addProduct = useAddProduct();
  const uploadPhotos = useUploadProductPhotos();

  if (!open) return null;

  const handleSubmit = () => {
    const finalBrand = brand === "Other" ? customBrand : brand;
    if (!category || !finalBrand || !name) return;

    addProduct.mutate(
      {
        name,
        brand: finalBrand,
        category,
        description,
        qty_in_stock: qty,
        buying_price: buyingPrice,
        date_of_entry: date,
      },
      {
        onSuccess: (data) => {
          if (photos.length > 0 && data) {
            uploadPhotos.mutate({ productId: data.id, files: photos });
          }
          setCategory(""); setBrand(""); setCustomBrand(""); setName("");
          setDescription(""); setQty(1); setBuyingPrice(0);
          setDate(new Date().toISOString().split("T")[0]);
          setPhotos([]);
          onClose();
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg modal-shadow w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 className="text-base font-semibold text-foreground">Add Product</h3>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setBrand(""); setCustomBrand(""); }} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm">
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Brand *</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" disabled={!category}>
                  <option value="">Select brand…</option>
                  {(brandsByCategory[category] || []).map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {brand === "Other" && (
                  <input type="text" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} placeholder="Enter brand name" className="w-full mt-1 px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HP EliteBook 840 G6" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description / Specs</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Specifications, notes…" rows={2} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity *</label>
                <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Buying Price (ETB) *</label>
                <input type="number" min={0} value={buyingPrice || ""} onChange={(e) => setBuyingPrice(parseFloat(e.target.value) || 0)} placeholder="Enter buying price (ETB)" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground/60" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Entry</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
            </div>

            <PhotoUploadField files={photos} onChange={setPhotos} />
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
            <button onClick={onClose} className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={addProduct.isPending} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {addProduct.isPending ? "Adding…" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
