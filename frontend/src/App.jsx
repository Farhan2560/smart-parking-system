import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Zones from "./pages/Zones";
import Slots from "./pages/Slots";
import Sessions from "./pages/Sessions";
import Payments from "./pages/Payments";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zones" element={<Zones />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
