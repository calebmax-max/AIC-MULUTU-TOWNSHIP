import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home",     path: "/" },
  { label: "About",    path: "/about" },
  { label: "Gallery",  path: "/gallery" },
  { label: "Sermons",  path: "/sermons" },
  { label: "Contact",  path: "/contact" },
];

const T = {
  navy:      "#0f1f3d",
  navyMid:   "#1a3260",
  gold:      "#c8922a",
  goldLight: "#e8b04a",
  white:     "#ffffff",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'Lato', 'Helvetica Neue', sans-serif",
};

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById("navbar-styles")) return;
    const style = document.createElement("style");
    style.id = "navbar-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');

      .aic-nav-link {
        position: relative;
        font-family: 'Lato', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: rgba(255,255,255,0.72);
        text-decoration: none;
        padding: 6px 0;
        transition: color 0.25s ease;
      }
      .aic-nav-link::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0;
        width: 0; height: 2px;
        background: #c8922a;
        border-radius: 2px;
        transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      .aic-nav-link:hover { color: #ffffff; }
      .aic-nav-link:hover::after,
      .aic-nav-link.active::after { width: 100%; }
      .aic-nav-link.active { color: #e8b04a; }

      .aic-navbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 2.5rem;
        height: 76px;
        background: linear-gradient(to right, #0f1f3d, #1a3260);
        border-bottom: 1px solid rgba(200,146,42,0.0);
        transition: height 0.35s ease, background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
      }
      .aic-navbar.scrolled {
        height: 60px;
        background: rgba(10,18,38,0.97);
        border-bottom-color: rgba(200,146,42,0.2);
        box-shadow: 0 4px 32px rgba(0,0,0,0.35);
      }

      @keyframes slideInDown {
        from { opacity: 0; transform: translateY(-100%); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .aic-navbar { animation: slideInDown 0.5s cubic-bezier(0.4,0,0.2,1) both; }

      @keyframes logoPop {
        0%   { transform: scale(0.8); opacity: 0; }
        70%  { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }
      .aic-logo-img { animation: logoPop 0.6s 0.2s cubic-bezier(0.4,0,0.2,1) both; }

      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .aic-nav-item { animation: fadeSlideIn 0.4s both; }

      @media (max-width: 700px) {
        .aic-navbar      { padding: 0 1rem; flex-wrap: wrap; height: auto; min-height: 60px; padding-top: 10px; padding-bottom: 10px; gap: 8px; }
        .aic-navbar.scrolled { height: auto; }
        .aic-desktop-nav { gap: 0.75rem !important; flex-wrap: wrap; justify-content: center; width: 100%; }
        .aic-nav-link    { font-size: 11px !important; letter-spacing: 1px !important; }
      }
      @media (max-width: 420px) {
        .aic-nav-link    { font-size: 10px !important; letter-spacing: 0.5px !important; }
        .aic-desktop-nav { gap: 0.5rem !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

export default function Navbar() {
  useGlobalStyles();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`aic-navbar${scrolled ? " scrolled" : ""}`}>

        {/* ── Brand ── */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
          <img
            className="aic-logo-img"
            src="images/logo.png"
            alt="AIC Mulutu Logo"
            style={{
              width: "50px", height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              background: T.white,
              boxShadow: "0 2px 14px rgba(200,146,42,0.4)",
            }}
          />
          <div>
            <div style={{
              fontFamily: font.display, fontSize: "22px", fontWeight: "700",
              color: T.white, lineHeight: 1.1, letterSpacing: "0.3px",
            }}>
              AIC Mulutu
            </div>
            <div style={{
              fontFamily: font.body, fontSize: "11px", fontWeight: "400",
              color: T.goldLight, letterSpacing: "2.5px", textTransform: "uppercase",
            }}>
              Township
            </div>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <ul
          className="aic-desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}
        >
          {NAV_ITEMS.map((item, i) => (
            <li
              key={item.path}
              className="aic-nav-item"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <Link
                to={item.path}
                className={`aic-nav-link${pathname === item.path ? " active" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

      </nav>
    </>
  );
}