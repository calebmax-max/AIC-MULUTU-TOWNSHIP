import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import API_BASE from "./api";

// ── Design tokens (same as AboutPage) ────────────────────────────────────
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
const SERVICE_HOURS = [
  { day: "Sunday Service",           time: "10:00 AM – 13:00 PM", highlight: true  },
  { day: "Wednesday Fellowship",     time: "4:00 PM – 5:00 PM",  highlight: false },
];

const CONTACT_ITEMS = [
  { icon: "✉",  label: "Email",    value: "aicmulutu@gmail.com"  },
  { icon: "📞", label: "Phone",    value: "+254 726 836 996"     },
];

// ── Main ──────────────────────────────────────────────────────────────────
export default function ContactPage() {
  useFonts();

  const [heroRef,    heroVisible]    = useReveal(100);
  const [reachRef,   reachVisible]   = useReveal(0);
  const [hoursRef,   hoursVisible]   = useReveal(80);
  const [formRef,    formVisible]    = useReveal(0);

  const [form,      setForm]      = useState({ name: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused,   setFocused]   = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");

      // Open WhatsApp with pre-filled message to host
      const text =
        `*New Message - AIC Mulutu Website*\n\n` +
        `Name: ${form.name}\n` +
        `Phone: ${form.phone}\n` +
        `Subject: ${form.subject || "N/A"}\n` +
        `Message: ${form.message}`;
      window.open(`https://wa.me/254726836996?text=${encodeURIComponent(text)}`, "_blank");

      setSubmitted(true);
      setForm({ name: "", phone: "", subject: "", message: "" });
    } catch {
      setSubmitError("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${focused === field ? T.gold : T.border}`,
    borderRadius: "6px",
    fontSize: "15px",
    fontFamily: font.body,
    color: T.textDark,
    background: T.white,
    outline: "none",
    boxSizing: "border-box",
    boxShadow: focused === field ? `0 0 0 3px rgba(200,146,42,0.12)` : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  const textareaStyle = (field) => ({
    ...inputStyle(field),
    resize: "vertical",
    minHeight: "120px",
  });

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={styles.heroWrap}>
        <div style={styles.heroPattern} />
        <div style={styles.heroOverlay}>
          <div ref={heroRef} style={{ ...reveal(heroVisible), textAlign: "center" }}>
            <div style={styles.heroCross}>✝</div>
            <p style={styles.heroEyebrow}>Get in touch</p>
            <h1 style={styles.heroH1}>Contact Us</h1>
            <div style={styles.heroDivider} />
            <p style={styles.heroSub}>
              We'd love to hear from you. Reach out for prayer requests,<br />
              inquiries, or to learn more about our community.
            </p>
          </div>
        </div>
      </div>

      {/* ══ CONTACT GRID ══════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.grid}>

            {/* Left column — reach us + hours */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Reach us */}
              <div ref={reachRef} style={{ ...styles.card, ...reveal(reachVisible) }}>
                <p style={styles.cardLabel}>Reach us</p>
                <h3 style={styles.cardTitle}>Contact Information</h3>
                <div style={styles.cardDivider} />

                {CONTACT_ITEMS.map((item) => (
                  <div key={item.label} style={styles.contactRow}>
                    <div style={styles.iconWrap}>
                      <span style={{ fontSize: "20px" }}>{item.icon}</span>
                    </div>
                    <div>
                      <p style={styles.contactItemLabel}>{item.label}</p>
                      <p style={styles.contactItemValue}>{item.value}</p>
                    </div>
                  </div>
                ))}

                {/* Location */}
                <div style={styles.contactRow}>
                  <div style={styles.iconWrap}>
                    <span style={{ fontSize: "20px" }}>📍</span>
                  </div>
                  <div>
                    <p style={styles.contactItemLabel}>Location</p>
                    <p style={{ ...styles.contactItemValue, lineHeight: "1.6", marginBottom: "10px" }}>
                      Mulutu Town, along<br />Kitui – Nairobi Road
                    </p>
                    <a
                      href="https://www.google.com/maps?q=JXR2%2B59Q+Mulutu"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.mapsLink}
                    >
                      ↗ View on Google Maps
                    </a>
                  </div>
                </div>

                {/* Embedded Map */}
                <div style={styles.mapWrap}>
                  <iframe
                    title="AIC Mulutu Location"
                    width="100%"
                    height="220"
                    style={{ border: 0, borderRadius: "8px", display: "block" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=JXR2%2B59Q+Mulutu&output=embed"
                  />
                </div>
              </div>

              {/* Service hours */}
              <div ref={hoursRef} style={{ ...styles.card, ...reveal(hoursVisible) }}>
                <p style={styles.cardLabel}>Schedule</p>
                <h3 style={styles.cardTitle}>Service Hours</h3>
                <div style={styles.cardDivider} />

                {SERVICE_HOURS.map((s, i) => (
                  <div
                    key={s.day}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < SERVICE_HOURS.length - 1 ? `1px solid ${T.border}` : "none",
                    }}
                  >
                    <span style={{
                      fontFamily: font.body,
                      fontSize: "14px",
                      fontWeight: s.highlight ? "700" : "400",
                      color: T.textDark,
                    }}>
                      {s.day}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {s.highlight && (
                        <span style={styles.mainBadge}>Main</span>
                      )}
                      <span style={{ fontFamily: font.body, fontSize: "13px", color: T.textLight }}>
                        {s.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — form */}
            <div ref={formRef} style={{ ...styles.card, ...reveal(formVisible) }}>
              <p style={styles.cardLabel}>Prayer requests & inquiries</p>
              <h3 style={styles.cardTitle}>Send a Message</h3>
              <div style={styles.cardDivider} />

              {submitted && (
                <div style={styles.successBanner}>
                  ✓ Thank you! Your message has been received. We'll get back to you soon.
                </div>
              )}
              {submitError && (
                <div style={{ ...styles.successBanner, background: "#fdecea", color: "#c0392b", border: "1px solid #e57373" }}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {[
                  { name: "name",    label: "Your Name",      type: "text",  placeholder: "e.g. John Kamau",                  required: true  },
                  { name: "phone",   label: "Phone Number",   type: "tel",   placeholder: "e.g. +254 700 000 000",            required: true  },
                  { name: "subject", label: "Subject",        type: "text",  placeholder: "e.g. Prayer request, Membership…", required: false },
                ].map((field) => (
                  <div key={field.name} style={{ marginBottom: "1.25rem" }}>
                    <label style={styles.fieldLabel}>{field.label}</label>
                    <input
                      style={inputStyle(field.name)}
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      onFocus={() => setFocused(field.name)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={styles.fieldLabel}>Message</label>
                  <textarea
                    style={textareaStyle("message")}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    placeholder="Write your message here…"
                    required
                  />
                </div>

                <button type="submit" style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? "Sending…" : "Send Message →"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={styles.footer}>
        <div style={{ color: T.white, fontWeight: "600", fontSize: "14px", marginBottom: "6px", fontFamily: font.body }}>
          AIC Mulutu Township
        </div>
        <div>Developed by Caleb Tonny &copy; 2026. All rights reserved.</div>
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
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "48px", color: T.gold,
    opacity: 0.3, marginBottom: "1rem",
  },
  heroEyebrow: {
    fontFamily: "'Lato', sans-serif", fontSize: "12px", fontWeight: "700",
    letterSpacing: "4px", textTransform: "uppercase", color: T.goldLight,
    marginBottom: "1rem",
  },
  heroH1: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "clamp(36px, 6vw, 64px)",
    fontWeight: "800", color: T.white, margin: "0 0 1.5rem", lineHeight: 1.1,
  },
  heroDivider: {
    width: "48px", height: "3px", background: T.gold,
    borderRadius: "2px", margin: "0 auto 1.5rem",
  },
  heroSub: {
    fontFamily: "'Lato', sans-serif", fontSize: "clamp(17px, 2vw, 20px)",
    fontWeight: "300", color: "rgba(255,255,255,0.78)",
    lineHeight: "1.8", margin: 0,
  },

  // Layout
  section:   { padding: "5rem 1.5rem", background: T.white },
  container: { maxWidth: "1000px", margin: "0 auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.75rem",
    alignItems: "start",
  },

  // Card
  card: {
    padding: "2.5rem",
    borderRadius: "8px",
    border: `1px solid ${T.border}`,
    background: T.white,
    boxShadow: T.shadow,
  },
  cardLabel: {
    fontFamily: "'Lato', sans-serif", fontSize: "12px", fontWeight: "700",
    letterSpacing: "3px", textTransform: "uppercase",
    color: T.gold, margin: "0 0 0.5rem",
  },
  cardTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "22px", fontWeight: "700",
    color: T.navy, margin: "0 0 1rem",
  },
  cardDivider: {
    width: "36px", height: "3px", background: T.gold,
    borderRadius: "2px", marginBottom: "1.75rem",
  },

  // Contact rows
  contactRow: {
    display: "flex", gap: "14px", alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  iconWrap: {
    width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
    background: T.goldPale, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  contactItemLabel: {
    fontFamily: "'Lato', sans-serif", fontSize: "11px", fontWeight: "700",
    letterSpacing: "1.5px", textTransform: "uppercase",
    color: T.textLight, margin: "0 0 3px",
  },
  contactItemValue: {
    fontFamily: "'Lato', sans-serif", fontSize: "15px",
    color: T.textDark, margin: 0,
  },
  mapWrap: {
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid rgba(200,146,42,0.18)`,
    marginTop: "1.25rem",
  },
  mapsLink: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "7px 14px", border: `1px solid ${T.border}`,
    borderRadius: "6px", fontSize: "13px",
    color: T.navy, fontFamily: "'Lato', sans-serif",
    textDecoration: "none", background: T.goldPale,
    fontWeight: "700",
  },

  // Service hours badge
  mainBadge: {
    background: T.goldPale, color: T.gold,
    fontSize: "11px", fontWeight: "700",
    padding: "2px 10px", borderRadius: "20px",
    fontFamily: "'Lato', sans-serif", letterSpacing: "0.5px",
  },

  // Form
  fieldLabel: {
    display: "block", fontFamily: "'Lato', sans-serif",
    fontSize: "12px", fontWeight: "700",
    letterSpacing: "1.5px", textTransform: "uppercase",
    color: T.textLight, marginBottom: "7px",
  },
  submitBtn: {
    width: "100%", padding: "13px",
    background: T.navy, color: T.white,
    border: "none", borderRadius: "6px",
    fontSize: "14px", fontWeight: "700",
    letterSpacing: "1px", textTransform: "uppercase",
    cursor: "pointer", fontFamily: "'Lato', sans-serif",
    transition: "background 0.2s",
  },
  successBanner: {
    background: "#EAF3DE", color: "#27500A",
    border: "1px solid #97C459", borderRadius: "6px",
    padding: "12px 16px", fontSize: "14px",
    fontFamily: "'Lato', sans-serif",
    marginBottom: "1.5rem", textAlign: "center",
  },

  // Footer
  footer: {
    textAlign: "center", padding: "1.5rem",
    background: "#070e1e",
    fontFamily: "'Lato', sans-serif", fontSize: "13px",
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px",
  },
};