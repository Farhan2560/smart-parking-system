import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const isAdmin = auth?.role === "admin";

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
        {isAdmin ? (
          <>
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
          </>
        ) : null}
        <li>
          <NavLink to="/sessions" className={({ isActive }) => (isActive ? "active" : "")}>
            {isAdmin ? "Sessions" : "My Sessions"}
          </NavLink>
        </li>
        <li>
          <NavLink to="/payments" className={({ isActive }) => (isActive ? "active" : "")}>
            {isAdmin ? "Payments" : "My Payments"}
          </NavLink>
        </li>
      </ul>
      <div className="navbar-user">
        <span className="navbar-username">
          <span className={`role-badge ${isAdmin ? "role-admin" : "role-customer"}`}>
            {isAdmin ? "Admin" : "Customer"}
          </span>
          {auth?.full_name || auth?.username}
        </span>
        <button className="logout-btn" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
