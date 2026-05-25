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

      .aic-mob-link {
        display: block;
        font-family: 'Lato', sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: rgba(255,255,255,0.75);
        text-decoration: none;
        padding: 14px 0;
        border-bottom: 1px solid rgba(200,146,42,0.12);
        transition: color 0.2s, padding-left 0.2s;
      }
      .aic-mob-link:hover, .aic-mob-link.active {
        color: #e8b04a;
        padding-left: 8px;
      }

      .ham-bar {
        display: block;
        width: 22px; height: 2px;
        background: #ffffff;
        border-radius: 2px;
        transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
        transform-origin: center;
      }
      .ham-open .ham-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .ham-open .ham-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .ham-open .ham-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

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

      .aic-mob-drawer {
        position: fixed;
        top: 0; right: 0;
        width: 280px; height: 100vh;
        background: linear-gradient(160deg, #0a1226 0%, #1a3260 100%);
        border-left: 1px solid rgba(200,146,42,0.2);
        z-index: 999;
        padding: 90px 2rem 2rem;
        transform: translateX(100%);
        transition: transform 0.38s cubic-bezier(0.4,0,0.2,1);
        box-shadow: -8px 0 40px rgba(0,0,0,0.4);
      }
      .aic-mob-drawer.open { transform: translateX(0); }

      .aic-mob-backdrop {
        position: fixed; inset: 0;
        background: rgba(5,10,22,0.7);
        z-index: 998;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.35s ease;
        backdrop-filter: blur(3px);
      }
      .aic-mob-backdrop.open {
        opacity: 1;
        pointer-events: all;
      }

      @media (max-width: 700px) {
        .aic-desktop-nav { display: none !important; }
        .aic-ham-btn     { display: flex !important; }
        .aic-navbar      { padding: 0 1.25rem; }
      }
      @media (min-width: 701px) {
        .aic-desktop-nav { display: flex !important; }
        .aic-ham-btn     { display: none !important; }
        .aic-mob-drawer  { display: none !important; }
        .aic-mob-backdrop{ display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

export default function Navbar() {
  useGlobalStyles();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

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

        {/* ── Hamburger ── */}
        <button
          className={`aic-ham-btn${menuOpen ? " ham-open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{
            display: "none", flexDirection: "column", gap: "5px",
            background: "transparent", border: "none", cursor: "pointer",
            padding: "6px",
          }}
        >
          <span className="ham-bar" />
          <span className="ham-bar" />
          <span className="ham-bar" />
        </button>
      </nav>

      {/* ── Mobile backdrop ── */}
      <div
        className={`aic-mob-backdrop${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div className={`aic-mob-drawer${menuOpen ? " open" : ""}`}>
        {/* Drawer brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
          <img
            src="/logo.png"
            alt="AIC Mulutu Logo"
            style={{
              width: "38px", height: "38px", borderRadius: "50%",
              objectFit: "cover", background: T.white,
              boxShadow: "0 2px 10px rgba(200,146,42,0.3)",
            }}
          />
          <div>
            <div style={{ fontFamily: font.display, fontSize: "16px", fontWeight: "700", color: T.white, lineHeight: 1.1 }}>
              AIC Mulutu
            </div>
            <div style={{ fontFamily: font.body, fontSize: "10px", color: T.goldLight, letterSpacing: "2px", textTransform: "uppercase" }}>
              Township
            </div>
          </div>
        </div>

        {/* Drawer links */}
        <nav>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`aic-mob-link${pathname === item.path ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div style={{
          position: "absolute", bottom: "2rem", left: "2rem", right: "2rem",
          fontFamily: font.body, fontSize: "11px", color: "rgba(255,255,255,0.3)",
          letterSpacing: "1px", textTransform: "uppercase",
        }}>
          Mulutu Town · Kitui – Nairobi Road
        </div>
      </div>
    </>
  );
}