import { useState } from "react";
import { Search, Plus, FileDown, MoreHorizontal, Trash2, Pencil, ShoppingCart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useImports, useDeleteImport, type ImportRecord } from "@/hooks/useImports";
import { useProducts, type Product } from "@/hooks/useProducts";
import { formatETB, formatDateTime } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import AddImportModal from "@/components/shared/AddImportModal";
import SoldModal from "@/components/shared/SoldModal";
import PhotoGallery from "@/components/shared/PhotoGallery";
import EditImportModal from "@/components/shared/EditImportModal";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Imported() {
  const { data: imports = [], isLoading } = useImports();
  const { data: products = [] } = useProducts();
  const deleteImport = useDeleteImport();
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [drawerImport, setDrawerImport] = useState<ImportRecord | null>(null);
  const [showAddImport, setShowAddImport] = useState(false);
  const [soldProduct, setSoldProduct] = useState<Product | null>(null);
  const [editImport, setEditImport] = useState<ImportRecord | null>(null);

  const filtered = imports.filter((r) =>
    !search || r.import_line_items.some((l) =>
      `${l.product_name} ${l.brand}`.toLowerCase().includes(search.toLowerCase())
    ) || r.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["Date", "Product", "Brand", "Category", "Qty", "Unit Price", "Total", "Supplier"];
    const rows = filtered.flatMap(r =>
      r.import_line_items.map(l => [formatDateTime(r.date), l.product_name, l.brand, l.category, l.qty, l.unit_buying_price, l.qty * Number(l.unit_buying_price), r.supplier])
    );
    exportToCsv("imports.csv", headers, rows);
    toast({ title: "Exported", description: `${rows.length} import lines exported to CSV.` });
  };

  const handleDelete = (r: ImportRecord) => {
    if (role !== "owner") {
      toast({ title: "Permission Denied", description: "Only owners can delete imports.", variant: "destructive" });
      return;
    }
    deleteImport.mutate(r.id);
    setDrawerImport(null);
  };

  const findProductForLine = (line: { product_name: string; brand: string }) => {
    return products.find(p => p.name === line.product_name && p.brand === line.brand && p.qty_in_stock > 0);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading imports…</div>;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-sm flex-1 min-w-[200px] max-w-[360px] overflow-hidden">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground truncate" />
        </div>
        <div className="flex-1" />
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
          <FileDown className="w-4 h-4" /> Export
        </button>
        <button onClick={() => setShowAddImport(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Import
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card card-shadow overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Product(s)</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Brand</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Unit Price</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Total Cost</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Supplier</th>
                <th className="w-24 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) =>
                r.import_line_items.map((line, li) => {
                  const matchedProduct = findProductForLine(line);
                  return (
                    <tr key={`${r.id}-${li}`} onClick={() => setDrawerImport(r)} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors" role="button">
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {li === 0 && formatDateTime(r.date)}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{line.product_name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{line.brand}</td>
                      <td className="px-4 py-2.5"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{line.category}</span></td>
                      <td className="px-4 py-2.5 text-right">{line.qty}</td>
                      <td className="px-4 py-2.5 text-right">{formatETB(Number(line.unit_buying_price))}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatETB(line.qty * Number(line.unit_buying_price))}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {li === 0 && (
                          <div className="flex flex-col">
                            <span>{r.supplier}</span>
                            {r.entered_by_role && (
                              <span className="text-xs capitalize text-muted-foreground/70">Added by {r.entered_by_role}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {role === "owner" && matchedProduct && (
                          <button
                            onClick={() => setSoldProduct(matchedProduct)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3" /> Sold
                          </button>
                        )}
                        {li === 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-accent transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              {role === "owner" && (
                                <DropdownMenuItem onClick={() => { setEditImport(r); setDrawerImport(null); }}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(r)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No imports recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailDrawer open={!!drawerImport} onClose={() => setDrawerImport(null)} title="Import Details">
        {drawerImport && (
          <div className="space-y-4 text-sm">
            <div><span className="text-muted-foreground">Date</span><div className="font-medium">{formatDateTime(drawerImport.date)}</div></div>
            <div><span className="text-muted-foreground">Supplier</span><div className="font-medium">{drawerImport.supplier}</div></div>
            <div className="h-px bg-border" />
            <h4 className="font-medium">Line Items</h4>
            {drawerImport.import_line_items.map((line, i) => {
              const matchedProduct = findProductForLine(line);
              return (
                <div key={i} className="rounded-md border border-border p-3 space-y-2">
                  <div className="font-medium">{line.product_name}</div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Qty: {line.qty}</span>
                    <span>Unit: {formatETB(Number(line.unit_buying_price))}</span>
                    <span className="font-medium text-foreground">Total: {formatETB(line.qty * Number(line.unit_buying_price))}</span>
                  </div>
                  {matchedProduct && <PhotoGallery productId={matchedProduct.id} allowUpload={role === "owner"} />}
                </div>
              );
            })}
            <div className="h-px bg-border" />
            <div className="flex gap-2">
              {role === "owner" && (
                <button onClick={() => { setEditImport(drawerImport); setDrawerImport(null); }} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex-1 justify-center">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {role === "owner" && (
                <button onClick={() => handleDelete(drawerImport)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex-1 justify-center">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <AddImportModal open={showAddImport} onClose={() => setShowAddImport(false)} />
      {soldProduct && <SoldModal open={!!soldProduct} onClose={() => setSoldProduct(null)} product={soldProduct} />}
      {editImport && <EditImportModal open={!!editImport} onClose={() => setEditImport(null)} importRecord={editImport} />}
    </div>
  );
}
