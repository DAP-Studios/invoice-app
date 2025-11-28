# Invoice & Quotation Management System - Setup Guide

## Project Structure

```
invoice-app/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ItemsTable.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Table.tsx
│   │   └── TotalsTable.tsx
│   ├── context/           # React Context for state management
│   │   └── InvoiceContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useDashboardStats.ts
│   ├── pages/             # Page components
│   │   ├── CreateInvoice.tsx
│   │   ├── Dashboard.tsx
│   │   ├── InvoicesList.tsx
│   │   ├── PlaceholderPages.tsx
│   │   └── Settings.tsx
│   ├── styles/            # Global styles
│   │   └── global.css
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── invoiceUtils.ts
│   │   └── storage.ts
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite types
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tsconfig.node.json     # TypeScript config for Node
├── vite.config.ts         # Vite config
└── README.md              # Documentation
```

## Installation Steps

### 1. Navigate to the project directory
```bash
cd "t:\DAP Tech\Creative Infra\invoice-app"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for production
```bash
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview production build
```bash
npm run preview
```

## Features

### ✅ Implemented
- **Dashboard**: View statistics and recent invoices
- **Create Invoice/Quotation**: Generate professional A4 invoices
- **Invoice Management**: List, search, filter, and delete invoices
- **Settings**: Configure company details, bank information, and terms
- **Local Storage**: All data persists in browser
- **Print-ready**: Optimized for A4 paper printing
- **Responsive Design**: Works on desktop and tablet
- **Auto-numbering**: Automatic invoice number generation
- **GST Calculations**: Automatic tax calculations with editable rates
- **Logo Upload**: Add company logo to invoices

### 📋 Pages
1. **Dashboard** (`/`) - Overview with stats
2. **Create Invoice** (`/create-invoice`) - Invoice/quotation creation
3. **All Invoices** (`/invoices`) - Invoice list with search/filter
4. **Quotations** (`/quotations`) - Placeholder for quotations
5. **Customers** (`/customers`) - Placeholder for customer management
6. **Reports** (`/reports`) - Placeholder for reports
7. **Settings** (`/settings`) - Company and system settings

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS Modules** - Component-scoped styling
- **Local Storage** - Data persistence

## Key Components

### Context & State Management
- `InvoiceContext` - Global state for invoices and settings
- `useInvoices` - Hook to access invoice context
- `useDashboardStats` - Hook for dashboard statistics

### Utilities
- `invoiceUtils.ts` - Invoice number generation, calculations, formatting
- `storage.ts` - Local storage operations

### Reusable Components
- `Button` - Styled button with variants
- `Badge` - Status badges (Paid, Pending, Draft)
- `Card` - Container component
- `Sidebar` - Navigation sidebar
- `Table` - Generic data table
- `ItemsTable` - Invoice items editor
- `TotalsTable` - Tax and total calculations

## Usage

### First Time Setup
1. Go to **Settings** page
2. Fill in your company information
3. Upload company logo (optional)
4. Add bank details
5. Customize terms & conditions
6. Click **Save Settings**

### Creating an Invoice
1. Click **Create Invoice** from sidebar
2. Fill in customer details
3. Add/edit items in the table
4. Adjust GST rates if needed
5. Click **Save Invoice**
6. Print using the Print button

### Managing Invoices
- View all invoices in the **All Invoices** page
- Search by invoice number or customer name
- Filter by status (Paid, Pending, Draft)
- Delete unwanted invoices

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add routes in `src/App.tsx`
4. Update types in `src/types/`
5. Add utilities in `src/utils/`

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes
- All data is stored in browser's localStorage
- Clear browser data will remove all invoices and settings
- Print functionality works best in Chrome/Edge
- A4 size optimized for international paper standard

## Future Enhancements
- Export to PDF
- Email invoices
- Customer database
- Quotation management
- Reports and analytics
- Multi-currency support
- Cloud sync
- User authentication

## Troubleshooting

### Port already in use
If port 5173 is busy, Vite will automatically use the next available port.

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## Support
For issues or questions, refer to:
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
