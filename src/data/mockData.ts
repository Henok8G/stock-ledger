// Mock data for the Tech Stock Management app

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  description: string;
  qty_in_stock: number;
  buying_price: number;
  location: string;
  supplier: string;
  date_of_entry: string;
  attachments: string[];
}

export interface ImportRecord {
  import_id: string;
  date: string;
  lines: { sku: string; qty: number; unit_buying_price: number; product_name?: string; model?: string; brand?: string; category?: string }[];
  supplier: string;
  attachments: string[];
  entered_by: string;
}

export interface SaleRecord {
  sale_id: string;
  date: string;
  sku: string;
  product_name: string;
  model: string;
  brand: string;
  category: string;
  qty: number;
  unit_selling_price: number;
  unit_buying_price: number;
  payment_method: "Cash" | "Card" | "Mobile";
  attachment: string;
  profit: number;
  entered_by: string;
}

export const products: Product[] = [
  { sku: "LAP-HP-ELITE-840", name: "HP EliteBook 840 G6", brand: "HP", category: "Laptop", model: "840 G6", description: "14\" FHD, i5-8365U, 8GB RAM, 256GB SSD", qty_in_stock: 6, buying_price: 45000, location: "Warehouse A", supplier: "Local Distributor", date_of_entry: "2026-02-10", attachments: [] },
  { sku: "LAP-LEN-T480", name: "Lenovo ThinkPad T480", brand: "Lenovo", category: "Laptop", model: "T480", description: "14\" FHD, i5-8250U, 8GB RAM, 256GB SSD", qty_in_stock: 4, buying_price: 38000, location: "Warehouse A", supplier: "TechSupply ET", date_of_entry: "2026-02-08", attachments: [] },
  { sku: "LAP-DELL-5590", name: "Dell Latitude 5590", brand: "Dell", category: "Laptop", model: "5590", description: "15.6\" FHD, i7-8650U, 16GB RAM, 512GB SSD", qty_in_stock: 3, buying_price: 52000, location: "Warehouse B", supplier: "Dell Partner", date_of_entry: "2026-02-05", attachments: [] },
  { sku: "LAP-CHROME-C340", name: "Lenovo Chromebook C340", brand: "Chromebook", category: "Laptop", model: "C340", description: "11.6\" HD, Celeron N4000, 4GB RAM, 64GB eMMC", qty_in_stock: 12, buying_price: 18000, location: "Warehouse A", supplier: "Local Distributor", date_of_entry: "2026-02-01", attachments: [] },
  { sku: "ACC-MOUSE-LOG-M590", name: "Logitech M590 Mouse", brand: "Logitech", category: "Mouse", model: "M590", description: "Silent wireless mouse, Bluetooth + USB", qty_in_stock: 25, buying_price: 1200, location: "Shelf C1", supplier: "Peripheral Hub", date_of_entry: "2026-01-28", attachments: [] },
  { sku: "ACC-KB-LOG-K380", name: "Logitech K380 Keyboard", brand: "Logitech", category: "Keyboard", model: "K380", description: "Multi-device Bluetooth keyboard", qty_in_stock: 18, buying_price: 1800, location: "Shelf C2", supplier: "Peripheral Hub", date_of_entry: "2026-01-28", attachments: [] },
  { sku: "ACC-MIC-BLUE-YETI", name: "Blue Yeti Microphone", brand: "Blue", category: "Mic", model: "Yeti", description: "USB condenser mic, 4 pickup patterns", qty_in_stock: 2, buying_price: 5500, location: "Shelf D1", supplier: "AudioTech", date_of_entry: "2026-01-20", attachments: [] },
  { sku: "ACC-HDD-SEA-2TB", name: "Seagate 2TB External HDD", brand: "Seagate", category: "Accessory", model: "Expansion 2TB", description: "USB 3.0 portable hard drive", qty_in_stock: 8, buying_price: 3200, location: "Shelf B1", supplier: "StoragePlus", date_of_entry: "2026-02-03", attachments: [] },
  { sku: "ACC-FLASH-SAN-64", name: "SanDisk 64GB Flash Drive", brand: "SanDisk", category: "Accessory", model: "Ultra Flair 64GB", description: "USB 3.0, 150MB/s read", qty_in_stock: 40, buying_price: 350, location: "Shelf B2", supplier: "StoragePlus", date_of_entry: "2026-01-15", attachments: [] },
  { sku: "ACC-STAND-RAIN", name: "Rain Design mStand", brand: "Rain Design", category: "Accessory", model: "mStand", description: "Aluminum laptop stand", qty_in_stock: 0, buying_price: 2800, location: "Shelf D2", supplier: "DesignTech", date_of_entry: "2026-01-10", attachments: [] },
  { sku: "LAP-ASUS-VIVO", name: "Asus VivoBook 15", brand: "Asus", category: "Laptop", model: "X515EA", description: "15.6\" FHD, i3-1115G4, 8GB RAM, 256GB SSD", qty_in_stock: 1, buying_price: 28000, location: "Warehouse A", supplier: "Local Distributor", date_of_entry: "2026-02-09", attachments: [] },
];

export const importRecords: ImportRecord[] = [
  { import_id: "IMP-20260210-01", date: "2026-02-10T09:30:00+03:00", lines: [{ sku: "LAP-HP-ELITE-840", qty: 6, unit_buying_price: 45000, product_name: "HP EliteBook 840 G6", model: "840 G6", brand: "HP", category: "Laptop" }], supplier: "Local Distributor", attachments: ["invoice.pdf"], entered_by: "admin" },
  { import_id: "IMP-20260208-02", date: "2026-02-08T14:15:00+03:00", lines: [{ sku: "LAP-LEN-T480", qty: 4, unit_buying_price: 38000, product_name: "Lenovo ThinkPad T480", model: "T480", brand: "Lenovo", category: "Laptop" }], supplier: "TechSupply ET", attachments: [], entered_by: "admin" },
  { import_id: "IMP-20260205-03", date: "2026-02-05T11:00:00+03:00", lines: [{ sku: "LAP-DELL-5590", qty: 5, unit_buying_price: 52000, product_name: "Dell Latitude 5590", model: "5590", brand: "Dell", category: "Laptop" }], supplier: "Dell Partner", attachments: ["invoice.pdf"], entered_by: "manager1" },
  { import_id: "IMP-20260201-04", date: "2026-02-01T10:00:00+03:00", lines: [{ sku: "LAP-CHROME-C340", qty: 15, unit_buying_price: 18000, product_name: "Lenovo Chromebook C340", model: "C340", brand: "Chromebook", category: "Laptop" }], supplier: "Local Distributor", attachments: [], entered_by: "admin" },
  { import_id: "IMP-20260128-05", date: "2026-01-28T09:00:00+03:00", lines: [{ sku: "ACC-MOUSE-LOG-M590", qty: 30, unit_buying_price: 1200, product_name: "Logitech M590 Mouse", model: "M590", brand: "Logitech", category: "Mouse" }, { sku: "ACC-KB-LOG-K380", qty: 20, unit_buying_price: 1800, product_name: "Logitech K380 Keyboard", model: "K380", brand: "Logitech", category: "Keyboard" }], supplier: "Peripheral Hub", attachments: ["invoice.pdf"], entered_by: "admin" },
  { import_id: "IMP-20260203-06", date: "2026-02-03T15:30:00+03:00", lines: [{ sku: "ACC-HDD-SEA-2TB", qty: 10, unit_buying_price: 3200, product_name: "Seagate 2TB External HDD", model: "Expansion 2TB", brand: "Seagate", category: "Accessory" }], supplier: "StoragePlus", attachments: [], entered_by: "manager1" },
  { import_id: "IMP-20260209-07", date: "2026-02-09T08:45:00+03:00", lines: [{ sku: "LAP-ASUS-VIVO", qty: 3, unit_buying_price: 28000, product_name: "Asus VivoBook 15", model: "X515EA", brand: "Asus", category: "Laptop" }], supplier: "Local Distributor", attachments: [], entered_by: "admin" },
];

export const salesRecords: SaleRecord[] = [
  { sale_id: "S-20260211-001", date: "2026-02-11T14:35:00+03:00", sku: "LAP-HP-ELITE-840", product_name: "HP EliteBook 840 G6", model: "840 G6", brand: "HP", category: "Laptop", qty: 1, unit_selling_price: 52000, unit_buying_price: 45000, payment_method: "Cash", attachment: "", profit: 7000, entered_by: "admin" },
  { sale_id: "S-20260211-002", date: "2026-02-11T11:20:00+03:00", sku: "ACC-MOUSE-LOG-M590", product_name: "Logitech M590 Mouse", model: "M590", brand: "Logitech", category: "Mouse", qty: 3, unit_selling_price: 1800, unit_buying_price: 1200, payment_method: "Mobile", attachment: "", profit: 1800, entered_by: "manager1" },
  { sale_id: "S-20260210-003", date: "2026-02-10T16:10:00+03:00", sku: "LAP-DELL-5590", product_name: "Dell Latitude 5590", model: "5590", brand: "Dell", category: "Laptop", qty: 2, unit_selling_price: 62000, unit_buying_price: 52000, payment_method: "Card", attachment: "", profit: 20000, entered_by: "admin" },
  { sale_id: "S-20260210-004", date: "2026-02-10T10:45:00+03:00", sku: "ACC-KB-LOG-K380", product_name: "Logitech K380 Keyboard", model: "K380", brand: "Logitech", category: "Keyboard", qty: 2, unit_selling_price: 2600, unit_buying_price: 1800, payment_method: "Cash", attachment: "", profit: 1600, entered_by: "admin" },
  { sale_id: "S-20260209-005", date: "2026-02-09T15:30:00+03:00", sku: "LAP-CHROME-C340", product_name: "Lenovo Chromebook C340", model: "C340", brand: "Chromebook", category: "Laptop", qty: 3, unit_selling_price: 24000, unit_buying_price: 18000, payment_method: "Mobile", attachment: "", profit: 18000, entered_by: "manager1" },
  { sale_id: "S-20260208-006", date: "2026-02-08T09:00:00+03:00", sku: "ACC-FLASH-SAN-64", product_name: "SanDisk 64GB Flash Drive", model: "Ultra Flair 64GB", brand: "SanDisk", category: "Accessory", qty: 5, unit_selling_price: 550, unit_buying_price: 350, payment_method: "Cash", attachment: "", profit: 1000, entered_by: "admin" },
  { sale_id: "S-20260207-007", date: "2026-02-07T14:00:00+03:00", sku: "ACC-HDD-SEA-2TB", product_name: "Seagate 2TB External HDD", model: "Expansion 2TB", brand: "Seagate", category: "Accessory", qty: 2, unit_selling_price: 4500, unit_buying_price: 3200, payment_method: "Card", attachment: "", profit: 2600, entered_by: "admin" },
  { sale_id: "S-20260206-008", date: "2026-02-06T11:15:00+03:00", sku: "LAP-LEN-T480", product_name: "Lenovo ThinkPad T480", model: "T480", brand: "Lenovo", category: "Laptop", qty: 1, unit_selling_price: 46000, unit_buying_price: 38000, payment_method: "Mobile", attachment: "", profit: 8000, entered_by: "manager1" },
  { sale_id: "S-20260205-009", date: "2026-02-05T16:45:00+03:00", sku: "ACC-MIC-BLUE-YETI", product_name: "Blue Yeti Microphone", model: "Yeti", brand: "Blue", category: "Mic", qty: 1, unit_selling_price: 7500, unit_buying_price: 5500, payment_method: "Cash", attachment: "", profit: 2000, entered_by: "admin" },
  { sale_id: "S-20260204-010", date: "2026-02-04T10:30:00+03:00", sku: "LAP-ASUS-VIVO", product_name: "Asus VivoBook 15", model: "X515EA", brand: "Asus", category: "Laptop", qty: 2, unit_selling_price: 35000, unit_buying_price: 28000, payment_method: "Cash", attachment: "", profit: 14000, entered_by: "admin" },
  { sale_id: "S-20260203-011", date: "2026-02-03T13:00:00+03:00", sku: "ACC-MOUSE-LOG-M590", product_name: "Logitech M590 Mouse", model: "M590", brand: "Logitech", category: "Mouse", qty: 2, unit_selling_price: 1800, unit_buying_price: 1200, payment_method: "Cash", attachment: "", profit: 1200, entered_by: "admin" },
  { sale_id: "S-20260202-012", date: "2026-02-02T09:15:00+03:00", sku: "ACC-FLASH-SAN-64", product_name: "SanDisk 64GB Flash Drive", model: "Ultra Flair 64GB", brand: "SanDisk", category: "Accessory", qty: 10, unit_selling_price: 550, unit_buying_price: 350, payment_method: "Mobile", attachment: "", profit: 2000, entered_by: "manager1" },
];

export const profitOverTime = [
  { date: "Jan 15", profit: 12000, revenue: 45000, cost: 33000 },
  { date: "Jan 18", profit: 8500, revenue: 32000, cost: 23500 },
  { date: "Jan 22", profit: 15000, revenue: 58000, cost: 43000 },
  { date: "Jan 25", profit: 7200, revenue: 28000, cost: 20800 },
  { date: "Jan 28", profit: 21000, revenue: 72000, cost: 51000 },
  { date: "Feb 01", profit: 18000, revenue: 64000, cost: 46000 },
  { date: "Feb 03", profit: 3200, revenue: 14500, cost: 11300 },
  { date: "Feb 05", profit: 22000, revenue: 75000, cost: 53000 },
  { date: "Feb 07", profit: 4600, revenue: 13000, cost: 8400 },
  { date: "Feb 09", profit: 32000, revenue: 107000, cost: 75000 },
  { date: "Feb 11", profit: 8800, revenue: 57400, cost: 48600 },
];

export const unitsSoldByCategory = [
  { category: "Laptop", units: 9 },
  { category: "Mouse", units: 5 },
  { category: "Keyboard", units: 2 },
  { category: "Accessory", units: 17 },
  { category: "Mic", units: 1 },
];

export const stockByCategory = [
  { name: "Laptop", value: 26, color: "hsl(222, 84%, 11%)" },
  { name: "Mouse", value: 25, color: "hsl(210, 92%, 45%)" },
  { name: "Keyboard", value: 18, color: "hsl(142, 60%, 40%)" },
  { name: "Accessory", value: 48, color: "hsl(38, 92%, 50%)" },
  { name: "Mic", value: 2, color: "hsl(0, 72%, 51%)" },
];

export const topSellingModels = [
  { model: "Ultra Flair 64GB", brand: "SanDisk", sold: 15, category: "Accessory" },
  { model: "840 G6", brand: "HP", sold: 1, category: "Laptop" },
  { model: "M590", brand: "Logitech", sold: 5, category: "Mouse" },
  { model: "C340", brand: "Chromebook", sold: 3, category: "Laptop" },
  { model: "X515EA", brand: "Asus", sold: 2, category: "Laptop" },
];

export function formatETB(amount: number): string {
  return new Intl.NumberFormat("en-ET", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + " ETB";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " — " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
