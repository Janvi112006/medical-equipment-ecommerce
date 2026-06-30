import { useLocation } from "react-router-dom";

const TITLES = {
  "/": "Dashboard",
  "/products": "Products",
  "/orders": "Orders",
  "/users": "Users",
};

const getTitle = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/orders")) return "Orders";
  if (pathname.startsWith("/products")) return "Products";
  if (pathname.startsWith("/users")) return "Users";
  return "Admin Panel";
};

const TopNav = ({ user, onMenuClick }) => {
  const location = useLocation();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="topnav-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <h1 className="topnav-title">{getTitle(location.pathname)}</h1>
      </div>
      <div className="topnav-right">
        <div style={{ textAlign: "right" }}>
          <div className="topnav-user-name">{user?.name}</div>
          <div className="topnav-user-role">{user?.email}</div>
        </div>
        <div className="topnav-avatar">{initial}</div>
      </div>
    </header>
  );
};

export default TopNav;
