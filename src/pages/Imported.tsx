import { useState } from "react";
import { Search, Plus, FileDown } from "lucide-react";
import { importRecords, formatETB, formatDateTime, relativeTime } from "@/data/mockData";
import DetailDrawer from "@/components/shared/DetailDrawer";
import AddImportModal from "@/components/shared/AddImportModal";
import type { ImportRecord } from "@/data/mockData";

export default function Imported() {
  const [search, setSearch] = useState("");
  const [drawerImport, setDrawerImport] = useState<ImportRecord | null>(null);
  const [showAddImport, setShowAddImport] = useState(false);

  const filtered = importRecords.filter((r) =>
    !search || r.lines.some((l) =>
      `${l.product_name} ${l.model} ${l.sku}`.toLowerCase().includes(search.toLowerCase())
    ) || r.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-sm flex-1 min-w-[200px] max-w-[360px]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search imports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground"
            aria-label="Search imports"
          />
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
          <FileDown className="w-4 h-4" /> Export
        </button>
        <button
          onClick={() => setShowAddImport(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Import
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Import records">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Product(s)</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Brand</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Qty</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Unit Price</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Total Cost</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) =>
                r.lines.map((line, li) => (
                  <tr
                    key={`${r.import_id}-${li}`}
                    onClick={() => setDrawerImport(r)}
                    className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setDrawerImport(r)}
                    role="button"
                    aria-label={`View import ${r.import_id}`}
                  >
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {li === 0 && <>{formatDateTime(r.date)}<br /><span className="text-muted-foreground/60">{relativeTime(r.date)}</span></>}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{line.product_name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{line.brand}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{line.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">{line.qty}</td>
                    <td className="px-4 py-2.5 text-right">{formatETB(line.unit_buying_price)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatETB(line.qty * line.unit_buying_price)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{li === 0 ? r.supplier : ""}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{li === 0 ? r.entered_by : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailDrawer open={!!drawerImport} onClose={() => setDrawerImport(null)} title={drawerImport ? `Import ${drawerImport.import_id}` : ""}>
        {drawerImport && (
          <div className="space-y-4 text-sm">
            <div><span className="text-muted-foreground">Date & Time</span><div className="font-medium">{formatDateTime(drawerImport.date)}</div></div>
            <div><span className="text-muted-foreground">Supplier</span><div className="font-medium">{drawerImport.supplier}</div></div>
            <div><span className="text-muted-foreground">Entered By</span><div className="font-medium">{drawerImport.entered_by}</div></div>
            <div className="h-px bg-border" />
            <h4 className="font-medium">Line Items</h4>
            {drawerImport.lines.map((line, i) => (
              <div key={i} className="rounded-md border border-border p-3 space-y-1">
                <div className="font-medium">{line.product_name} ({line.model})</div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Qty: {line.qty}</span>
                  <span>Unit: {formatETB(line.unit_buying_price)}</span>
                  <span className="font-medium text-foreground">Total: {formatETB(line.qty * line.unit_buying_price)}</span>
                </div>
              </div>
            ))}
            {drawerImport.attachments.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div><span className="text-muted-foreground">Attachments</span>
                  {drawerImport.attachments.map((a, i) => (
                    <div key={i} className="text-info font-medium">{a}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </DetailDrawer>

      <AddImportModal open={showAddImport} onClose={() => setShowAddImport(false)} />
    </div>
  );
}
