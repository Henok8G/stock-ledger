import { useState } from "react";
import {
  Search, Plus, FileDown, MoreHorizontal, Pencil, Trash2, Grid3X3, List,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProducts, useDeleteProduct, useUpdateProduct, type Product } from "@/hooks/useProducts";
import { formatETB, formatDate } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import AddProductModal from "@/components/shared/AddProductModal";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const categories = ["All", "Laptop", "Mouse", "Keyboard", "Mic", "Accessory", "Storage", "Peripheral", "Misc"];
const brands = ["All", "HP", "Lenovo", "Dell", "Asus", "Chromebook", "Logitech", "Blue", "Seagate", "SanDisk", "Rain Design"];
const stockFilters = ["All", "In Stock", "Low Stock", "Out of Stock"];

export default function Inventory() {
  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editDesc, setEditDesc] = useState("");

  const filtered = products.filter((p) => {
    if (search && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (brandFilter !== "All" && p.brand !== brandFilter) return false;
    if (stockFilter === "In Stock" && p.qty_in_stock <= 3) return false;
    if (stockFilter === "Low Stock" && (p.qty_in_stock === 0 || p.qty_in_stock > 3)) return false;
    if (stockFilter === "Out of Stock" && p.qty_in_stock !== 0) return false;
    // Hide out-of-stock products unless explicitly filtering for them
    if (stockFilter !== "Out of Stock" && p.qty_in_stock === 0) return false;
    return true;
  });

  const stockBadge = (qty: number) => {
    if (qty === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">Out of stock</span>;
    if (qty <= 3) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">Low ({qty})</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{qty} in stock</span>;
  };

  const handleExport = () => {
    const headers = ["Name", "Brand", "Category", "Stock", "Buying Price", "Date Added"];
    const rows = filtered.map(p => [p.name, p.brand, p.category, p.qty_in_stock, p.buying_price, p.date_of_entry]);
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
    setEditProduct(p);
    setEditName(p.name);
    setEditQty(p.qty_in_stock);
    setEditPrice(Number(p.buying_price));
    setEditDesc(p.description || "");
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
    }, { onSuccess: () => setEditProduct(null) });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading inventory…</div>;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-sm flex-1 min-w-[200px] max-w-[360px] overflow-hidden">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground truncate" aria-label="Search inventory" />
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-foreground">
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
        </select>

        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-foreground">
          {brands.map((b) => <option key={b} value={b}>{b === "All" ? "All Brands" : b}</option>)}
        </select>

        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-foreground">
          {stockFilters.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex-1" />

        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          <button onClick={() => setViewMode("table")} className={`p-1.5 rounded ${viewMode === "table" ? "bg-accent" : ""}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-accent" : ""}`}><Grid3X3 className="w-4 h-4" /></button>
        </div>

        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
          <FileDown className="w-4 h-4" /> Export
        </button>

        <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

      {viewMode === "table" ? (
        <div className="rounded-lg border border-border bg-card card-shadow overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Item Name</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Brand</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Stock</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Buying Price</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date Added</th>
                  <th className="w-12 px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} onClick={() => setDrawerProduct(p)} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors" role="button">
                    <td className="px-4 py-2.5 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{p.category}</span></td>
                    <td className="px-4 py-2.5 text-right">{stockBadge(p.qty_in_stock)}</td>
                    <td className="px-4 py-2.5 text-right">{formatETB(Number(p.buying_price))}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatDate(p.date_of_entry)}</td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-accent transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
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
            <div key={p.id} onClick={() => setDrawerProduct(p)} className="rounded-lg border border-border bg-card p-4 card-shadow hover:border-primary/30 cursor-pointer transition-colors" role="button">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{p.category}</span>
                {stockBadge(p.qty_in_stock)}
              </div>
              <h4 className="font-medium text-foreground mb-0.5 text-sm">{p.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{p.brand}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatETB(Number(p.buying_price))}</span>
                <span className="text-xs text-muted-foreground">{p.sku}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      <DetailDrawer open={!!drawerProduct} onClose={() => setDrawerProduct(null)} title={drawerProduct?.name ?? ""}>
        {drawerProduct && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">SKU</span><div className="font-medium font-mono text-xs">{drawerProduct.sku}</div></div>
              <div><span className="text-muted-foreground">Category</span><div className="font-medium">{drawerProduct.category}</div></div>
              <div><span className="text-muted-foreground">Brand</span><div className="font-medium">{drawerProduct.brand}</div></div>
              <div><span className="text-muted-foreground">Stock</span><div className="font-medium">{drawerProduct.qty_in_stock}</div></div>
              <div><span className="text-muted-foreground">Buying Price</span><div className="font-medium">{formatETB(Number(drawerProduct.buying_price))}</div></div>
            </div>
            <div className="h-px bg-border" />
            <div><span className="text-muted-foreground">Description</span><div className="font-medium mt-1">{drawerProduct.description || "—"}</div></div>
            <div><span className="text-muted-foreground">Date of Entry</span><div className="font-medium">{formatDate(drawerProduct.date_of_entry)}</div></div>
            <div className="h-px bg-border" />
            <div className="flex gap-2">
              <button onClick={() => openEdit(drawerProduct)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex-1 justify-center">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(drawerProduct)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex-1 justify-center">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Edit Modal */}
      {editProduct && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px]" onClick={() => setEditProduct(null)} aria-hidden />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-lg modal-shadow w-full max-w-md p-5 space-y-4 animate-fade-in">
              <h3 className="text-base font-semibold">Edit Product</h3>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
                  <input type="number" value={editQty} onChange={(e) => setEditQty(parseInt(e.target.value) || 0)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Buying Price (ETB)</label>
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditProduct(null)} className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent">Cancel</button>
                <button onClick={handleSaveEdit} disabled={updateProduct.isPending} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {updateProduct.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AddProductModal open={showAddProduct} onClose={() => setShowAddProduct(false)} />
    </div>
  );
}
