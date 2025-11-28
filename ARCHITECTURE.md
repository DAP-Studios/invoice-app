# Invoice Management System - Component Architecture

## Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (BrowserRouter)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─ InvoiceProvider (Context)
                         │
        ┌────────────────┴────────────────┐
        │                                  │
   ┌────▼─────┐                   ┌───────▼────────┐
   │ Sidebar  │                   │ Main Content   │
   │          │                   │   (Routes)     │
   └──────────┘                   └───────┬────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
              ┌─────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
              │ Dashboard  │      │   Create    │      │  Settings   │
              │            │      │  Invoice    │      │             │
              └─────┬──────┘      └──────┬──────┘      └──────┬──────┘
                    │                    │                     │
          ┌─────────┴─────────┐  ┌───────┴────────┐   ┌───────┴────────┐
          │                   │  │                │   │                │
     ┌────▼────┐      ┌──────▼──▼─────┐   ┌─────▼────▼─────┐   ┌─────▼──────┐
     │StatCard │      │  ItemsTable   │   │  TotalsTable   │   │   Button   │
     └─────────┘      └───────────────┘   └────────────────┘   └────────────┘
```

## Component Hierarchy

### Layout Components
```
App
├── InvoiceProvider (Context)
│   └── Router
│       ├── Sidebar (Navigation)
│       └── MainContent (Route Outlet)
│           ├── Dashboard
│           ├── CreateInvoice
│           ├── InvoicesList
│           ├── Settings
│           └── PlaceholderPages
```

### Page Components Detail

#### Dashboard Page
```
Dashboard
├── StatCard (x4)
│   └── Card Component
└── DataTable
    ├── Table Header
    │   └── Button (Create New)
    └── Table Body
        └── Badge (Status)
```

#### CreateInvoice Page
```
CreateInvoice
├── ActionButtons
│   ├── Button (Back)
│   ├── Button (Toggle Type)
│   ├── Button (Save)
│   ├── Button (Clear)
│   └── Button (Print)
├── AlertBox (Invoice Number)
└── InvoiceContainer
    ├── HeaderSection
    │   ├── LogoSection
    │   └── CompanyInfo
    ├── DocHeader
    ├── InfoTable (Customer Details)
    ├── ItemsTable
    │   └── Item Rows (Dynamic)
    ├── TotalsTable
    │   └── Tax Inputs
    └── FooterSection
        ├── AmountWords
        ├── BankDetails
        ├── Terms
        └── Signature
```

#### InvoicesList Page
```
InvoicesList
├── PageHeader
│   └── Button (Create New)
├── SearchFilterBar
│   ├── SearchInput
│   └── StatusFilter
└── DataTable
    └── Table Rows
        ├── Badge (Status)
        └── Action Buttons
```

#### Settings Page
```
Settings
└── SettingsContainer
    ├── CompanySection
    │   ├── LogoUpload
    │   └── Form Inputs
    ├── BankSection
    │   └── Form Inputs
    ├── TermsSection
    │   └── Textarea
    └── FormActions
        └── Buttons
```

## Reusable Components

### UI Components
```
Button
├── Primary variant
└── Secondary variant
    └── Small size
    └── Medium size

Badge
├── Paid (green)
├── Pending (yellow)
└── Draft (gray)

Card
└── StatCard
    ├── Title
    ├── Value
    └── Subtext

Sidebar
└── Nav Items
    └── Links (with routing)

Table
└── Generic table component
    ├── Headers (dynamic)
    └── Rows (dynamic)
```

### Invoice Components
```
ItemsTable
├── Table Header
└── Item Rows
    ├── Editable Fields
    ├── Calculated Amount
    └── Remove Button
└── Add Row Button

TotalsTable
├── Subtotal Row
├── CGST Row (with input)
├── SGST Row (with input)
├── Total GST Row
└── Grand Total Row
```

## Data Flow

```
┌─────────────────────┐
│   LocalStorage      │
│  (Browser Storage)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  InvoiceContext     │
│  (Global State)     │
│                     │
│  - invoices[]       │
│  - settings{}       │
│  - addInvoice()     │
│  - updateInvoice()  │
│  - deleteInvoice()  │
│  - updateSettings() │
└──────────┬──────────┘
           │
           ├──► Dashboard (read)
           │    └─ useDashboardStats hook
           │
           ├──► CreateInvoice (write)
           │    └─ addInvoice()
           │
           ├──► InvoicesList (read/delete)
           │    └─ deleteInvoice()
           │
           └──► Settings (read/write)
                └─ updateSettings()
```

## State Management Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Context Method Call
    │
    ▼
State Update
    │
    ├──► LocalStorage Update
    │
    └──► React Re-render
         │
         ▼
    UI Updates
```

## Routing Structure

```
/                       → Dashboard
/create-invoice         → CreateInvoice
/invoices              → InvoicesList
/invoices/:id          → InvoiceDetail (future)
/quotations            → Quotations (placeholder)
/customers             → Customers (placeholder)
/reports               → Reports (placeholder)
/settings              → Settings
```

## Hook Dependencies

```
useInvoices
├── Used by: Dashboard, CreateInvoice, InvoicesList, Settings
└── Provides: invoices, settings, CRUD operations

useDashboardStats
├── Uses: useInvoices
├── Used by: Dashboard
└── Provides: calculated statistics

useNavigate (React Router)
├── Used by: All pages with navigation
└── Provides: programmatic navigation
```

## Utility Functions Flow

```
invoiceUtils.ts
├── generateInvoiceNumber()    → CreateInvoice
├── calculateSubtotal()        → CreateInvoice, ItemsTable
├── calculateTax()             → TotalsTable
├── calculateGrandTotal()      → CreateInvoice
├── formatCurrency()           → Dashboard, InvoicesList
├── formatDate()               → CreateInvoice
└── numberToWords()            → CreateInvoice

storage.ts
├── saveInvoices()             → InvoiceContext
├── loadInvoices()             → InvoiceContext
├── saveSettings()             → InvoiceContext
├── loadSettings()             → InvoiceContext
├── saveLogo()                 → Settings
└── loadLogo()                 → CreateInvoice, Settings
```

## Type System

```
types/index.ts
├── Invoice
│   ├── InvoiceItem[]
│   └── Status enum
├── CompanySettings
├── DashboardStats
└── Customer
```

## CSS Organization

```
global.css               → Base styles, resets
├── Dashboard.css        → Dashboard specific
├── CreateInvoice.css    → Invoice form specific
├── Settings.css         → Settings page specific
├── Button.css           → Button component
├── Badge.css            → Badge component
├── Card.css             → Card component
├── Sidebar.css          → Sidebar navigation
├── Table.css            → Table component
├── ItemsTable.css       → Items table specific
├── TotalsTable.css      → Totals table specific
└── Placeholder.css      → Placeholder pages
```

## Build Process

```
Source Files (TypeScript + JSX)
    │
    ▼
Vite Build Process
    ├── TypeScript Compilation
    ├── JSX Transformation
    ├── CSS Processing
    ├── Asset Optimization
    └── Code Splitting
    │
    ▼
Production Build (dist/)
    ├── index.html
    ├── assets/
    │   ├── index.[hash].js
    │   └── index.[hash].css
    └── vite.svg
```

## Component Communication Patterns

1. **Props Down**: Parent → Child data flow
2. **Events Up**: Child → Parent via callbacks
3. **Context**: Global state access
4. **Hooks**: Shared logic and state
5. **Router**: Navigation and URL state

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Reusable components
- ✅ Type safety throughout
- ✅ Efficient data flow
- ✅ Easy testing
- ✅ Scalable structure
