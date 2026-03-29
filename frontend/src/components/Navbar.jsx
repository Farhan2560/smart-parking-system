import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🅿</span>
        <span className="brand-title">Urban Smart Parking</span>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/zones" className={({ isActive }) => (isActive ? "active" : "")}>
            Zones
          </NavLink>
        </li>
        <li>
          <NavLink to="/slots" className={({ isActive }) => (isActive ? "active" : "")}>
            Slots
          </NavLink>
        </li>
        <li>
          <NavLink to="/sessions" className={({ isActive }) => (isActive ? "active" : "")}>
            Sessions
          </NavLink>
        </li>
        <li>
          <NavLink to="/payments" className={({ isActive }) => (isActive ? "active" : "")}>
            Payments
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
