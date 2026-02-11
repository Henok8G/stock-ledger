import { User, Building2, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
            <input type="text" defaultValue="Abebe Mekonnen" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
            <input type="email" defaultValue="abebe@techstock.et" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
            <input type="text" defaultValue="Owner" disabled className="w-full px-3 py-1.5 rounded-md border border-border bg-accent text-sm text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Company
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
            <input type="text" defaultValue="TechStock ET" className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
            <input type="text" defaultValue="ETB (Ethiopian Birr)" disabled className="w-full px-3 py-1.5 rounded-md border border-border bg-accent text-sm text-muted-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Timezone</label>
            <input type="text" defaultValue="GMT+3 (East Africa Time)" disabled className="w-full px-3 py-1.5 rounded-md border border-border bg-accent text-sm text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications & Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Low Stock Alerts</div>
              <div className="text-xs text-muted-foreground">Notify when stock drops below threshold</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Threshold:</label>
              <input type="number" defaultValue={3} className="w-16 px-2 py-1 rounded-md border border-border bg-background text-sm text-center" />
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Out of Stock Alerts</div>
              <div className="text-xs text-muted-foreground">Highlight items with zero quantity</div>
            </div>
            <span className="text-xs text-success font-medium">Enabled</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Roles & Permissions
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
            <span className="font-medium">Owner</span>
            <span className="text-xs text-muted-foreground">Full access — import, sell, void, adjust, delete</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
            <span className="font-medium">Manager</span>
            <span className="text-xs text-muted-foreground">Add, edit, import, sell — no void/delete</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
            <span className="font-medium">Viewer</span>
            <span className="text-xs text-muted-foreground">Read-only access</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 card-shadow">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" /> Data & Export
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Export All Data (CSV)</button>
          <button className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Export All Data (PDF)</button>
          <button className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Monthly Report</button>
          <button className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">Quarterly Report</button>
        </div>
      </div>
    </div>
  );
}
