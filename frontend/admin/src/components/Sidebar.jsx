import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "🏠", end: true },
  { to: "/products", label: "Products", icon: "📦" },
  { to: "/orders", label: "Orders", icon: "🧾" },
  { to: "/users", label: "Users", icon: "👤" },
];

const Sidebar = ({ open, onClose, onLogout }) => (
  <>
    <div className={`sidebar-backdrop ${open ? "open" : ""}`} onClick={onClose} />
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">M</span>
        <span>MedEquip Admin</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={onLogout}>
          <span className="sidebar-icon">↩</span>
          Log out
        </button>
      </div>
    </aside>
  </>
);

export default Sidebar;
