import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CreateInvoice } from "./pages/CreateInvoice";
import { InvoicesList } from "./pages/InvoicesList";
import { Quotations, Customers } from "./pages/PlaceholderPages";
import Reports from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Portfolio } from "./pages/Portfolio";
import "./styles/global.css";

function App() {
  return (
    <AuthProvider>
      <InvoiceProvider>
        <Router>
          <Routes>
            {/* Main landing page - Portfolio */}
            <Route path="/" element={<Portfolio />} />

            {/* Invoice App Routes - accessible only via /app/* */}
            <Route path="/app/login" element={<Login />} />
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <div className="app">
                    <Sidebar />
                    <div className="main-content">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route
                          path="/create-invoice"
                          element={<CreateInvoice />}
                        />
                        <Route path="/invoices" element={<InvoicesList />} />
                        <Route path="/quotations" element={<Quotations />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </InvoiceProvider>
    </AuthProvider>
  );
}

export default App;
