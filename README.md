# 📦 Inventory & Sales Management System

A modern inventory and sales management system built for small and medium retail/wholesale businesses.  
Designed to track products from import to sale, monitor stock levels, and calculate profit automatically (ETB supported).

---

## 🚀 Project Info

- 🔗 **Repository:** https://github.com/Henok8G/inventory-sales-system
  
---

## 🎯 Purpose

This system helps business owners:

- Track imported products
- Monitor live inventory
- Record sales with automatic stock deduction
- Calculate profit instantly
- Analyze performance through dashboards
- Export business data as CSV

Built especially for small businesses operating in Ethiopia and similar markets.

---

## 🔁 Core Workflow

### 1️⃣ Import Products
- Add supplier details
- Enter quantity and buying price
- Auto-generate SKU
- Automatically update stock

### 2️⃣ Manage Inventory
- View active products
- Sold-out items auto-hide
- Filter by category
- Monitor low stock
- Export inventory as CSV

### 3️⃣ Record Sales
- Enter selling price
- Select payment method
- Automatic:
  - Stock deduction
  - Profit calculation
- Sales history stored

### 4️⃣ Analyze Performance
Dashboard includes:
- Total active products
- Items sold
- Items imported
- Total profit
- Sales by category chart
- Stock distribution chart
- Recent sales table

### 5️⃣ Role-Based Access

| Role    | Permissions |
|----------|------------|
| Owner   | Full access (import, sell, manage, delete) |
| Manager | Can import & view, cannot record sales |

---

## 🛠 Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui

---

## 💻 How To Run Locally

Make sure you have **Node.js & npm** installed.

```bash
# Clone the repository
git clone https://github.com/Henok8G/inventory-sales-system.git

# Navigate into project
cd inventory-sales-system

# Install dependencies
npm install

# Start development server
npm run dev
