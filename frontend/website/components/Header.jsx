"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Header = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    router.push(`/products${searchValue ? `?search=${encodeURIComponent(searchValue)}` : ""}`);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" onClick={() => setMenuOpen(false)}>
          <span className="site-brand-mark">M</span>
          MedEquip
        </Link>

        <form className="site-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search medical equipment..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        <button className="site-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          ☰
        </button>

        <nav className={`site-nav ${menuOpen ? "open" : ""}`}>
          <Link href="/products" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="site-cart-link">
            Cart
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                My account
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}>
                My orders
              </Link>
              <button className="site-nav-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
