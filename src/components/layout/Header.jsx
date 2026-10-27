import { useState } from "react";
import { ShieldCheck, Menu, X, ChevronRight } from "lucide-react";
import { useBusinessSettings } from "../../context/BusinessSettingsContext";
import "./Header.css";

import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

function Header() {
  const { settings } = useBusinessSettings();
  const businessName = settings.businessName || "Zafar Law Chamber";
  document.title = businessName
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link 
          to="/"
          className="header-brand"
          aria-label="Zafar Law Chamber home"
          onClick={closeMenu}
        >
          <span className="brand-icon">
            <ShieldCheck size={27} strokeWidth={2.2} />
          </span>

          <span className="brand-text">
            <span className="brand-name">
              <strong>{businessName}</strong>
            </span>

            <span className="brand-tagline">TAX & FINANCIAL SERVICES</span>
          </span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        {/* Navigation */}
        <nav
          id="primary-navigation"
          className={`header-navigation ${menuOpen ? "navigation-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Services
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Contact
          </NavLink>

          {/* Authentication Actions */}
          <div className="header-actions">
            <Link to="/login" className="login-button" onClick={closeMenu}>
              Login
            </Link>

            <Link to="/signup" className="signup-button" onClick={closeMenu}>
              Get Started
              <ChevronRight size={18} />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
