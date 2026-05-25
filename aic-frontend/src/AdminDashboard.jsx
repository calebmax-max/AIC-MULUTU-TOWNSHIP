import { useState, useEffect } from "react";
import API_BASE from "./api";

// ── Design tokens (matching site theme) ───────────────────────────────────
const T = {
  navy:      "#0f1f3d",
  navyMid:   "#1a3260",
  navyLight: "#243d6e",
  gold:      "#c8922a",
  goldLight: "#e8b04a",
  goldPale:  "#fdf3e0",
  cream:     "#faf8f4",
  white:     "#ffffff",
  textDark:  "#0f1f3d",
  textMid:   "#3d4f6b",
  textLight: "#6b7a94",
  border:    "rgba(200,146,42,0.18)",
  danger:    "#c0392b",
  dangerBg:  "#fdecea",
  success:   "#27500A",
  successBg: "#EAF3DE",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'Lato', 'Helvetica Neue', sans-serif",
};

const TABS = ["Events", "Sermons", "Gallery", "Messages"];

const categoryColors = {
  Worship: { bg: "#1a3260", text: "#e8b04a" }, Youth: { bg: "#c8922a", text: "#fff" },
  Fundraiser: { bg: "#0f4c2a", text: "#7dda9a" }, Fellowship: { bg: "#4a1a5e", text: "#e8aaf8" },
  Outreach: { bg: "#0f3a4c", text: "#7fd4f8" }, Music: { bg: "#4c2a0f", text: "#f8c87f" },
};

// ── Shared components ─────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      padding: "14px 20px", borderRadius: "8px", maxWidth: "340px",
      background: type === "success" ? T.successBg : T.dangerBg,
      color: type === "success" ? T.success : T.danger,
      border: `1px solid ${type === "success" ? "#97C459" : "#e57373"}`,
      fontFamily: font.body, fontSize: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "inherit", padding: 0 }}>✕</button>
    </div>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(7,14,30,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: T.white, borderRadius: "12px", padding: "2rem", maxWidth: "380px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <p style={{ fontFamily: font.display, fontSize: "20px", fontWeight: 700, color: T.navy, margin: "0 0 0.75rem" }}>Are you sure?</p>
        <p style={{ fontFamily: font.body, fontSize: "15px", color: T.textMid, margin: "0 0 1.75rem", lineHeight: 1.6 }}>{msg}</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ ...btn.outline }}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btn.danger }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={{ display: "block", fontFamily: font.body, fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: T.textLight, marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${focused ? T.gold : T.border}`, borderRadius: "6px", fontFamily: font.body, fontSize: "14px", color: T.textDark, background: T.white, outline: "none", boxSizing: "border-box", boxShadow: focused ? `0 0 0 3px rgba(200,146,42,0.12)` : "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${focused ? T.gold : T.border}`, borderRadius: "6px", fontFamily: font.body, fontSize: "14px", color: T.textDark, background: T.white, outline: "none", boxSizing: "border-box", resize: "vertical", boxShadow: focused ? `0 0 0 3px rgba(200,146,42,0.12)` : "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: "6px", fontFamily: font.body, fontSize: "14px", color: T.textDark, background: T.white, outline: "none", boxSizing: "border-box" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const btn = {
  primary: { padding: "9px 22px", background: T.navy, color: T.white, border: "none", borderRadius: "6px", fontFamily: font.body, fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px", cursor: "pointer" },
  gold:    { padding: "9px 22px", background: T.gold, color: T.white, border: "none", borderRadius: "6px", fontFamily: font.body, fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px", cursor: "pointer" },
  outline: { padding: "9px 22px", background: "transparent", color: T.navy, border: `1px solid ${T.border}`, borderRadius: "6px", fontFamily: font.body, fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  danger:  { padding: "9px 22px", background: T.danger, color: T.white, border: "none", borderRadius: "6px", fontFamily: font.body, fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  icon:    { background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "4px", fontSize: "15px" },
};

// ── EVENTS TAB ────────────────────────────────────────────────────────────
const EMPTY_EVENT = { date: "", day: "Sun", title: "", category: "Worship", description: "", icon: "✝" };
const DAY_OPTS    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => ({ value: d, label: d }));
const CAT_OPTS    = ["Worship","Youth","Fundraiser","Fellowship","Outreach","Music"].map(c => ({ value: c, label: c }));
const ICON_OPTS   = ["✝","🔥","🙌","💛","🌍","🎵","📖","🙏","🎤","🏛️"].map(i => ({ value: i, label: i }));

function EventsTab({ toast }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY_EVENT);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/events`).then(r => r.json()).then(d => { setEvents(Array.isArray(d) ? d : d.events ?? []); setLoading(false); }).catch(() => { setEvents([]); setLoading(false); });
  };
  useEffect(load, []);

  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const startEdit = (e) => { setEditing(e.id); setForm({ date: e.date, day: e.day, title: e.title, category: e.category || "Worship", description: e.description || "", icon: e.icon || "✝" }); };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_EVENT); };

  const save = async () => {
    if (!form.date || !form.day || !form.title) return toast("Date, day and title are required.", "error");
    setSaving(true);
    const url    = editing ? `${API_BASE}/api/events/${editing}` : `${API_BASE}/api/events`;
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { toast(editing ? "Event updated!" : "Event added!", "success"); cancelEdit(); load(); }
    else toast("Failed to save event.", "error");
  };

  const del = async (id) => {
    const res = await fetch(`${API_BASE}/api/events/${id}`, { method: "DELETE" });
    setConfirm(null);
    if (res.ok) { toast("Event deleted.", "success"); load(); }
    else toast("Failed to delete event.", "error");
  };

  return (
    <div style={s.tabWrap}>
      {confirm && <ConfirmModal msg={`Delete "${confirm.title}"? This cannot be undone.`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      {/* Form */}
      <div style={s.formCard}>
        <p style={s.formTitle}>{editing ? "Edit Event" : "Add New Event"}</p>
        <div style={s.formGrid2}>
          <Field label="Date (e.g. Jun 1)"><Input value={form.date} onChange={f("date")} placeholder="Jun 1" /></Field>
          <Field label="Day"><Select value={form.day} onChange={f("day")} options={DAY_OPTS} /></Field>
        </div>
        <Field label="Title"><Input value={form.title} onChange={f("title")} placeholder="Event title" /></Field>
        <div style={s.formGrid2}>
          <Field label="Category"><Select value={form.category} onChange={f("category")} options={CAT_OPTS} /></Field>
          <Field label="Icon"><Select value={form.icon} onChange={f("icon")} options={ICON_OPTS} /></Field>
        </div>
        <Field label="Description"><Textarea value={form.description} onChange={f("description")} placeholder="Brief description of the event…" /></Field>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={save} disabled={saving} style={btn.gold}>{saving ? "Saving…" : editing ? "Update Event" : "Add Event"}</button>
          {editing && <button onClick={cancelEdit} style={btn.outline}>Cancel</button>}
        </div>
      </div>

      {/* List */}
      <div style={s.listWrap}>
        {loading ? <p style={s.loadingText}>Loading events…</p> : events.length === 0 ? <p style={s.emptyText}>No events yet. Add one above.</p> : events.map(e => {
          const cc = categoryColors[e.category] || { bg: T.navyMid, text: T.goldLight };
          return (
            <div key={e.id} style={s.listItem}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{e.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={s.itemTitle}>{e.title}</p>
                  <p style={s.itemMeta}>{e.date} · {e.day} · <span style={{ padding: "1px 8px", borderRadius: "20px", background: cc.bg, color: cc.text, fontSize: "11px", fontWeight: 700 }}>{e.category}</span></p>
                </div>
              </div>
              <div style={s.itemActions}>
                <button onClick={() => startEdit(e)} style={btn.icon} title="Edit">✏️</button>
                <button onClick={() => setConfirm(e)} style={btn.icon} title="Delete">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SERMONS TAB ───────────────────────────────────────────────────────────
const EMPTY_SERMON = { series: "", speaker: "", date: "", scripture: "", tag: "", featured: "0", description: "", file: "" };

function SermonsTab({ toast }) {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY_SERMON);
  const [fileObj, setFileObj] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/sermons`).then(r => r.json()).then(d => { setSermons(Array.isArray(d) ? d : d.sermons ?? []); setLoading(false); }).catch(() => { setSermons([]); setLoading(false); });
  };
  useEffect(load, []);

  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const startEdit = (s) => {
    setEditing(s.id);
    setForm({ series: s.series, speaker: s.speaker, date: s.date, scripture: s.scripture || "", tag: s.tag || "", featured: String(s.featured), description: s.description || "", file: s.file || "" });
    setFileObj(null);
  };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_SERMON); setFileObj(null); };

  const save = async () => {
    if (!form.series || !form.speaker || !form.date) return toast("Series, speaker and date are required.", "error");
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== "file") data.append(k, v); });
    if (fileObj) data.append("file", fileObj);
    else if (form.file) data.append("file_url", form.file); // preserve existing URL on edit
    const url    = editing ? `${API_BASE}/api/sermons/${editing}` : `${API_BASE}/api/sermons`;
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, body: data });
    setSaving(false);
    if (res.ok) { toast(editing ? "Sermon updated!" : "Sermon added!", "success"); cancelEdit(); load(); }
    else toast("Failed to save sermon.", "error");
  };

  const del = async (id) => {
    const res = await fetch(`${API_BASE}/api/sermons/${id}`, { method: "DELETE" });
    setConfirm(null);
    if (res.ok) { toast("Sermon deleted.", "success"); load(); }
    else toast("Failed to delete sermon.", "error");
  };

  return (
    <div style={s.tabWrap}>
      {confirm && <ConfirmModal msg={`Delete "${confirm.series}"? This cannot be undone.`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      <div style={s.formCard}>
        <p style={s.formTitle}>{editing ? "Edit Sermon" : "Add New Sermon"}</p>
        <div style={s.formGrid2}>
          <Field label="Series / Title"><Input value={form.series} onChange={f("series")} placeholder="Walking by Faith" /></Field>
          <Field label="Speaker"><Input value={form.speaker} onChange={f("speaker")} placeholder="Pastor John Mutua" /></Field>
        </div>
        <div style={s.formGrid2}>
          <Field label="Date"><Input value={form.date} onChange={f("date")} placeholder="18 May 2025" /></Field>
          <Field label="Scripture"><Input value={form.scripture} onChange={f("scripture")} placeholder="Hebrews 11:1-6" /></Field>
        </div>
        <div style={s.formGrid2}>
          <Field label="Tag"><Input value={form.tag} onChange={f("tag")} placeholder="Faith, Prayer, Grace…" /></Field>
          <Field label="Featured">
            <Select value={form.featured} onChange={f("featured")} options={[{ value: "0", label: "No" }, { value: "1", label: "Yes — show as latest" }]} />
          </Field>
        </div>
        <Field label="Description"><Textarea value={form.description} onChange={f("description")} placeholder="Brief summary of the sermon…" /></Field>
        <Field label="Upload Sermon File (PDF or Word)">
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFileObj(e.target.files[0] || null)}
            style={{ fontFamily: font.body, fontSize: "14px", color: T.textMid }} />
          {form.file && !fileObj && <p style={{ fontFamily: font.body, fontSize: "12px", color: T.textLight, marginTop: "4px" }}>Current file: {form.file}</p>}
        </Field>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={save} disabled={saving} style={btn.gold}>{saving ? "Saving…" : editing ? "Update Sermon" : "Add Sermon"}</button>
          {editing && <button onClick={cancelEdit} style={btn.outline}>Cancel</button>}
        </div>
      </div>

      <div style={s.listWrap}>
        {loading ? <p style={s.loadingText}>Loading sermons…</p> : sermons.length === 0 ? <p style={s.emptyText}>No sermons yet.</p> : sermons.map(se => (
          <div key={se.id} style={s.listItem}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: T.goldPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>📖</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <p style={s.itemTitle}>{se.series}</p>
                  {se.featured === 1 && <span style={{ padding: "2px 8px", borderRadius: "20px", background: T.gold, color: T.white, fontSize: "10px", fontWeight: 700 }}>FEATURED</span>}
                </div>
                <p style={s.itemMeta}>{se.speaker} · {se.date} {se.tag && `· ${se.tag}`}</p>
              </div>
            </div>
            <div style={s.itemActions}>
              <button onClick={() => startEdit(se)} style={btn.icon} title="Edit">✏️</button>
              <button onClick={() => setConfirm(se)} style={btn.icon} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GALLERY TAB ───────────────────────────────────────────────────────────
const EMPTY_SECTION = { eyebrow: "", title: "", cols: "3" };
const EMPTY_ITEM    = { title: "", alt: "", src: "" };

function GalleryTab({ toast }) {
  const [sections, setSections]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [secForm, setSecForm]     = useState(EMPTY_SECTION);
  const [editingSec, setEditingSec] = useState(null);
  const [addItemTo, setAddItemTo] = useState(null);
  const [itemForm, setItemForm]   = useState(EMPTY_ITEM);
  const [imgFile, setImgFile]     = useState(null);
  const [confirm, setConfirm]     = useState(null);
  const [saving, setSaving]       = useState(false);
  // Replace photo state: { item, sectionId }
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceFile, setReplaceFile]     = useState(null);

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/gallery`).then(r => r.json()).then(d => { setSections(Array.isArray(d) ? d : d.sections ?? []); setLoading(false); }).catch(() => { setSections([]); setLoading(false); });
  };
  useEffect(load, []);

  const sf = (k) => (v) => setSecForm(p => ({ ...p, [k]: v }));
  const itf = (k) => (v) => setItemForm(p => ({ ...p, [k]: v }));

  const saveSec = async () => {
    if (!secForm.eyebrow || !secForm.title) return toast("Eyebrow and title are required.", "error");
    setSaving(true);
    const url    = editingSec ? `${API_BASE}/api/gallery/sections/${editingSec}` : `${API_BASE}/api/gallery/sections`;
    const method = editingSec ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...secForm, cols: parseInt(secForm.cols) }) });
    setSaving(false);
    if (res.ok) { toast(editingSec ? "Section updated!" : "Section created!", "success"); setEditingSec(null); setSecForm(EMPTY_SECTION); load(); }
    else toast("Failed to save section.", "error");
  };

  const delSec = async (id, title) => {
    const res = await fetch(`${API_BASE}/api/gallery/sections/${id}`, { method: "DELETE" });
    setConfirm(null);
    if (res.ok) { toast(`"${title}" deleted.`, "success"); load(); }
    else toast("Failed to delete section.", "error");
  };

  const saveItem = async () => {
    if (!imgFile && !itemForm.src) return toast("Upload an image or provide a path.", "error");
    setSaving(true);
    const data = new FormData();
    if (imgFile) data.append("image", imgFile);
    else data.append("src", itemForm.src);
    data.append("title", itemForm.title);
    data.append("alt",   itemForm.alt);
    const res = await fetch(`${API_BASE}/api/gallery/sections/${addItemTo}/items`, { method: "POST", body: data });
    setSaving(false);
    if (res.ok) { toast("Photo added!", "success"); setAddItemTo(null); setItemForm(EMPTY_ITEM); setImgFile(null); load(); }
    else toast("Failed to add photo.", "error");
  };

  const delItem = async (id) => {
    const res = await fetch(`${API_BASE}/api/gallery/items/${id}`, { method: "DELETE" });
    setConfirm(null);
    if (res.ok) { toast("Photo removed.", "success"); load(); }
    else toast("Failed to remove photo.", "error");
  };

  const replaceItem = async () => {
    if (!replaceFile) return toast("Please choose a replacement image.", "error");
    setSaving(true);
    const delRes = await fetch(`${API_BASE}/api/gallery/items/${replaceTarget.item.id}`, { method: "DELETE" });
    if (!delRes.ok) { setSaving(false); return toast("Failed to remove old photo.", "error"); }
    const data = new FormData();
    data.append("image", replaceFile);
    data.append("title", replaceTarget.item.title || "");
    data.append("alt",   replaceTarget.item.alt   || "");
    data.append("sort_order", replaceTarget.item.sort_order ?? 0);
    const addRes = await fetch(`${API_BASE}/api/gallery/sections/${replaceTarget.sectionId}/items`, { method: "POST", body: data });
    setSaving(false);
    if (addRes.ok) { toast("Photo replaced!", "success"); setReplaceTarget(null); setReplaceFile(null); load(); }
    else toast("Old photo deleted but failed to upload the new one. Please add it manually.", "error");
  };

  return (
    <div style={s.tabWrap}>
      {confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      {/* Replace Photo Modal */}
      {replaceTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(7,14,30,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: T.white, borderRadius: "12px", padding: "2rem", maxWidth: "440px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <p style={s.formTitle}>Replace Photo</p>
            {/* Preview of current image */}
            <div style={{ borderRadius: "8px", overflow: "hidden", marginBottom: "1.25rem", border: `1px solid ${T.border}`, background: "#e8e4de", maxHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={replaceTarget.item.src} alt={replaceTarget.item.alt} style={{ width: "100%", maxHeight: "160px", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
            <p style={{ fontFamily: font.body, fontSize: "12px", color: T.textLight, margin: "-0.25rem 0 1rem" }}>
              Caption: <strong>{replaceTarget.item.title || "—"}</strong> · Alt text will be preserved.
            </p>
            <Field label="Choose New Image">
              <input type="file" accept="image/*" onChange={e => setReplaceFile(e.target.files[0] || null)} style={{ fontFamily: font.body, fontSize: "14px", color: T.textMid }} />
            </Field>
            {replaceFile && (
              <p style={{ fontFamily: font.body, fontSize: "12px", color: T.success, margin: "-0.5rem 0 0.75rem" }}>
                ✓ Ready to upload: {replaceFile.name}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <button onClick={replaceItem} disabled={saving || !replaceFile} style={{ ...btn.gold, opacity: (!replaceFile || saving) ? 0.6 : 1 }}>
                {saving ? "Replacing…" : "Replace Photo"}
              </button>
              <button onClick={() => { setReplaceTarget(null); setReplaceFile(null); }} style={btn.outline}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemTo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(7,14,30,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: T.white, borderRadius: "12px", padding: "2rem", maxWidth: "440px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <p style={s.formTitle}>Add Photo</p>
            <Field label="Upload Image"><input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0] || null)} style={{ fontFamily: font.body, fontSize: "14px", color: T.textMid }} /></Field>
            <p style={{ fontFamily: font.body, fontSize: "12px", color: T.textLight, margin: "-0.5rem 0 1rem", textAlign: "center" }}>— or —</p>
            <Field label="Image Path / URL"><Input value={itemForm.src} onChange={itf("src")} placeholder="images/photo.jpg" /></Field>
            <Field label="Caption (optional)"><Input value={itemForm.title} onChange={itf("title")} placeholder="e.g. Sunday School Session" /></Field>
            <Field label="Alt text"><Input value={itemForm.alt} onChange={itf("alt")} placeholder="Brief description for accessibility" /></Field>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button onClick={saveItem} disabled={saving} style={btn.gold}>{saving ? "Uploading…" : "Add Photo"}</button>
              <button onClick={() => { setAddItemTo(null); setItemForm(EMPTY_ITEM); setImgFile(null); }} style={btn.outline}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Section form */}
      <div style={s.formCard}>
        <p style={s.formTitle}>{editingSec ? "Edit Section" : "Add New Gallery Section"}</p>
        <div style={s.formGrid2}>
          <Field label="Eyebrow (e.g. Worship Ministry)"><Input value={secForm.eyebrow} onChange={sf("eyebrow")} placeholder="Worship Ministry" /></Field>
          <Field label="Title (e.g. Choir)"><Input value={secForm.title} onChange={sf("title")} placeholder="Choir" /></Field>
        </div>
        <Field label="Columns">
          <Select value={secForm.cols} onChange={sf("cols")} options={[{ value: "2", label: "2 columns" }, { value: "3", label: "3 columns" }]} />
        </Field>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={saveSec} disabled={saving} style={btn.gold}>{saving ? "Saving…" : editingSec ? "Update Section" : "Create Section"}</button>
          {editingSec && <button onClick={() => { setEditingSec(null); setSecForm(EMPTY_SECTION); }} style={btn.outline}>Cancel</button>}
        </div>
      </div>

      {/* Sections list */}
      {loading ? <p style={s.loadingText}>Loading gallery…</p> : sections.length === 0 ? <p style={s.emptyText}>No gallery sections yet.</p> : sections.map(sec => (
        <div key={sec.id} style={{ ...s.formCard, marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <p style={{ fontFamily: font.body, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: T.gold, margin: 0 }}>{sec.eyebrow}</p>
              <p style={{ fontFamily: font.display, fontSize: "18px", fontWeight: 700, color: T.navy, margin: 0 }}>{sec.title}</p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => { setEditingSec(sec.id); setSecForm({ eyebrow: sec.eyebrow, title: sec.title, cols: String(sec.cols) }); }} style={btn.outline}>Edit Section</button>
              <button onClick={() => setAddItemTo(sec.id)} style={btn.gold}>+ Add Photo</button>
              <button onClick={() => setConfirm({ msg: `Delete section "${sec.title}" and all its photos?`, action: () => delSec(sec.id, sec.title) })} style={{ ...btn.icon, color: T.danger }}>🗑️</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
            {(sec.items || []).map(item => (
              <div key={item.id} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: `1px solid ${T.border}`, background: "#e8e4de", aspectRatio: "4/3" }}>
                <img src={item.src} alt={item.alt} onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {/* Delete button */}
                <button onClick={() => setConfirm({ msg: `Remove this photo?`, action: () => delItem(item.id) })}
                  style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(7,14,30,0.75)", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", color: T.white, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                {/* Replace button */}
                <button onClick={() => setReplaceTarget({ item, sectionId: sec.id })}
                  title="Replace photo"
                  style={{ position: "absolute", top: "4px", right: "34px", background: "rgba(200,146,42,0.88)", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", color: T.white, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
                {item.title && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(7,14,30,0.7)", padding: "3px 6px" }}><p style={{ fontFamily: font.body, fontSize: "11px", color: T.white, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p></div>}
              </div>
            ))}
            {(sec.items || []).length === 0 && <p style={{ fontFamily: font.body, fontSize: "13px", color: T.textLight, gridColumn: "1/-1" }}>No photos yet. Click "+ Add Photo" to add some.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MESSAGES TAB ──────────────────────────────────────────────────────────
function MessagesTab({ toast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/contact`).then(r => r.json()).then(d => { setMessages(Array.isArray(d) ? d : d.messages ?? []); setLoading(false); }).catch(() => { setMessages([]); setLoading(false); });
  };
  useEffect(load, []);

  const del = async (id) => {
    const res = await fetch(`${API_BASE}/api/contact/${id}`, { method: "DELETE" });
    setConfirm(null);
    if (res.ok) { toast("Message deleted.", "success"); load(); }
    else toast("Failed to delete.", "error");
  };

  return (
    <div style={s.tabWrap}>
      {confirm && <ConfirmModal msg="Delete this message? This cannot be undone." onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}

      <div style={{ ...s.formCard, background: T.goldPale, border: `1px solid ${T.border}`, marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: font.body, fontSize: "14px", color: T.textMid, margin: 0 }}>
          💬 <strong>Read-only view.</strong> These are messages submitted through the Contact page. You can read and delete them here.
        </p>
      </div>

      {loading ? <p style={s.loadingText}>Loading messages…</p> : messages.length === 0 ? (
        <p style={s.emptyText}>No messages yet.</p>
      ) : messages.map(m => (
        <div key={m.id} style={{ ...s.listItem, flexDirection: "column", alignItems: "stretch", gap: "0.5rem", cursor: "pointer" }} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: T.navyMid, display: "flex", alignItems: "center", justifyContent: "center", color: T.goldLight, fontFamily: font.display, fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>
                {m.name[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={s.itemTitle}>{m.name}</p>
                <p style={s.itemMeta}>{m.phone} {m.subject ? `· ${m.subject}` : ""} · {new Date(m.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: font.body, fontSize: "12px", color: T.textLight }}>{expanded === m.id ? "▲" : "▼"}</span>
              <button onClick={e => { e.stopPropagation(); setConfirm(m); }} style={{ ...btn.icon, color: T.danger }}>🗑️</button>
            </div>
          </div>
          {expanded === m.id && (
            <div style={{ background: T.cream, borderRadius: "8px", padding: "1rem", marginTop: "0.25rem", borderLeft: `3px solid ${T.gold}` }}>
              <p style={{ fontFamily: font.body, fontSize: "14px", color: T.textMid, lineHeight: "1.75", margin: 0 }}>{m.message}</p>
              <a href={`mailto:${m.phone}?subject=Re: ${m.subject || "Your message"}`} style={{ display: "inline-block", marginTop: "0.75rem", fontFamily: font.body, fontSize: "13px", color: T.gold, fontWeight: 700 }}>Reply via phone call →</a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────
const s = {
  tabWrap:     { paddingTop: "1.5rem" },
  formCard:    { background: T.white, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.75rem", boxShadow: "0 2px 16px rgba(15,31,61,0.06)" },
  formTitle:   { fontFamily: font.display, fontSize: "20px", fontWeight: 700, color: T.navy, margin: "0 0 1.25rem" },
  formGrid2:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 1rem" },
  listWrap:    { marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  listItem:    { background: T.white, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", boxShadow: "0 2px 8px rgba(15,31,61,0.04)" },
  itemTitle:   { fontFamily: font.body, fontSize: "15px", fontWeight: 700, color: T.navy, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemMeta:    { fontFamily: font.body, fontSize: "12px", color: T.textLight, margin: "3px 0 0" },
  itemActions: { display: "flex", gap: "4px", flexShrink: 0 },
  loadingText: { fontFamily: font.body, fontSize: "14px", color: T.textLight, padding: "2rem 0", textAlign: "center" },
  emptyText:   { fontFamily: font.body, fontSize: "14px", color: T.textLight, padding: "2rem 0", textAlign: "center", fontStyle: "italic" },
};

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Events");
  const [toast, setToast]         = useState(null);
  const [authed, setAuthed]       = useState(false);
  const [password, setPassword]   = useState("");
  const [pwError, setPwError]     = useState(false);

  // Inject fonts
  useEffect(() => {
    if (document.getElementById("aic-fonts")) return;
    const link = document.createElement("link");
    link.id = "aic-fonts"; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lato:wght@400;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Simple password gate — change "admin1234" to your own password
  const ADMIN_PASSWORD = "admin1234";

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ background: T.white, borderRadius: "12px", padding: "2.5rem", maxWidth: "360px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", textAlign: "center" }}>
          <div style={{ fontFamily: font.display, fontSize: "36px", color: T.gold, opacity: 0.4, marginBottom: "0.5rem" }}>✝</div>
          <p style={{ fontFamily: font.display, fontSize: "24px", fontWeight: 800, color: T.navy, margin: "0 0 0.25rem" }}>Admin Dashboard</p>
          <p style={{ fontFamily: font.body, fontSize: "14px", color: T.textLight, margin: "0 0 2rem" }}>AIC Mulutu Township</p>
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === "Enter" && (password === ADMIN_PASSWORD ? setAuthed(true) : setPwError(true))}
            placeholder="Enter admin password"
            style={{ width: "100%", padding: "10px 14px", border: `1px solid ${pwError ? T.danger : T.border}`, borderRadius: "6px", fontFamily: font.body, fontSize: "14px", color: T.textDark, outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
          {pwError && <p style={{ fontFamily: font.body, fontSize: "13px", color: T.danger, margin: "-0.25rem 0 0.75rem" }}>Incorrect password.</p>}
          <button onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : setPwError(true)} style={{ ...btn.gold, width: "100%", padding: "11px" }}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: font.body }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, padding: "0 2rem" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontFamily: font.display, fontSize: "22px", color: T.gold, opacity: 0.7 }}>✝</span>
            <div>
              <p style={{ fontFamily: font.display, fontSize: "17px", fontWeight: 800, color: T.white, margin: 0, lineHeight: 1 }}>AIC Mulutu</p>
              <p style={{ fontFamily: font.body, fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0, letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Dashboard</p>
            </div>
          </div>
          <button onClick={() => setAuthed(false)} style={{ ...btn.outline, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)", fontSize: "12px", padding: "6px 14px" }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "0 2rem" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", display: "flex", gap: "0" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontFamily: font.body, fontSize: "14px", fontWeight: 700, padding: "16px 20px", background: "none", border: "none",
              cursor: "pointer", color: activeTab === tab ? T.gold : T.textLight,
              borderBottom: `2px solid ${activeTab === tab ? T.gold : "transparent"}`,
              transition: "color 0.15s", letterSpacing: "0.3px",
            }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        {activeTab === "Events"   && <EventsTab   toast={showToast} />}
        {activeTab === "Sermons"  && <SermonsTab  toast={showToast} />}
        {activeTab === "Gallery"  && <GalleryTab  toast={showToast} />}
        {activeTab === "Messages" && <MessagesTab toast={showToast} />}
      </div>
    </div>
  );
}