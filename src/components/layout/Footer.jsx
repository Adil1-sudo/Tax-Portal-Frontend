import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";
import { FaFacebookSquare } from "react-icons/fa";
import { BsInstagram } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "./Footer.css";
import { useBusinessSettings } from "../../context/BusinessSettingsContext";

// const quickLinks = [
//   { name: "Home", path: "/" },
//   { name: "About Us", path: "/about" },
//   { name: "Our Services", path: "/services" },
//   { name: "Contact Us", path: "/contact" },
// ];

const serviceLinks = [
  { name: "Tax Consultation", path: "/services" },
  { name: "Tax Preparation", path: "/services" },
  { name: "Tax Planning", path: "/services" },
  { name: "Business Tax Services", path: "/services" },
];

function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useBusinessSettings();
  const businessName = settings.businessName || "Zafar Law Chamber";
  const email = settings.email;
  const phone = settings.phone;
  const pak_phone = phone.replace('0','+92');
  
  const address = settings.address;
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* Main Footer Content */}
        <div className="footer-main">

          {/* Brand Section */}
          <div className="footer-brand-section">
            <a
              href="/"
              className="footer-brand"
              aria-label="Zafar Law Chamber home"
            >
              <span className="footer-brand-icon">
                <ShieldCheck size={27} />
              </span>

              <span className="footer-brand-name">
                {businessName}
              </span>
            </a>

            <p className="footer-description">
              Making tax matters simpler. Zafar Law Chamber helps
              individuals and businesses navigate their tax
              responsibilities with confidence and clarity.
            </p>

            {/* Social Links */}
            <div className="footer-socials">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookSquare size={19} />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <BsInstagram size={19} />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={19} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/services">Services</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Login</Link>
              <Link to="/signup">Create Account</Link>
            </div>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Our Services</h3>

            <ul className="footer-links">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.path}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-column footer-contact">
            <h3 className="footer-heading">Get in Touch</h3>

            <ul className="footer-contact-list">
              <li>
                <Mail size={18} />

                <a href={`mailto:${email}`}>
                  {email}
                </a>
              </li>

              <li>
                <Phone size={18} />

                <a href={`tel:${pak_phone}`}>
                  {phone}
                </a>
              </li>

              <li>
                <MapPin size={18} />

                <span>
                  {address}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">

          <p className="footer-copyright">
            © {currentYear} {businessName}. All rights reserved.
          </p>

          <div className="footer-legal-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>

          <button
            type="button"
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp size={19} />
          </button>

        </div>

      </div>
    </footer>
  );
}

export default Footer;