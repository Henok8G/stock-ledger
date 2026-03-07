import { useState } from "react";
import {
  Search, Plus, FileDown, MoreHorizontal, Pencil, Trash2, Grid3X3, List,
  ShoppingCart,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProducts, useDeleteProduct, useUpdateProduct, type Product } from "@/hooks/useProducts";
import { formatETB, formatDate } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import AddProductModal from "@/components/shared/AddProductModal";
import SoldModal from "@/components/shared/SoldModal";
import PhotoGallery from "@/components/shared/PhotoGallery";
import PhotoUploadField from "@/components/shared/PhotoUploadField";
import { useUploadProductPhotos } from "@/hooks/useProductPhotos";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const categories = ["All", "Laptop", "Mouse", "Keyboard", "Mic", "Accessory", "Storage", "Peripheral", "Misc"];
const brands = ["All", "HP", "Lenovo", "Dell", "Asus", "Chromebook", "Logitech", "Blue", "Seagate", "SanDisk", "Rain Design"];

export default function Inventory() {
  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const uploadPhotos = useUploadProductPhotos();
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [soldProduct, setSoldProduct] = useState<Product | null>(null);

  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [editPhotos, setEditPhotos] = useState<File[]>([]);

  const filtered = products.filter((p) => {
    if (p.qty_in_stock <= 0) return false;
    if (search && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (brandFilter !== "All" && p.brand !== brandFilter) return false;
    return true;
  });

  const handleExport = () => {
    const headers = ["Name", "Brand", "Category", "Buying Price", "Date Added"];
    const rows = filtered.map(p => [p.name, p.brand, p.category, p.buying_price, p.date_of_entry]);
    exportToCsv("inventory.csv", headers, rows);
    toast({ title: "Exported", description: `${filtered.length} products exported to CSV.` });
  };

  const handleDelete = (p: Product) => {
    if (role !== "owner") {
      toast({ title: "Permission Denied", description: "Only owners can delete products.", variant: "destructive" });
      return;
    }
    deleteProduct.mutate(p.id);
    setDrawerProduct(null);
  };

  const openEdit = (p: Product) => {
    if (role !== "owner") {
      toast({ title: "Permission Denied", description: "Only owners can edit products.", variant: "destructive" });
      return;
    }
    setEditProduct(p);
    setEditName(p.name);
    setEditQty(p.qty_in_stock);
    setEditPrice(Number(p.buying_price));
    setEditDesc(p.description || "");
    setEditPhotos([]);
    setDrawerProduct(null);
  };

  const handleSaveEdit = () => {
    if (!editProduct) return;
    updateProduct.mutate({
      id: editProduct.id,
      name: editName,
      qty_in_stock: editQty,
      buying_price: editPrice,
      description: editDesc,
    }, {
      onSuccess: () => {
        if (editPhotos.length > 0) {
          uploadPhotos.mutate({ productId: editProduct.id, files: editPhotos });
        }
        setEditProduct(null);
        setEditPhotos([]);
      }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground text-[13px]">Loading inventory…</div>;

  const selectClass = "px-3 py-[7px] rounded-lg border border-border bg-card text-[13px] text-foreground hover:border-ring/30 transition-colors";

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-[7px] rounded-lg bg-accent/50 border border-border/50 text-[13px] flex-1 min-w-[200px] max-w-[340px] overflow-hidden">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-40" />
          <input type="text" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/40 text-foreground truncate" aria-label="Search inventory" />
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
        </select>

        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={selectClass}>
          {brands.map((b) => <option key={b} value={b}>{b === "All" ? "All Brands" : b}</option>)}
        </select>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 bg-muted/30">
          <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-card text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-card text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"}`}><Grid3X3 className="w-4 h-4" /></button>
        </div>

        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-[7px] rounded-lg border border-border bg-card text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">
          <FileDown className="w-3.5 h-3.5" /> Export
        </button>

        <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-3 py-[7px] rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>

      <p className="text-[12px] text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

      {viewMode === "table" ? (
        <div className="rounded-xl border border-border/80 bg-card card-shadow overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Item Name</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Brand</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Category</th>
                  <th className="text-right px-5 py-2.5 text-muted-foreground font-medium">Buying Price</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Date Added</th>
                  <th className="w-24 px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} onClick={() => setDrawerProduct(p)} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" role="button">
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.brand}</td>
                    <td className="px-5 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">{p.category}</span></td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatETB(Number(p.buying_price))}</td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px]">{formatDate(p.date_of_entry)}</td>
                    <td className="px-5 py-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {role === "owner" && (
                        <button
                          onClick={() => setSoldProduct(p)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[11px] font-semibold hover:bg-success/15 transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" /> Sold
                        </button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-accent transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(p)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => setDrawerProduct(p)} className="rounded-xl border border-border/80 bg-card p-4 card-shadow hover:card-shadow-hover hover:border-primary/15 cursor-pointer transition-all duration-200" role="button">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">{p.category}</span>
                {role === "owner" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSoldProduct(p); }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-semibold hover:bg-success/15 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" /> Sold
                  </button>
                )}
              </div>
              <h4 className="font-medium text-foreground mb-0.5 text-[13px]">{p.name}</h4>
              <p className="text-[12px] text-muted-foreground mb-3">{p.brand}</p>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold tabular-nums">{formatETB(Number(p.buying_price))}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DetailDrawer open={!!drawerProduct} onClose={() => setDrawerProduct(null)} title={drawerProduct?.name ?? ""}>
        {drawerProduct && (
          <div className="space-y-4 text-[13px]">
            <PhotoGallery productId={drawerProduct.id} allowUpload={role === "owner"} />
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground text-[12px]">SKU</span><div className="font-medium font-mono text-[12px] mt-0.5">{drawerProduct.sku}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Category</span><div className="font-medium mt-0.5">{drawerProduct.category}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Brand</span><div className="font-medium mt-0.5">{drawerProduct.brand}</div></div>
              <div><span className="text-muted-foreground text-[12px]">Buying Price</span><div className="font-medium mt-0.5 tabular-nums">{formatETB(Number(drawerProduct.buying_price))}</div></div>
              <div><span className="text-muted-foreground text-[12px]">In Stock</span><div className="font-medium mt-0.5">{drawerProduct.qty_in_stock}</div></div>
            </div>
            <div className="h-px bg-border" />
            <div><span className="text-muted-foreground text-[12px]">Description</span><div className="font-medium mt-1">{drawerProduct.description || "—"}</div></div>
            <div><span className="text-muted-foreground text-[12px]">Date of Entry</span><div className="font-medium mt-0.5">{formatDate(drawerProduct.date_of_entry)}</div></div>
            <div className="h-px bg-border" />
            <div className="flex gap-2">
              {role === "owner" && (
                <button onClick={() => setSoldProduct(drawerProduct)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success text-success-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all flex-1 justify-center">
                  <ShoppingCart className="w-3.5 h-3.5" /> Sold
                </button>
              )}
              <button onClick={() => openEdit(drawerProduct)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all flex-1 justify-center">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              {role === "owner" && (
                <button onClick={() => handleDelete(drawerProduct)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 text-destructive text-[13px] font-medium hover:bg-destructive/5 active:scale-[0.98] transition-all flex-1 justify-center">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      {editProduct && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/15 backdrop-blur-[3px]" onClick={() => setEditProduct(null)} aria-hidden />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl modal-shadow w-full max-w-md max-h-[90vh] flex flex-col p-6 space-y-4 animate-scale-in">
              <h3 className="text-[16px] font-semibold tracking-[-0.01em]">Edit Product</h3>
              <div className="flex-1 overflow-y-auto space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[13px] focus:ring-2 focus:ring-ring/20 focus:border-ring outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Quantity</label>
                    <input type="number" value={editQty} onChange={(e) => setEditQty(parseInt(e.target.value) || 0)} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[13px] focus:ring-2 focus:ring-ring/20 focus:border-ring outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Buying Price (ETB)</label>
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[13px] focus:ring-2 focus:ring-ring/20 focus:border-ring outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Description</label>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[13px] resize-none focus:ring-2 focus:ring-ring/20 focus:border-ring outline-none transition-all" />
                </div>
                <PhotoUploadField files={editPhotos} onChange={setEditPhotos} />
                <PhotoGallery productId={editProduct.id} allowUpload={false} />
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button onClick={() => setEditProduct(null)} className="px-4 py-2.5 rounded-lg border border-border text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all">Cancel</button>
                <button onClick={handleSaveEdit} disabled={updateProduct.isPending} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                  {updateProduct.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AddProductModal open={showAddProduct} onClose={() => setShowAddProduct(false)} />
      {soldProduct && <SoldModal open={!!soldProduct} onClose={() => setSoldProduct(null)} product={soldProduct} />}
    </div>
  );
}
