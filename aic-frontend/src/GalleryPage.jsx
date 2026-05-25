import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import API_BASE from "./api";

// ── Design tokens ─────────────────────────────────────────────────────────
const T = {
  navy:      "#0f1f3d",
  navyMid:   "#1a3260",
  gold:      "#c8922a",
  goldLight: "#e8b04a",
  goldPale:  "#fdf3e0",
  cream:     "#faf8f4",
  white:     "#ffffff",
  textDark:  "#0f1f3d",
  textMid:   "#3d4f6b",
  textLight: "#6b7a94",
  border:    "rgba(200,146,42,0.18)",
  shadow:    "0 4px 32px rgba(15,31,61,0.08)",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'Lato', 'Helvetica Neue', sans-serif",
};

// ── Google Fonts ──────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    if (document.getElementById("aic-fonts")) return;
    const link = document.createElement("link");
    link.id = "aic-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Lato:wght@300;400;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ── Reveal-on-scroll ──────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, visible];
}

function reveal(visible, extra = {}) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
    ...extra,
  };
}

// ── Data ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    eyebrow: "Leadership",
    title: "Pastor's Desk",
    cols: 2,
    items: [
      { title: "Pastor-In-Charge",  src: "images/WhatsApp Image 2026-05-21 at 8.13.35 PM.jpeg", alt: "Pastor in charge" },
      { title: "Assistant Pastor",  src: "images/ChatGPT Image May 21, 2026, 08_26_52 PM.png",  alt: "Assistant pastor" },
    ],
  },
  {
    eyebrow: "Administration",
    title: "The Local Church Council",
    cols: 3,
    items: [
      { title: "Council Image 1", src: "images/IMG-20260307-WA0038.jpg", alt: "Local church council image 1" },
      { title: "Council Image 2", src: "images/IMG-20260307-WA0106.jpg", alt: "Local church council image 2" },
      { title: "Council Image 3", src: "images/IMG-20260307-WA0056.jpg", alt: "Local church council image 3" },
    ],
  },
  {
    eyebrow: "Discipleship",
    title: "Sunday School",
    cols: 3,
    items: [
      { title: "Sunday School Teachers", src: "images/IMG-20260307-WA0118.jpg", alt: "Sunday school teachers" },
      { title: "Ongoing Session",        src: "images/IMG-20260307-WA0031.jpg", alt: "Sunday school session" },
      { title: "Ongoing Session",        src: "images/IMG-20260307-WA0023.jpg", alt: "Sunday school session 2" },
      { title: "The Whole Family",       src: "images/IMG-20260307-WA0034.jpg", alt: "Sunday school family" },
      { title: "Ongoing Session",        src: "images/IMG-20260307-WA0024.jpg", alt: "Sunday school session 3" },
    ],
  },
  {
    eyebrow: "Worship Ministry",
    title: "Choir",
    cols: 3,
    items: [
      { title: "", src: "images/IMG_20260301_150056_749.jpg", alt: "Choir image 1" },
      { title: "", src: "images/IMG_20260301_150116_489.jpg",        alt: "Choir image 2" },
      { title: "", src: "images/IMG_20260301_150451_988.jpg",        alt: "Choir image 3" },
    ],
  },
  {
    eyebrow: "Fellowship",
    title: "The Youth",
    cols: 3,
    items: [
      { title: "", src: "images/20260301_143227.jpg",       alt: "Youth image 1" },
      { title: "", src: "images/20260301_143340.jpg",       alt: "Youth image 2" },
      { title: "", src: "images/IMG-20260307-WA0072.jpg",   alt: "Youth image 3" },
    ],
  },
];

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ src, alt, title, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={styles.lightboxBackdrop}>
      <div onClick={e => e.stopPropagation()} style={styles.lightboxBox}>
        <button onClick={onClose} style={styles.lightboxClose}>✕</button>
        <img src={src} alt={alt} style={styles.lightboxImg} />
        {title && <p style={styles.lightboxTitle}>{title}</p>}
      </div>
    </div>
  );
}

// ── Gallery image card ────────────────────────────────────────────────────
function GalleryImage({ src, alt, title, delay }) {
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [ref, visible] = useReveal(delay);

  return (
    <>
      <div
        ref={ref}
        onClick={() => !failed && setLightbox(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...styles.imgCard,
          ...reveal(visible),
          cursor: failed ? "default" : "zoom-in",
          boxShadow: hovered ? "0 12px 40px rgba(15,31,61,0.18)" : T.shadow,
          transform: reveal(visible).transform + (hovered && visible ? " translateY(-4px)" : ""),
        }}
      >
        <div style={styles.imgFrame}>
          {failed ? (
            <div style={styles.imgPlaceholder}>
              <span style={{ fontSize: "28px", opacity: 0.4 }}>🖼️</span>
              <span style={styles.imgPlaceholderText}>Photo</span>
            </div>
          ) : (
            <>
              <img
                src={src}
                alt={alt}
                onError={() => setFailed(true)}
                style={{
                  ...styles.img,
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }}
              />
              <div style={{ ...styles.imgOverlay, opacity: hovered ? 1 : 0 }}>
                <span style={styles.imgZoomIcon}>⊕</span>
              </div>
            </>
          )}
        </div>
        {title ? (
          <div style={styles.imgCaption}>
            <p style={styles.imgCaptionText}>{title}</p>
          </div>
        ) : null}
      </div>

      {lightbox && <Lightbox src={src} alt={alt} title={title} onClose={() => setLightbox(false)} />}
    </>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
function GallerySection({ section, sectionIndex }) {
  const [ref, visible] = useReveal(0);
  const minWidth = section.cols === 2 ? "260px" : "200px";

  return (
    <div ref={ref} style={{ ...styles.section, ...reveal(visible) }}>
      {/* Section header */}
      <div style={styles.sectionHeader}>
        <div>
          <p style={styles.eyebrow}>{section.eyebrow}</p>
          <h2 style={styles.sectionTitle}>{section.title}</h2>
        </div>
        <div style={styles.sectionDividerWrap}>
          <div style={styles.sectionDivider} />
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap: "1.25rem",
      }}>
        {section.items.map((item, i) => (
          <GalleryImage
            key={i}
            src={item.src?.startsWith("/uploads/") ? `${API_BASE}${item.src}` : item.src}
            alt={item.alt}
            title={item.title}
            delay={i * 60}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  useFonts();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [heroRef, heroVisible] = useReveal(100);
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/gallery`)
      .then(r => r.json())
      .then(data => { setSections(Array.isArray(data) ? data : data.sections ?? []); setLoading(false); })
      .catch(() => { setError("Failed to load gallery."); setLoading(false); });
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={styles.heroWrap}>
        <div style={styles.heroPattern} />
        <div style={styles.heroOverlay}>
          <div ref={heroRef} style={{ ...reveal(heroVisible), textAlign: "center" }}>
            <div style={styles.heroCross}>✝</div>
            <p style={styles.heroEyebrow}>Church Life in Pictures</p>
            <h1 style={styles.heroH1}>Gallery</h1>
            <div style={styles.heroDivider} />
            <p style={styles.heroSub}>
              Browse each ministry in a structured layout where<br />
              every photo stays fully visible inside its frame.
            </p>
          </div>
        </div>
      </div>

      {/* ══ GALLERY SECTIONS ══════════════════════════════════════════════ */}
      <div style={styles.pageBody}>
        {loading && <div style={{ textAlign: "center", padding: "4rem", fontFamily: "'Lato', sans-serif", color: "#6b7a94" }}>Loading gallery…</div>}
        {error  && <div style={{ textAlign: "center", padding: "4rem", color: "#c0392b" }}>{error}</div>}
        {sections.map((section, i) => (
          <GallerySection key={section.title} section={section} sectionIndex={i} />
        ))}

        {/* ══ SUBMIT PHOTOS CTA ═════════════════════════════════════════ */}
        <div style={styles.ctaCard}>
          <div style={styles.ctaIcon}>📸</div>
          <h3 style={styles.ctaTitle}>Share Your Photos</h3>
          <p style={styles.ctaText}>
            Were you at one of our events? Send us your photos and we'll feature them here.
          </p>
          <a
            href={`https://wa.me/254762220299?text=${encodeURIComponent("Hello! I would like to send photos for the AIC Mulutu website gallery.")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.ctaBtn}
          >
            Send Us Your Photos →
          </a>
        </div>
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={styles.footer}>
        <span style={{ color: T.gold }}>✝</span>
        &nbsp; Developed by Caleb Tonny &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: { background: T.cream, fontFamily: font.body, color: T.textDark, overflowX: "hidden" },

  // Hero
  heroWrap: {
    position: "relative", minHeight: "380px",
    background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", paddingTop: "80px",
  },
  heroPattern: {
    position: "absolute", inset: 0,
    backgroundImage: "radial-gradient(circle, rgba(200,146,42,0.08) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  },
  heroOverlay: {
    position: "relative", zIndex: 1,
    padding: "4.5rem 2rem", width: "100%",
    display: "flex", justifyContent: "center",
  },
  heroCross: {
    fontFamily: font.display, fontSize: "44px",
    color: T.gold, opacity: 0.3, marginBottom: "1rem",
  },
  heroEyebrow: {
    fontFamily: font.body, fontSize: "13px", fontWeight: "700",
    letterSpacing: "4px", textTransform: "uppercase",
    color: T.goldLight, marginBottom: "0.75rem",
  },
  heroH1: {
    fontFamily: font.display, fontSize: "clamp(36px, 6vw, 64px)",
    fontWeight: "800", color: T.white, margin: "0 0 1.25rem", lineHeight: 1.1,
  },
  heroDivider: {
    width: "48px", height: "3px", background: T.gold,
    borderRadius: "2px", margin: "0 auto 1.5rem",
  },
  heroSub: {
    fontFamily: font.body, fontSize: "clamp(15px, 2vw, 18px)",
    fontWeight: "300", color: "rgba(255,255,255,0.75)",
    lineHeight: "1.8", margin: 0,
  },

  // Page body
  pageBody: {
    maxWidth: "1020px", margin: "0 auto",
    padding: "4rem 1.5rem",
    display: "flex", flexDirection: "column", gap: "3rem",
  },

  // Gallery section
  section: {
    background: T.white, borderRadius: "12px",
    padding: "2.25rem", boxShadow: T.shadow,
    border: `1px solid ${T.border}`,
  },
  sectionHeader: {
    display: "flex", alignItems: "flex-end",
    justifyContent: "space-between", gap: "1rem",
    marginBottom: "1.75rem",
    paddingBottom: "1.25rem",
    borderBottom: `1px solid ${T.border}`,
  },
  eyebrow: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    letterSpacing: "3px", textTransform: "uppercase",
    color: T.gold, margin: "0 0 6px",
  },
  sectionTitle: {
    fontFamily: font.display, fontSize: "clamp(20px, 3vw, 28px)",
    fontWeight: "700", color: T.navy, margin: 0,
  },
  sectionDividerWrap: { flexShrink: 0 },
  sectionDivider: { width: "40px", height: "3px", background: T.gold, borderRadius: "2px" },

  // Image card
  imgCard: {
    background: T.white, borderRadius: "10px",
    border: `1px solid ${T.border}`,
    overflow: "hidden",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
  },
  imgFrame: {
    width: "100%", aspectRatio: "4/3",
    overflow: "hidden", position: "relative",
    background: "#e8e4de",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  img: {
    width: "100%", height: "100%",
    objectFit: "cover", objectPosition: "top",
    display: "block",
    transition: "transform 0.45s ease",
  },
  imgOverlay: {
    position: "absolute", inset: 0,
    background: "rgba(15,31,61,0.38)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.3s ease",
  },
  imgZoomIcon: {
    fontSize: "36px", color: T.white, fontWeight: "300",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  imgPlaceholder: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
  },
  imgPlaceholderText: {
    fontFamily: font.body, fontSize: "14px", color: T.textLight,
  },
  imgCaption: {
    padding: "12px 16px",
    borderTop: `1px solid ${T.border}`,
  },
  imgCaptionText: {
    fontFamily: font.body, fontSize: "15px", fontWeight: "700",
    color: T.textDark, margin: 0, letterSpacing: "0.2px",
  },

  // Lightbox
  lightboxBackdrop: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(7,14,30,0.92)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1.5rem",
  },
  lightboxBox: {
    position: "relative", maxWidth: "860px", width: "100%",
    background: T.navy, borderRadius: "12px", overflow: "hidden",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
    border: `1px solid rgba(200,146,42,0.25)`,
  },
  lightboxClose: {
    position: "absolute", top: "12px", right: "16px",
    background: "rgba(255,255,255,0.1)", border: "none",
    color: T.white, fontSize: "18px", cursor: "pointer",
    width: "36px", height: "36px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1,
  },
  lightboxImg: {
    width: "100%", maxHeight: "75vh",
    objectFit: "contain", objectPosition: "center",
    display: "block",
  },
  lightboxTitle: {
    fontFamily: font.display, fontSize: "18px", fontWeight: "700",
    color: T.white, margin: 0, padding: "1rem 1.5rem",
    borderTop: `1px solid rgba(200,146,42,0.2)`,
  },

  // CTA card
  ctaCard: {
    background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    borderRadius: "12px", padding: "3rem 2rem",
    textAlign: "center", border: `1px solid rgba(200,146,42,0.2)`,
    boxShadow: T.shadow,
  },
  ctaIcon: { fontSize: "40px", marginBottom: "1rem" },
  ctaTitle: {
    fontFamily: font.display, fontSize: "clamp(22px, 3vw, 30px)",
    fontWeight: "700", color: T.white, margin: "0 0 0.75rem",
  },
  ctaText: {
    fontFamily: font.body, fontSize: "17px", color: "rgba(255,255,255,0.72)",
    lineHeight: "1.8", margin: "0 0 2rem", maxWidth: "480px",
    marginLeft: "auto", marginRight: "auto",
  },
  ctaBtn: {
    display: "inline-block", padding: "14px 36px",
    background: T.gold, color: T.white,
    borderRadius: "4px", textDecoration: "none",
    fontFamily: font.body, fontSize: "16px", fontWeight: "700",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 20px rgba(200,146,42,0.35)",
  },

  // Footer
  footer: {
    textAlign: "center", padding: "1.5rem",
    background: "#070e1e",
    fontFamily: font.body, fontSize: "15px",
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px",
  },
};