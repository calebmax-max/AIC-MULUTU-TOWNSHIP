import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

// ── Design tokens (same as IndexPage) ────────────────────────────────────
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
      { threshold: 0.12 }
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

// ── Data ──────────────────────────────────────────────────────────────────
const VALUES = [
  { title: "Biblical Authority", verse: "2 Timothy 3:16",  icon: "📖", desc: "We acknowledge the Word of God as the final authority in all matters of faith and conduct." },
  { title: "Prayer",             verse: "Acts 1:14",        icon: "🙏", desc: "We commit to pray for ourselves, those we disciple, and the church without ceasing." },
  { title: "Sacrificial Love",   verse: "2 Samuel 24:25",  icon: "❤️", desc: "We commit to show love to God and others even at the point of personal sacrifice." },
  { title: "Generosity",         verse: "Proverbs 11:25",  icon: "🤲", desc: "We commit to be generous with all the blessings that God gives us." },
  { title: "Dependence on God",  verse: "Proverbs 3:5-6",  icon: "✝️", desc: "We trust fully in God's wisdom, strength and provision, acknowledging that without Him we can do nothing." },
];

const TIMELINE = [
  { year: "1990", label: "Founded",       desc: "A small group of believers begin meeting under a temporary structure on 15th July 1990." },
  { year: "2000", label: "Growth",        desc: "The congregation grows steadily; a permanent building is erected to serve the expanding community." },
  { year: "2010", label: "Youth & Choir", desc: "Youth ministry and choir departments are formally established, energising a new generation." },
  { year: "2026", label: "Today",         desc: "Over 150 active members, weekly services, and a growing outreach into the surrounding community." },
];

// ── Value card ────────────────────────────────────────────────────────────
function ValueCard({ v, index }) {
  const [ref, visible] = useReveal(index * 80);
  return (
    <div ref={ref} style={{ ...styles.valueCard, ...reveal(visible) }}>
      <div style={styles.valueIconWrap}>
        <span style={{ fontSize: "22px" }}>{v.icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={styles.valueTitle}>
          {v.title}
          <span style={styles.valueVerse}> — {v.verse}</span>
        </p>
        <p style={styles.valueDesc}>{v.desc}</p>
      </div>
    </div>
  );
}

// ── Timeline item ─────────────────────────────────────────────────────────
function TimelineItem({ item, index, last }) {
  const [ref, visible] = useReveal(index * 100);
  return (
    <div ref={ref} style={{ ...styles.timelineItem, ...reveal(visible) }}>
      <div style={styles.timelineLeft}>
        <div style={styles.timelineYear}>{item.year}</div>
        {!last && <div style={styles.timelineLine} />}
      </div>
      <div style={styles.timelineContent}>
        <p style={styles.timelineLabel}>{item.label}</p>
        <p style={styles.timelineDesc}>{item.desc}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function AboutPage() {
  useFonts();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [heroRef, heroVisible] = useReveal(100);
  const [whoRef, whoVisible]   = useReveal(0);
  const [mvRef,  mvVisible]    = useReveal(0);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={styles.heroWrap}>
        <div style={styles.heroPattern} />
        <div style={styles.heroOverlay}>
          <div ref={heroRef} style={{ ...reveal(heroVisible), textAlign: "center" }}>
            <div style={styles.heroCross}>✝</div>
            <p style={styles.heroEyebrow}>Our Story</p>
            <h1 style={styles.heroH1}>About Us</h1>
            <div style={styles.heroDivider} />
            <p style={styles.heroSub}>
              A Christ-centered community growing together in faith, love,<br />
              and the purpose of God since 1990.
            </p>
          </div>
        </div>
      </div>

      {/* ══ WHO WE ARE ════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div ref={whoRef} style={reveal(whoVisible)}>
            <div style={styles.sectionLabel}>Identity</div>
            <h2 style={styles.sectionTitle}>Who We Are</h2>
            <div style={styles.divider} />
            <p style={styles.bodyText}>
              We are a Christ-centered church committed to sharing God's love, building strong families, and
              transforming lives through faith in Jesus Christ. Our church is a welcoming community where people
              of all ages and backgrounds can grow spiritually and discover their purpose.
            </p>
          </div>

          {/* Mission & Vision */}
          <div ref={mvRef} style={{ ...styles.mvGrid, ...reveal(mvVisible) }}>
            <div style={styles.mvCard}>
              <div style={styles.mvIcon}>🎯</div>
              <p style={styles.mvHeading}>Mission</p>
              <p style={styles.mvText}>
                Connect people to our Saviour Jesus Christ, nurture faith, and grow together in godliness.
              </p>
            </div>
            <div style={{ ...styles.mvCard, background: T.navy }}>
              <div style={{ ...styles.mvIcon, background: "rgba(200,146,42,0.15)" }}>🔭</div>
              <p style={{ ...styles.mvHeading, color: T.white }}>Vision</p>
              <p style={{ ...styles.mvText, color: "rgba(255,255,255,0.75)" }}>
                To be a vibrant church connecting people to Jesus and making Him known throughout our community and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CORE VALUES ═══════════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: T.cream }}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>Foundations</div>
          <h2 style={styles.sectionTitle}>Core Values</h2>
          <div style={styles.divider} />
          <div style={styles.valuesGrid}>
            {VALUES.map((v, i) => <ValueCard key={v.title} v={v} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ HISTORY TIMELINE ══════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)` }}>
        <div style={styles.container}>
          <div style={{ ...styles.sectionLabel, color: T.goldLight }}>Our Journey</div>
          <h2 style={{ ...styles.sectionTitle, color: T.white }}>Church History</h2>
          <div style={{ ...styles.divider, background: T.gold }} />
          <div style={styles.timeline}>
            {TIMELINE.map((item, i) => (
              <TimelineItem key={item.year} item={item} index={i} last={i === TIMELINE.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ DIFFERENT & IMPACT ════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>Why Us</div>
          <h2 style={styles.sectionTitle}>Our Distinctives</h2>
          <div style={styles.divider} />
          <div style={styles.distinctGrid}>
            {[
              {
                icon: "🏛️", title: "What Makes Us Different",
                text: "We believe in passionate worship, practical teaching, and real community. We are not just a church you attend — we are a family you belong to.",
              },
              {
                icon: "🌱", title: "Our Impact",
                text: "Through God's grace, lives have been transformed, families restored, and hope renewed. We continue to see testimonies of healing, salvation, and spiritual growth.",
              },
            ].map((item, i) => {
              const [ref, visible] = useReveal(i * 120); // eslint-disable-line
              return (
                <div key={item.title} ref={ref} style={{ ...styles.distinctCard, ...reveal(visible) }}>
                  <div style={styles.distinctIcon}>{item.icon}</div>
                  <p style={styles.distinctTitle}>{item.title}</p>
                  <p style={styles.distinctText}>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA BAND ══════════════════════════════════════════════════════ */}
      <section style={styles.ctaBand}>
        <div style={{ ...styles.container, textAlign: "center" }}>
          <p style={styles.ctaEyebrow}>Come as you are</p>
          <h2 style={styles.ctaTitle}>Join Us This Sunday</h2>
          <p style={styles.ctaText}>Mulutu Town, along Kitui – Nairobi Road · 10:30 AM</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
            <Link to="/contact" style={styles.ctaBtnPrimary}>Get Directions</Link>
            <Link to="/sermons" style={styles.ctaBtnOutline}>Watch Sermons</Link>
          </div>
        </div>
      </section>

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
  page: { background: T.white, fontFamily: font.body, color: T.textDark, overflowX: "hidden" },

  // Hero
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
  heroCross: {
    fontFamily: font.display, fontSize: "48px", color: T.gold,
    opacity: 0.3, marginBottom: "1rem",
  },
  heroEyebrow: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    letterSpacing: "4px", textTransform: "uppercase", color: T.goldLight,
    marginBottom: "1rem",
  },
  heroH1: {
    fontFamily: font.display, fontSize: "clamp(36px, 6vw, 64px)",
    fontWeight: "800", color: T.white, margin: "0 0 1.5rem", lineHeight: 1.1,
  },
  heroDivider: {
    width: "48px", height: "3px", background: T.gold,
    borderRadius: "2px", margin: "0 auto 1.5rem",
  },
  heroSub: {
    fontFamily: font.body, fontSize: "clamp(17px, 2vw, 20px)",
    fontWeight: "300", color: "rgba(255,255,255,0.78)",
    lineHeight: "1.8", margin: 0,
  },

  // Sections
  section:      { padding: "5rem 1.5rem", background: T.white },
  container:    { maxWidth: "1000px", margin: "0 auto" },
  sectionLabel: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    letterSpacing: "3px", textTransform: "uppercase",
    color: T.gold, marginBottom: "0.75rem",
  },
  sectionTitle: {
    fontFamily: font.display, fontSize: "clamp(26px, 4vw, 42px)",
    fontWeight: "700", color: T.navy, margin: "0 0 1.25rem", lineHeight: 1.2,
  },
  divider: { width: "48px", height: "3px", background: T.gold, borderRadius: "2px", marginBottom: "2.5rem" },
  bodyText: {
    fontFamily: font.body, fontSize: "17px", lineHeight: "1.9",
    color: T.textMid, maxWidth: "720px", marginBottom: "3rem",
  },

  // Mission / Vision
  mvGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  mvCard: {
    padding: "2.5rem", borderRadius: "8px",
    background: T.goldPale, border: `1px solid ${T.border}`,
  },
  mvIcon: {
    width: "48px", height: "48px", borderRadius: "12px",
    background: "rgba(200,146,42,0.12)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "22px", marginBottom: "1.25rem",
  },
  mvHeading: {
    fontFamily: font.display, fontSize: "22px", fontWeight: "700",
    color: T.navy, margin: "0 0 0.75rem",
  },
  mvText: {
    fontFamily: font.body, fontSize: "16px", lineHeight: "1.85",
    color: T.textMid, margin: 0,
  },

  // Values
  valuesGrid: { display: "flex", flexDirection: "column", gap: "1rem" },
  valueCard: {
    display: "flex", gap: "1.25rem", alignItems: "flex-start",
    padding: "1.5rem", borderRadius: "8px", background: T.white,
    border: `1px solid ${T.border}`, boxShadow: T.shadow,
  },
  valueIconWrap: {
    width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
    background: T.goldPale, display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "22px",
  },
  valueTitle: {
    fontFamily: font.display, fontSize: "17px", fontWeight: "700",
    color: T.navy, margin: "0 0 6px",
  },
  valueVerse: { fontFamily: font.body, fontSize: "15px", color: T.gold, fontWeight: "400" },
  valueDesc:  { fontFamily: font.body, fontSize: "18px", lineHeight: "1.75", color: T.textMid, margin: 0 },

  // Timeline
  timeline: { display: "flex", flexDirection: "column", gap: 0, marginTop: "1rem" },
  timelineItem: { display: "flex", gap: "2rem", alignItems: "flex-start" },
  timelineLeft: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
  timelineYear: {
    width: "72px", height: "72px", borderRadius: "50%",
    border: `2px solid ${T.gold}`, display: "flex",
    alignItems: "center", justifyContent: "center",
    fontFamily: font.display, fontSize: "16px", fontWeight: "700",
    color: T.gold, background: "rgba(200,146,42,0.08)",
    flexShrink: 0,
  },
  timelineLine: { width: "2px", flex: 1, minHeight: "40px", background: "rgba(200,146,42,0.25)", margin: "4px 0" },
  timelineContent: { paddingBottom: "2.5rem", paddingTop: "16px" },
  timelineLabel: {
    fontFamily: font.display, fontSize: "18px", fontWeight: "700",
    color: T.white, margin: "0 0 6px",
  },
  timelineDesc: {
    fontFamily: font.body, fontSize: "15px", lineHeight: "1.8",
    color: "rgba(255,255,255,0.68)", margin: 0,
  },

  // Distinctives
  distinctGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  distinctCard: {
    padding: "2.5rem", borderRadius: "8px",
    border: `1px solid ${T.border}`, background: T.white,
    boxShadow: T.shadow,
  },
  distinctIcon: {
    fontSize: "32px", marginBottom: "1.25rem",
  },
  distinctTitle: {
    fontFamily: font.display, fontSize: "20px", fontWeight: "700",
    color: T.navy, margin: "0 0 0.75rem",
  },
  distinctText: {
    fontFamily: font.body, fontSize: "16px", lineHeight: "1.85",
    color: T.textMid, margin: 0,
  },

  // CTA band
  ctaBand: {
    padding: "5rem 1.5rem",
    background: `linear-gradient(135deg, ${T.gold} 0%, #a0701a 100%)`,
  },
  ctaEyebrow: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    letterSpacing: "3px", textTransform: "uppercase",
    color: "rgba(255,255,255,0.75)", marginBottom: "0.75rem",
  },
  ctaTitle: {
    fontFamily: font.display, fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: "800", color: T.white, margin: "0 0 0.75rem",
  },
  ctaText: {
    fontFamily: font.body, fontSize: "16px",
    color: "rgba(255,255,255,0.82)", margin: 0,
  },
  ctaBtnPrimary: {
    padding: "14px 36px", background: T.white,
    color: T.navy, borderRadius: "4px", textDecoration: "none",
    fontFamily: font.body, fontWeight: "700", fontSize: "14px",
    letterSpacing: "1px", textTransform: "uppercase",
  },
  ctaBtnOutline: {
    padding: "14px 36px", background: "transparent",
    color: T.white, border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "4px", textDecoration: "none",
    fontFamily: font.body, fontWeight: "700", fontSize: "14px",
    letterSpacing: "1px", textTransform: "uppercase",
  },

  // Footer
  footer: {
    textAlign: "center", padding: "1.5rem",
    background: "#070e1e",
    fontFamily: font.body, fontSize: "13px",
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px",
  },
};