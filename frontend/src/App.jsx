import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Zones from "./pages/Zones";
import Slots from "./pages/Slots";
import Sessions from "./pages/Sessions";
import Payments from "./pages/Payments";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerSessions from "./pages/CustomerSessions";
import CustomerPayments from "./pages/CustomerPayments";
import "./App.css";

export default function App() {
  const { auth } = useAuth();

  if (!auth) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {auth.role === "admin" ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/payments" element={<Payments />} />
            </>
          ) : (
            <>
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/sessions" element={<CustomerSessions />} />
              <Route path="/payments" element={<CustomerPayments />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
