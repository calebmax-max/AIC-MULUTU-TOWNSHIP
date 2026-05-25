import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import API_BASE from "./api";

// ── Design tokens ─────────────────────────────────────────────────────────
const T = {
  navy:       "#0f1f3d",
  navyMid:    "#1a3260",
  navyLight:  "#243d6e",
  gold:       "#c8922a",
  goldLight:  "#e8b04a",
  goldPale:   "#fdf3e0",
  cream:      "#faf8f4",
  white:      "#ffffff",
  textDark:   "#0f1f3d",
  textMid:    "#3d4f6b",
  textLight:  "#6b7a94",
  border:     "rgba(200,146,42,0.18)",
  cardBg:     "#ffffff",
  shadow:     "0 4px 32px rgba(15,31,61,0.08)",
  shadowHov:  "0 12px 48px rgba(15,31,61,0.15)",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'Lato', 'Helvetica Neue', sans-serif",
};

// ── Google Fonts injector ─────────────────────────────────────────────────
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

// ── Count-up hook ─────────────────────────────────────────────────────────
function useCountUp(target, suffix = "", active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.ceil(target / (1800 / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, active]);
  return value + suffix;
}

// ── Reveal-on-scroll hook ─────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, visible];
}

function revealStyle(visible, extra = {}) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
    ...extra,
  };
}

// ── Stat box ─────────────────────────────────────────────────────────────
function StatBox({ target, suffix = "", label, delay = 0 }) {
  const [ref, visible] = useReveal(delay);
  const display = useCountUp(target, suffix, visible);
  return (
    <div ref={ref} style={{ ...styles.statBox, ...revealStyle(visible) }}>
      <div style={styles.statAccent} />
      <span style={styles.statNum}>{visible ? display : `0${suffix}`}</span>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────
const slides = [
  { img: "https://picsum.photos/id/1005/1600/700", title: "Sunday Worship Service", desc: "Join us every Sunday for praise, worship, and the Word." },
  { img: "https://picsum.photos/id/1011/1600/700", title: "Midweek Fellowship",     desc: "Grow deeper in faith through teaching and discussion." },
  { img: "https://picsum.photos/id/1012/1600/700", title: "Prayer & Fellowship",    desc: "Come together in prayer, unity, and encouragement." },
  { img: "https://picsum.photos/id/1027/1600/700", title: "Youth Ministry",         desc: "Empowering the next generation to walk with Christ." },
  { img: "https://picsum.photos/id/1033/1600/700", title: "Community Outreach",     desc: "Serving our community with love, hope, and compassion." },
];

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [hovered]);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);
  const s = slides[current];
  return (
    <div style={styles.carousel} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <img src={s.img} alt={s.title} style={styles.carouselImg} key={current} />
      <div style={styles.carouselGradient} />
      <div style={styles.carouselCaption}>
        <div style={styles.carouselPill}>{current + 1} / {slides.length}</div>
        <h5 style={styles.carouselTitle}>{s.title}</h5>
        <p style={styles.carouselDesc}>{s.desc}</p>
      </div>
      <button onClick={prev} style={{ ...styles.carouselBtn, left: "16px" }}>‹</button>
      <button onClick={next} style={{ ...styles.carouselBtn, right: "16px" }}>›</button>
      <div style={styles.carouselDots}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            style={{ ...styles.dot, width: i === current ? "24px" : "8px",
                     background: i === current ? T.gold : "rgba(255,255,255,0.5)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Upcoming events — fetched from API ───────────────────────────────────
function useUpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then(d => {
        const raw = Array.isArray(d) ? d : d.events ?? [];
        // Normalise: backend uses "description", cards use "desc"
        setUpcomingEvents(raw.map(e => ({ ...e, desc: e.description || e.desc || "" })));
      })
      .catch(() => setUpcomingEvents([]));
  }, []);
  return upcomingEvents;
}

const categoryColors = {
  Worship:    { bg: "#1a3260", text: "#e8b04a" },
  Youth:      { bg: "#c8922a", text: "#fff" },
  Fundraiser: { bg: "#0f4c2a", text: "#7dda9a" },
  Fellowship: { bg: "#4a1a5e", text: "#e8aaf8" },
  Outreach:   { bg: "#0f3a4c", text: "#7fd4f8" },
  Music:      { bg: "#4c2a0f", text: "#f8c87f" },
};

// ── Scrolling ticker strip ────────────────────────────────────────────────
function useTickerCSS() {
  useEffect(() => {
    if (document.getElementById("aic-ticker-css")) return;
    const s = document.createElement("style");
    s.id = "aic-ticker-css";
    s.textContent = `
      @keyframes ticker-scroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ticker-inner-anim {
        display: flex;
        animation: ticker-scroll 42s linear infinite;
        will-change: transform;
        white-space: nowrap;
      }
      .ticker-inner-anim:hover { animation-play-state: paused; }
    `;
    document.head.appendChild(s);
  }, []);
}

function EventsTicker({ upcomingEvents }) {
  useTickerCSS();
  const items = upcomingEvents.map(e => `${e.icon}  ${e.date} · ${e.title}`);
  const doubled = [...items, ...items];
  return (
    <div style={styles.tickerWrap}>
      <div style={styles.tickerLabel}>
        <span style={{ fontSize: "13px", marginRight: "6px" }}>📅</span> UPCOMING
      </div>
      <div style={styles.tickerTrack}>
        <div className="ticker-inner-anim">
          {doubled.map((item, i) => (
            <span key={i} style={styles.tickerItem}>
              {item}
              <span style={styles.tickerDot}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Events cards section ──────────────────────────────────────────────────
function EventCard({ event, delay }) {
  const [ref, visible] = useReveal(delay);
  const cc = categoryColors[event.category] || { bg: T.navyMid, text: T.goldLight };
  return (
    <div ref={ref} style={{ ...styles.eventCard, ...revealStyle(visible) }}>
      {/* Coloured top banner */}
      <div style={{ ...styles.eventBanner, background: cc.bg }}>
        <span style={{ ...styles.eventBannerCat, color: cc.text }}>{event.category}</span>
        <span style={styles.eventBannerIcon}>{event.icon}</span>
      </div>

      <div style={styles.eventCardBody}>
        {/* Date badge */}
        <div style={styles.eventDateRow}>
          <div style={styles.eventDateBlock}>
            <span style={styles.eventDateNum}>{event.date.split(" ")[1]}</span>
            <span style={styles.eventDateMonth}>{event.date.split(" ")[0]}</span>
          </div>
          <span style={styles.eventDayLabel}>{event.day}</span>
        </div>

        <h4 style={styles.eventTitle}>{event.title}</h4>
        <div style={styles.eventDivider} />
        <p style={styles.eventDesc}>{event.desc}</p>

        <div style={styles.eventFooter}>
          <span style={styles.eventRsvp}>✝ Add to Calendar</span>
        </div>
      </div>
    </div>
  );
}

function EventsSection() {
  const upcomingEvents = useUpcomingEvents();
  const [ref, visible] = useReveal(0);
  return (
    <section style={styles.eventsSection}>
      <div style={styles.container}>
        <div ref={ref} style={revealStyle(visible)}>
          <div style={{ ...styles.sectionLabel, color: T.goldLight }}>What's On</div>
          <h2 style={{ ...styles.sectionTitle, color: T.white }}>Upcoming Events</h2>
          <div style={{ ...styles.divider, background: T.gold }} />
          <p style={styles.eventsIntro}>
            Don't miss what God is doing in our community — mark your calendar and come as you are.
          </p>
        </div>
        <div style={styles.eventsGrid}>
          {upcomingEvents.map((e, i) => (
            <EventCard key={e.title} event={e} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Service card ──────────────────────────────────────────────────────────
function ServiceCard({ day, services, delay }) {
  const [ref, visible] = useReveal(delay);
  return (
    <div ref={ref} style={{ ...styles.serviceCard, ...revealStyle(visible) }}>
      <div style={styles.serviceCardHeader}>
        <span style={styles.serviceCardDay}>{day}</span>
      </div>
      <div style={styles.serviceCardBody}>
        {services.map(([name, time]) => (
          <div key={name} style={styles.serviceRow}>
            <span style={styles.serviceName}>{name}</span>
            <span style={styles.serviceTime}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function IndexPage() {
  useFonts();
  const [heroRef, heroVisible] = useReveal(100);
  const [welcomeRef, welcomeVisible] = useReveal(0);
  const [statsRef, statsVisible] = useReveal(0);
  const [pastorRef, pastorVisible] = useReveal(0);
  const [carouselRef, carouselVisible] = useReveal(0);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={styles.heroWrap}>
        <video autoPlay muted loop playsInline style={styles.heroVideo}>
          <source src="images/vid2.mp4" type="video/mp4" />
        </video>
        <div style={styles.heroOverlay}>
          {/* decorative cross */}
          <div style={styles.heroCross}>✝</div>
          <div ref={heroRef} style={revealStyle(heroVisible, { textAlign: "center" })}>
            <p style={styles.heroEyebrow}>AIC Mulutu Township</p>
            <h1 style={styles.heroH1}>Welcome to<br />Church</h1>
            <p style={styles.heroSub}>Our anchor is Christ</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
              <Link to="/sermons" style={styles.heroBtnPrimary}>Our Sermons</Link>
              <Link to="/contact" style={styles.heroBtnOutline}>Find Us</Link>
            </div>
          </div>
        </div>
        <div style={styles.heroScrollHint}>
          <span style={styles.heroScrollLine} />
          <span style={styles.heroScrollText}>Scroll</span>
        </div>
      </div>

      {/* ══ WELCOME ═══════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div ref={welcomeRef} style={revealStyle(welcomeVisible)}>
            <div style={styles.sectionLabel}>Our Story</div>
            <h2 style={styles.sectionTitle}>Welcome to AIC<br />Mulutu Township</h2>
            <div style={styles.divider} />
            <p style={styles.welcomeText}>
              AIC Mulutu Township is a family of believers committed to worship, prayer, and the
              teaching of God's Word. We welcome everyone with love and fellowship as we grow in
              faith together and serve our community with compassion.
            </p>
          </div>
          <div style={styles.welcomeImgWrap}>
            <img
              src="images/IMG-20250820-WA0028.jpg"
              alt="Church members during worship service"
              style={styles.welcomeImg}
            />
            <div style={styles.welcomeImgBadge}>
              <span style={{ fontSize: "22px" }}>🙏</span>
              <span style={{ fontFamily: font.body, fontSize: "16px", color: T.textMid, letterSpacing: "0.5px" }}>
                Est. 1990
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section style={styles.statsBand}>
        <div ref={statsRef} style={{ ...styles.container, display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem" }}>
          <StatBox target={35}  suffix="+" label="Years of Ministry" delay={0}   />
          <StatBox target={2}           label="Weekly Services"   delay={100} />
          <StatBox target={150} suffix="+" label="Active Members"   delay={200} />
          <StatBox target={30}  suffix="+" label="Youth Involved"   delay={300} />
        </div>
      </section>

      {/* ══ UPCOMING EVENTS ═══════════════════════════════════════════════ */}
      <EventsSection />

      {/* ══ PASTOR ════════════════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: T.cream }}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>Leadership</div>
          <h2 style={styles.sectionTitle}>Pastor in Charge</h2>
          <div style={styles.divider} />
          <div ref={pastorRef} style={{ ...styles.pastorRow, ...revealStyle(pastorVisible) }}>
            <div style={styles.pastorPhotoWrap}>
              <img
                src="images/1755250892698.jpg"
                alt="Pastor in charge"
                style={styles.pastorPhoto}
              />
              <div style={styles.pastorPhotoBorder} />
            </div>
            <div style={styles.pastorContent}>
              <div style={styles.quoteIcon}>"</div>
              <p style={styles.pastorWord}>
                I am grateful to God for bringing us this far in faith, unity, and service.
                As we look ahead, we are committed to taking the church to another level through
                deeper discipleship, community impact, and a stronger spirit of prayer. You are
                warmly welcomed to join us, grow with us, and experience the love of Christ in
                our fellowship.
              </p>
              <div style={styles.pastorMeta}>
                <div style={styles.pastorMetaLine} />
                <span style={styles.pastorMetaName}>Pastor, AIC Mulutu Township</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES CAROUSEL ═════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionLabel}>What We Offer</div>
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <div style={styles.divider} />
          <p style={styles.carouselIntro}>
            Join us so that we can uplift each other in this journey of salvation as we seek our God
          </p>
          <div ref={carouselRef} style={revealStyle(carouselVisible)}>
            <Carousel />
          </div>
        </div>
      </section>

      {/* ══ SERVICE TIMES ═════════════════════════════════════════════════ */}
      <section style={{ ...styles.section, background: T.navy }}>
        <div style={styles.container}>
          <div style={{ ...styles.sectionLabel, color: T.goldLight }}>Join Us</div>
          <h2 style={{ ...styles.sectionTitle, color: T.white }}>Service Times</h2>
          <div style={{ ...styles.divider, background: T.gold }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "2.5rem" }}>
            <ServiceCard delay={0} day="Sundays" services={[
              ["Sunday School (Children)", "08:00 – 09:00"],
              ["Battalion",                "09:00 – 10:00"],
              ["Main Service",             "10:00 – 13:00"],
              
            ]} />
            <ServiceCard delay={150} day="Wednesdays" services={[
              ["Midweek Fellowship",       "16:00 – 17:00"],
            ]} />
          </div>
        </div>
      </section>

      {/* ══ INFO / CONTACT BAR ════════════════════════════════════════════ */}
      <section style={styles.infoBar}>
        <div style={{ ...styles.container, display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem" }}>
          <div>
            <p style={styles.infoBarTitle}>AIC Mulutu Township</p>
            <p style={styles.infoBarText}>Come, gather with us as we worship and praise our God.</p>
          </div>
          <div>
            <p style={styles.infoBarTitle}>Contact</p>
            {[
              ["📧", "aicmulutu@gmail.com"],
              ["📍", "Mulutu Town, Kitui – Nairobi road"],
              ["📞", "+254 726 836 996"],
            ].map(([icon, text]) => (
              <p key={text} style={styles.infoBarItem}>{icon} {text}</p>
            ))}
          </div>
          <div>
            <p style={styles.infoBarTitle}>Quick Links</p>
            {[["Home", "/"], ["About Us", "/about"], ["Gallery", "/gallery"], ["Contact", "/contact"]].map(([label, to]) => (
              <Link key={label} to={to} style={styles.infoBarLink}>{label}</Link>
            ))}
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

  // Ticker strip
  tickerWrap: {
    display: "flex", alignItems: "stretch",
    background: T.navy, borderBottom: `2px solid ${T.gold}`,
    overflow: "hidden", height: "42px",
  },
  tickerLabel: {
    flexShrink: 0,
    background: T.gold,
    color: T.white,
    fontFamily: font.body, fontSize: "11px", fontWeight: "700",
    letterSpacing: "2px", textTransform: "uppercase",
    display: "flex", alignItems: "center", padding: "0 18px",
    whiteSpace: "nowrap",
  },
  tickerTrack: { flex: 1, overflow: "hidden", position: "relative" },
  tickerInner: {
    display: "flex",
    animation: "ticker-scroll 38s linear infinite",
    willChange: "transform",
  },
  tickerItem: {
    whiteSpace: "nowrap",
    fontFamily: font.body, fontSize: "13px", fontWeight: "400",
    color: "rgba(255,255,255,0.82)", letterSpacing: "0.4px",
    padding: "0 8px", lineHeight: "42px", flexShrink: 0,
  },
  tickerDot: {
    color: T.gold, fontSize: "7px", margin: "0 16px",
    verticalAlign: "middle",
  },

  // Events section
  eventsSection: {
    padding: "5rem 1.5rem",
    background: `linear-gradient(160deg, ${T.navy} 0%, #0a1628 100%)`,
  },
  eventsIntro: {
    fontFamily: font.body, fontSize: "17px", fontStyle: "italic",
    color: "rgba(255,255,255,0.6)", marginBottom: "3rem", maxWidth: "580px",
  },
  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
    marginTop: "0.5rem",
  },
  eventCard: {
    background: "#0f1f3d",
    border: "1px solid rgba(200,146,42,0.25)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex", flexDirection: "column",
  },
  eventBanner: {
    padding: "1.5rem 1.75rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    minHeight: "90px",
  },
  eventBannerCat: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    letterSpacing: "2.5px", textTransform: "uppercase",
    background: "rgba(0,0,0,0.2)", padding: "5px 14px",
    borderRadius: "20px",
  },
  eventBannerIcon: { fontSize: "42px", lineHeight: 1 },
  eventCardBody: {
    padding: "1.75rem 1.75rem 1.5rem",
    flex: 1, display: "flex", flexDirection: "column",
  },
  eventDateRow: {
    display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem",
  },
  eventDateBlock: {
    display: "flex", flexDirection: "column", alignItems: "center",
    background: T.gold, borderRadius: "10px", padding: "8px 14px",
    lineHeight: 1, minWidth: "52px",
  },
  eventDateNum: {
    fontFamily: font.display, fontSize: "26px", fontWeight: "800", color: T.white,
  },
  eventDateMonth: {
    fontFamily: font.body, fontSize: "10px", fontWeight: "700",
    color: "rgba(255,255,255,0.8)", letterSpacing: "1.5px", textTransform: "uppercase",
    marginTop: "2px",
  },
  eventDayLabel: {
    fontFamily: font.body, fontSize: "13px", fontWeight: "700",
    color: "rgba(255,255,255,0.45)", letterSpacing: "2px", textTransform: "uppercase",
  },
  eventTitle: {
    fontFamily: font.display, fontSize: "20px", fontWeight: "700",
    color: T.white, margin: "0 0 1rem", lineHeight: 1.3,
  },
  eventDivider: {
    width: "36px", height: "2px", background: T.gold,
    borderRadius: "1px", marginBottom: "1rem",
  },
  eventDesc: {
    fontFamily: font.body, fontSize: "14.5px", color: "rgba(255,255,255,0.62)",
    lineHeight: "1.75", margin: "0", flex: 1,
  },
  eventFooter: {
    marginTop: "1.5rem", paddingTop: "1rem",
    borderTop: "1px solid rgba(200,146,42,0.15)",
  },
  eventRsvp: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700",
    color: T.goldLight, letterSpacing: "1.5px", textTransform: "uppercase",
    cursor: "pointer",
  },

  // Hero
  heroWrap: { position: "relative", width: "100%", height: "100vh", minHeight: "500px", overflow: "hidden" },
  heroVideo: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(160deg, rgba(10,20,50,0.82) 0%, rgba(10,20,50,0.65) 60%, rgba(180,120,20,0.18) 100%)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "2rem",
  },
  heroCross: {
    fontSize: "40px", color: T.gold, opacity: 0.35,
    position: "absolute", top: "80px", right: "10%",
    fontFamily: font.display, letterSpacing: "-2px",
  },
  heroEyebrow: {
    fontFamily: font.body, fontSize: "16px", fontWeight: "700", letterSpacing: "3px",
    textTransform: "uppercase", color: T.goldLight, marginBottom: "1rem",
  },
  heroH1: {
    fontFamily: font.display, fontSize: "clamp(36px, 7vw, 72px)", fontWeight: "800",
    color: T.white, lineHeight: 1.1, margin: "0 0 1rem",
    textShadow: "0 2px 24px rgba(0,0,0,0.35)",
  },
  heroSub: {
    fontFamily: font.body, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: "300",
    color: "rgba(255,255,255,0.82)", letterSpacing: "1px",
  },
  heroBtnPrimary: {
    padding: "14px 36px", background: T.gold,
    color: T.white, borderRadius: "4px", textDecoration: "none",
    fontFamily: font.body, fontWeight: "700", fontSize: "14px", letterSpacing: "1.5px",
    textTransform: "uppercase", boxShadow: "0 4px 20px rgba(200,146,42,0.4)",
  },
  heroBtnOutline: {
    padding: "14px 36px", background: "transparent",
    color: T.white, border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: "4px", textDecoration: "none",
    fontFamily: font.body, fontWeight: "700", fontSize: "14px", letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  heroScrollHint: {
    position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
  },
  heroScrollLine: { width: "1px", height: "40px", background: "rgba(255,255,255,0.4)", display: "block" },
  heroScrollText: { fontFamily: font.body, fontSize: "16px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase" },

  // Sections
  section: { padding: "5rem 1.5rem", background: T.white },
  container: { maxWidth: "1000px", margin: "0 auto" },
  sectionLabel: {
    fontFamily: font.body, fontSize: "12px", fontWeight: "700", letterSpacing: "3px",
    textTransform: "uppercase", color: T.gold, marginBottom: "0.75rem",
  },
  sectionTitle: {
    fontFamily: font.display, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "700",
    color: T.navy, margin: "0 0 1.25rem", lineHeight: 1.2,
  },
  divider: {
    width: "48px", height: "3px", background: T.gold,
    borderRadius: "2px", marginBottom: "2rem",
  },

  // Welcome
  welcomeText: {
    fontFamily: font.body, fontSize: "18px", lineHeight: "1.85",
    color: T.textMid, maxWidth: "680px", marginBottom: "2.5rem",
  },
  welcomeImgWrap: { position: "relative", display: "inline-block" },
  welcomeImg: {
    width: "100%", maxWidth: "860px", height: "clamp(220px, 40vw, 420px)",
    objectFit: "cover", borderRadius: "8px",
    boxShadow: "0 16px 48px rgba(15,31,61,0.14)",
    display: "block",
  },
  welcomeImgBadge: {
    position: "absolute", bottom: "-20px", right: "24px",
    background: T.white, borderRadius: "8px",
    padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px",
    boxShadow: "0 8px 24px rgba(15,31,61,0.12)",
    border: `1px solid ${T.border}`,
  },

  // Stats band
  statsBand: {
    padding: "4rem 1.5rem",
    background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
  },
  statBox: {
    textAlign: "center", padding: "2rem 1rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(200,146,42,0.2)",
    borderRadius: "8px", position: "relative", overflow: "hidden",
  },
  statAccent: {
    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
    width: "40px", height: "3px", background: T.gold, borderRadius: "0 0 3px 3px",
  },
  statNum: {
    display: "block", fontFamily: font.display, fontSize: "clamp(36px, 5vw, 52px)",
    fontWeight: "800", color: T.gold, lineHeight: 1,
  },
  statLabel: {
    fontFamily: font.body, fontSize: "12px", color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase", letterSpacing: "2px", margin: "10px 0 0",
  },

  // Pastor
  pastorRow: { display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start", marginTop: "2rem" },
  pastorPhotoWrap: { flex: "0 1 320px", position: "relative" },
  pastorPhoto: {
    width: "100%", height: "400px", objectFit: "cover",
    objectPosition: "50% 20%", borderRadius: "8px",
    display: "block",
    WebkitMaskImage: "radial-gradient(circle at 50% 30%, #000 60%, rgba(0,0,0,0.4) 75%, transparent 100%)",
    maskImage: "radial-gradient(circle at 50% 30%, #000 60%, rgba(0,0,0,0.4) 75%, transparent 100%)",
  },
  pastorPhotoBorder: {
    position: "absolute", inset: "12px", border: `1px solid ${T.gold}`,
    borderRadius: "8px", opacity: 0.25, pointerEvents: "none",
  },
  pastorContent: { flex: "1 1 300px" },
  quoteIcon: {
    fontFamily: font.display, fontSize: "80px", color: T.gold, opacity: 0.25,
    lineHeight: 0.7, marginBottom: "1rem",
  },
  pastorWord: {
    fontFamily: font.display, fontSize: "clamp(16px, 2vw, 20px)", fontStyle: "italic",
    lineHeight: "1.85", color: T.textMid, margin: "0 0 2rem",
  },
  pastorMeta: { display: "flex", alignItems: "center", gap: "1rem" },
  pastorMetaLine: { width: "32px", height: "2px", background: T.gold, borderRadius: "1px", flexShrink: 0 },
  pastorMetaName: { fontFamily: font.body, fontSize: "16px", fontWeight: "700", letterSpacing: "1px", color: T.textLight, textTransform: "uppercase" },

  // Carousel
  carouselIntro: {
    fontFamily: font.body, fontSize: "16px", color: T.textMid,
    fontStyle: "italic", marginBottom: "2rem", maxWidth: "600px",
  },
  carousel: { position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: T.shadow },
  carouselImg: { width: "100%", height: "clamp(260px, 42vw, 500px)", objectFit: "cover", display: "block" },
  carouselGradient: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(10,20,50,0.82) 0%, rgba(10,20,50,0.1) 55%, transparent 100%)",
  },
  carouselCaption: {
    position: "absolute", bottom: "3rem", left: "2rem", right: "2rem", textAlign: "left",
  },
  carouselPill: {
    display: "inline-block", padding: "4px 12px",
    background: "rgba(200,146,42,0.85)", borderRadius: "20px",
    fontFamily: font.body, fontSize: "11px", color: T.white,
    letterSpacing: "1px", marginBottom: "0.75rem",
  },
  carouselTitle: {
    fontFamily: font.display, fontSize: "clamp(18px, 3vw, 28px)",
    fontWeight: "700", color: T.white, margin: "0 0 0.5rem",
  },
  carouselDesc: { fontFamily: font.body, fontSize: "18px", color: "rgba(255,255,255,0.8)", margin: 0 },
  carouselBtn: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: T.white, fontSize: "24px", cursor: "pointer",
    width: "44px", height: "44px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    lineHeight: 1,
  },
  carouselDots: {
    position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)",
    display: "flex", gap: "6px", alignItems: "center",
  },
  dot: {
    height: "8px", borderRadius: "4px", border: "none",
    cursor: "pointer", transition: "width 0.3s ease, background 0.3s ease", padding: 0,
  },

  // Service times
  serviceCard: {
    borderRadius: "8px", overflow: "hidden",
    border: "1px solid rgba(200,146,42,0.25)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(8px)",
  },
  serviceCardHeader: {
    background: T.gold, padding: "1rem 1.5rem",
  },
  serviceCardDay: {
    fontFamily: font.display, fontSize: "20px", fontWeight: "700",
    color: T.white, letterSpacing: "0.5px",
  },
  serviceCardBody: { padding: "1.5rem" },
  serviceRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0.75rem 0", borderBottom: "1px solid rgba(200,146,42,0.12)",
  },
  serviceName: { fontFamily: font.body, fontSize: "18px", color: "rgba(255,255,255,0.85)", fontStyle: "italic" },
  serviceTime: { fontFamily: font.body, fontSize: "17px", fontWeight: "700", color: T.goldLight, letterSpacing: "0.5px" },

  // Info bar
  infoBar: {
    padding: "4rem 1.5rem",
    background: `linear-gradient(135deg, #0a1428 0%, ${T.navy} 100%)`,
    borderTop: `1px solid rgba(200,146,42,0.15)`,
  },
  infoBarTitle: {
    fontFamily: font.display, fontSize: "18px", fontWeight: "700",
    color: T.goldLight, marginBottom: "1rem",
  },
  infoBarText: { fontFamily: font.body, fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: "1.8" },
  infoBarItem: { fontFamily: font.body, fontSize: "17px", color: "rgba(255,255,255,0.65)", lineHeight: "1.9", margin: "0 0 0.25rem" },
  infoBarLink: {
    display: "block", fontFamily: font.body, fontSize: "14px",
    color: "rgba(255,255,255,0.65)", textDecoration: "none",
    marginBottom: "0.4rem", letterSpacing: "0.3px",
  },

  // Footer
  footer: {
    textAlign: "center", padding: "1.5rem",
    background: "#070e1e",
    fontFamily: font.body, fontSize: "13px",
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px",
  },
};