import { useEffect, useRef, useState } from "react";
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

// ── File type config ──────────────────────────────────────────────────────
const FILE_META = {
  pdf:  { label: "PDF",  icon: "📄", color: "#c0392b", bg: "#fdecea" },
  docx: { label: "Word", icon: "📝", color: "#1a5276", bg: "#eaf0fb" },
  doc:  { label: "Word", icon: "📝", color: "#1a5276", bg: "#eaf0fb" },
};

function fileMeta(filename = "") {
  const ext = filename.split(".").pop().toLowerCase();
  return FILE_META[ext] || { label: ext.toUpperCase(), icon: "📎", color: T.textMid, bg: T.cream };
}

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
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, visible];
}

function reveal(visible, extra = {}) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
    ...extra,
  };
}

// ── Viewer URL helper ─────────────────────────────────────────────────────
function getViewerSrc(fileUrl) {
  const ext = fileUrl.split(".").pop().toLowerCase();
  if (ext === "pdf") return fileUrl;
  const absolute = fileUrl.startsWith("http")
    ? fileUrl
    : `${window.location.origin}${fileUrl}`;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(absolute)}&embedded=true`;
}

// ── Preload file into browser cache on hover ──────────────────────────────
function preloadFile(fileUrl) {
  const ext = fileUrl.split(".").pop().toLowerCase();
  if (ext === "pdf") {
    // Fetch PDF into cache so iframe loads instantly
    fetch(fileUrl, { mode: "no-cors" }).catch(() => {});
  } else {
    // Prefetch the Google Docs Viewer URL
    const src = getViewerSrc(fileUrl);
    if (!document.querySelector(`link[data-gv-prefetch="${btoa(src).slice(0,20)}"]`)) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = src;
      link.dataset.gvPrefetch = btoa(src).slice(0, 20);
      document.head.appendChild(link);
    }
  }
}

// ── Sermon modal ──────────────────────────────────────────────────────────
function SermonModal({ sermon, onClose }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!sermon) return null;

  const fileUrl = `${API_BASE}${sermon.file}`;
  const src = getViewerSrc(fileUrl);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(10,20,45,0.78)",
        backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.25rem",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.white, borderRadius: "10px",
          width: "100%", maxWidth: "900px", height: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 32px 100px rgba(10,20,45,0.45)",
          overflow: "hidden",
          animation: "slideUp 0.25s ease",
        }}
      >
        <style>{`@keyframes slideUp { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }`}</style>

        {/* ── Modal header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1rem 1.5rem",
          background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
          borderBottom: "1px solid rgba(200,146,42,0.2)",
          flexShrink: 0,
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontFamily: font.body, fontSize: "11px",
              color: T.goldLight, letterSpacing: "2px", textTransform: "uppercase",
            }}>
              {sermon.scripture} &nbsp;·&nbsp; {sermon.speaker}
            </p>
            <h3 style={{
              margin: "4px 0 0", fontFamily: font.display,
              fontSize: "clamp(16px, 2.5vw, 20px)", color: T.white,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {sermon.series}
            </h3>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0, marginLeft: "1rem" }}>
            {/* Download from modal */}
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: font.body, fontSize: "12px", fontWeight: "700",
                color: T.gold, background: "rgba(200,146,42,0.12)",
                padding: "6px 14px", borderRadius: "20px",
                border: "1px solid rgba(200,146,42,0.3)",
                textDecoration: "none", letterSpacing: "0.5px",
                whiteSpace: "nowrap",
              }}
            >
              ⬇ Download
            </a>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none",
                color: T.white, width: "34px", height: "34px",
                borderRadius: "50%", fontSize: "16px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── iframe viewer with loading overlay ── */}
        <div style={{ flex: 1, position: "relative" }}>
          {!iframeLoaded && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: T.cream, gap: "12px", zIndex: 1,
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: `3px solid ${T.border}`,
                borderTopColor: T.gold,
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ fontFamily: font.body, fontSize: "13px", color: T.textLight, margin: 0 }}>
                Loading document…
              </p>
            </div>
          )}
          <iframe
            src={src}
            title={sermon.series}
            onLoad={() => setIframeLoaded(true)}
            style={{ width: "100%", height: "100%", border: "none", background: T.cream }}
          />
        </div>
      </div>
    </div>
  );
}

// ── File type badge ───────────────────────────────────────────────────────
function FileBadge({ filename }) {
  const meta = fileMeta(filename);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontFamily: font.body, fontSize: "11px", fontWeight: "700",
      letterSpacing: "0.5px", textTransform: "uppercase",
      color: meta.color, background: meta.bg,
      padding: "3px 10px", borderRadius: "20px",
    }}>
      {meta.icon} {meta.label}
    </span>
  );
}

// ── Sermon card ───────────────────────────────────────────────────────────
function SermonCard({ sermon, index, featured, onRead }) {
  const [ref, visible] = useReveal(index * 70);
  const [hovered, setHovered] = useState(false);

  if (featured) {
    return (
      <div ref={ref} style={{ ...styles.featuredCard, ...reveal(visible) }}>
        <div style={styles.featuredBadgeRow}>
          <span style={styles.featuredBadge}>✦ Latest Sermon</span>
          <span style={styles.tagPill}>{sermon.tag}</span>
          <FileBadge filename={sermon.file} />
        </div>
        <h2 style={styles.featuredTitle}>{sermon.series}</h2>
        <p style={styles.featuredDesc}>{sermon.desc}</p>
        <div style={styles.featuredMeta}>
          <span>📖 {sermon.scripture}</span>
          <span>🎙 {sermon.speaker}</span>
          <span>📅 {sermon.date}</span>
        </div>

        {/* ── Featured action buttons ── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onMouseEnter={() => preloadFile(`${API_BASE}${sermon.file}`)}
            onClick={() => onRead(sermon)}
            style={styles.downloadBtnPrimary}
          >
            👁 &nbsp;Read Online
          </button>
          <a
            href={`${API_BASE}${sermon.file}`}
            download
            target="_blank"
            rel="noreferrer"
            style={{ ...styles.downloadBtnPrimary, background: T.navyMid }}
          >
            ⬇ &nbsp;Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseEnter={() => { setHovered(true); preloadFile(`${API_BASE}${sermon.file}`); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.sermonCard,
        ...reveal(visible),
        boxShadow: hovered ? "0 8px 40px rgba(15,31,61,0.13)" : T.shadow,
        transform: visible ? (hovered ? "translateY(-3px)" : "translateY(0)") : "translateY(28px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <span style={styles.tagPill}>{sermon.tag}</span>
        <FileBadge filename={sermon.file} />
      </div>
      <h3 style={styles.sermonTitle}>{sermon.series}</h3>
      <p style={styles.sermonDesc}>{sermon.desc}</p>
      <div style={styles.sermonMeta}>
        <span>📖 {sermon.scripture}</span>
        <span>🎙 {sermon.speaker}</span>
      </div>

      {/* ── Small card action buttons ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
        <span style={styles.sermonDate}>📅 {sermon.date}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onRead(sermon)}
            style={styles.downloadBtnSmall}
          >
            👁 Read
          </button>
          <a
            href={`${API_BASE}${sermon.file}`}
            download
            target="_blank"
            rel="noreferrer"
            style={{ ...styles.downloadBtnSmall, background: T.navyMid }}
          >
            ⬇ Download
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SermonsPage() {
  useFonts();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [heroRef,   heroVisible]   = useReveal(100);
  const [filterRef, filterVisible] = useReveal(0);
  const [activeTag, setActiveTag]  = useState("All");

  const [allSermons, setAllSermons] = useState([]);
  const [tags, setTags]             = useState(["All"]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Modal state ──
  const [activeSermon, setActiveSermon] = useState(null);

  // Fetch sermons and tags from backend
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/sermons`).then(r => r.json()),
      fetch(`${API_BASE}/api/sermons/tags`).then(r => r.json()),
    ])
      .then(([sermonData, tagData]) => {
        setAllSermons(Array.isArray(sermonData) ? sermonData : sermonData.sermons ?? []);
        setTags(Array.isArray(tagData) ? tagData : tagData.tags ?? ["All"]);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load sermons. Please try again later.");
        setLoading(false);
      });
  }, []);

  const featured = allSermons.find((s) => s.featured);
  const filtered = allSermons.filter((s) => !s.featured && (activeTag === "All" || s.tag === activeTag));

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={styles.heroWrap}>
        <div style={styles.heroPattern} />
        <div style={styles.heroOverlay}>
          <div ref={heroRef} style={{ ...reveal(heroVisible), textAlign: "center" }}>
            <div style={styles.heroCross}>✝</div>
            <p style={styles.heroEyebrow}>The Word</p>
            <h1 style={styles.heroH1}>Sermons</h1>
            <div style={styles.heroDivider} />
            <p style={styles.heroSub}>
              Biblical teaching to equip, encourage, and grow your faith.<br />
              Read or download messages from our Sunday services and midweek fellowship.
            </p>
          </div>
        </div>
      </div>

      {/* ══ LOADING / ERROR ══════════════════════════════════════════════ */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", fontFamily: font.body, color: T.textLight }}>
          Loading sermons…
        </div>
      )}
      {error && (
        <div style={{ textAlign: "center", padding: "4rem", fontFamily: font.body, color: "#c0392b" }}>
          {error}
        </div>
      )}

      {/* ══ FEATURED SERMON ═══════════════════════════════════════════════ */}
      {!loading && !error && <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>Most Recent</div>
          <h2 style={styles.sectionTitle}>Featured Message</h2>
          <div style={styles.divider} />
          {featured && <SermonCard sermon={featured} index={0} featured onRead={setActiveSermon} />}
        </div>
      </section>}

      {/* ══ SERMON LIBRARY ════════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: T.cream }}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>Archive</div>
          <h2 style={styles.sectionTitle}>All Sermons</h2>
          <div style={styles.divider} />

          {/* Filter tags */}
          <div ref={filterRef} style={{ ...styles.filterRow, ...reveal(filterVisible) }}>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  ...styles.filterBtn,
                  background: activeTag === tag ? T.navy : T.white,
                  color:      activeTag === tag ? T.white : T.textMid,
                  border:     `1px solid ${activeTag === tag ? T.navy : T.border}`,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={styles.grid}>
            {filtered.map((sermon, i) => (
              <SermonCard key={sermon.id} sermon={sermon} index={i} featured={false} onRead={setActiveSermon} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: T.textLight, fontFamily: font.body, padding: "3rem 0" }}>
              No sermons found for this topic yet.
            </p>
          )}
        </div>
      </section>

      {/* ══ CTA BAND ══════════════════════════════════════════════════════ */}
      <section style={styles.ctaBand}>
        <div style={{ ...styles.container, textAlign: "center" }}>
          <p style={styles.ctaEyebrow}>Come as you are</p>
          <h2 style={styles.ctaTitle}>Join Us This Sunday</h2>
          <p style={styles.ctaText}>Mulutu Town, along Kitui – Nairobi Road · 10:00 AM – 1:00 PM</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
            <a href="/contact" style={styles.ctaBtnPrimary}>Get in Touch</a>
            <a href="/about" style={styles.ctaBtnOutline}>About Us</a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={styles.footer}>
        <span style={{ color: T.gold }}>✝</span>
        &nbsp; Developed by Caleb Tonny &copy; 2026. All rights reserved.
      </footer>

      {/* ══ SERMON READER MODAL ══════════════════════════════════════════ */}
      {activeSermon && (
        <SermonModal sermon={activeSermon} onClose={() => setActiveSermon(null)} />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: { background: T.white, fontFamily: font.body, color: T.textDark, overflowX: "hidden" },

  heroWrap: {
    position: "relative", minHeight: "420px",
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
    position: "relative", zIndex: 1, padding: "5rem 2rem",
    width: "100%", display: "flex", justifyContent: "center",
  },
  heroCross:   { fontFamily: font.display, fontSize: "48px", color: T.gold, opacity: 0.3, marginBottom: "1rem" },
  heroEyebrow: { fontFamily: font.body, fontSize: "12px", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", color: T.goldLight, marginBottom: "1rem" },
  heroH1:      { fontFamily: font.display, fontSize: "clamp(36px, 6vw, 64px)", fontWeight: "800", color: T.white, margin: "0 0 1.5rem", lineHeight: 1.1 },
  heroDivider: { width: "48px", height: "3px", background: T.gold, borderRadius: "2px", margin: "0 auto 1.5rem" },
  heroSub:     { fontFamily: font.body, fontSize: "clamp(17px, 2vw, 20px)", fontWeight: "300", color: "rgba(255,255,255,0.78)", lineHeight: "1.8", margin: 0 },

  section:      { padding: "5rem 1.5rem", background: T.white },
  container:    { maxWidth: "1000px", margin: "0 auto" },
  sectionLabel: { fontFamily: font.body, fontSize: "12px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: T.gold, marginBottom: "0.75rem" },
  sectionTitle: { fontFamily: font.display, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: "700", color: T.navy, margin: "0 0 1.25rem", lineHeight: 1.2 },
  divider:      { width: "48px", height: "3px", background: T.gold, borderRadius: "2px", marginBottom: "2.5rem" },

  // Featured card
  featuredCard: {
    padding: "2.5rem", borderRadius: "8px",
    background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
    border: "1px solid rgba(200,146,42,0.25)",
  },
  featuredBadgeRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem", flexWrap: "wrap" },
  featuredBadge: {
    fontFamily: font.body, fontSize: "11px", fontWeight: "700",
    letterSpacing: "1.5px", textTransform: "uppercase",
    color: T.gold, background: "rgba(200,146,42,0.12)",
    padding: "4px 12px", borderRadius: "20px",
    border: "1px solid rgba(200,146,42,0.3)",
  },
  featuredTitle: { fontFamily: font.display, fontSize: "clamp(24px, 4vw, 38px)", fontWeight: "800", color: T.white, margin: "0 0 1rem", lineHeight: 1.2 },
  featuredDesc:  { fontFamily: font.body, fontSize: "16px", lineHeight: "1.85", color: "rgba(255,255,255,0.72)", margin: "0 0 1.5rem", maxWidth: "640px" },
  featuredMeta:  { display: "flex", flexWrap: "wrap", gap: "1rem", fontFamily: font.body, fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "2rem" },

  // Buttons
  downloadBtnPrimary: {
    display: "inline-block",
    padding: "12px 32px",
    background: T.gold, color: T.white,
    border: "none", borderRadius: "6px",
    fontFamily: font.body, fontSize: "14px", fontWeight: "700",
    letterSpacing: "1px", cursor: "pointer", textDecoration: "none",
  },
  downloadBtnSmall: {
    display: "inline-block",
    padding: "7px 18px",
    background: T.navy, color: T.white,
    border: "none", borderRadius: "6px",
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    letterSpacing: "0.5px", cursor: "pointer", textDecoration: "none",
  },

  // Tag pill
  tagPill: {
    fontFamily: font.body, fontSize: "11px", fontWeight: "700",
    letterSpacing: "1px", textTransform: "uppercase",
    background: T.goldPale, color: T.gold,
    padding: "3px 10px", borderRadius: "20px",
  },

  // Filter
  filterRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "2rem" },
  filterBtn: {
    padding: "7px 18px", borderRadius: "20px",
    fontFamily: font.body, fontSize: "13px", fontWeight: "700",
    cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.5px",
  },

  // Sermon grid & cards
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" },
  sermonCard: {
    padding: "1.75rem", borderRadius: "8px",
    background: T.white, border: `1px solid ${T.border}`,
    transition: "box-shadow 0.25s, transform 0.25s",
  },
  sermonTitle: { fontFamily: font.display, fontSize: "18px", fontWeight: "700", color: T.navy, margin: "0 0 0.5rem", lineHeight: 1.3 },
  sermonDesc:  { fontFamily: font.body, fontSize: "14px", lineHeight: "1.75", color: T.textMid, margin: "0 0 1rem" },
  sermonMeta:  { display: "flex", flexDirection: "column", gap: "4px", fontFamily: font.body, fontSize: "12px", color: T.textLight },
  sermonDate:  { fontFamily: font.body, fontSize: "12px", color: T.textLight },

  // CTA band
  ctaBand:       { padding: "5rem 1.5rem", background: `linear-gradient(135deg, ${T.gold} 0%, #a0701a 100%)` },
  ctaEyebrow:    { fontFamily: font.body, fontSize: "12px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: "0.75rem" },
  ctaTitle:      { fontFamily: font.display, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "800", color: T.white, margin: "0 0 0.75rem" },
  ctaText:       { fontFamily: font.body, fontSize: "16px", color: "rgba(255,255,255,0.82)", margin: 0 },
  ctaBtnPrimary: { padding: "14px 36px", background: T.white, color: T.navy, borderRadius: "4px", textDecoration: "none", fontFamily: font.body, fontWeight: "700", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" },
  ctaBtnOutline: { padding: "14px 36px", background: "transparent", color: T.white, border: "1px solid rgba(255,255,255,0.55)", borderRadius: "4px", textDecoration: "none", fontFamily: font.body, fontWeight: "700", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" },

  footer: { textAlign: "center", padding: "1.5rem", background: "#070e1e", fontFamily: font.body, fontSize: "13px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" },
};