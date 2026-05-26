"""
Church API – FastAPI backend
Covers: /api/contact, /api/events, /api/gallery, /api/sermons
"""

import os
import time
import math
import random
import shutil
import pymysql
import pymysql.cursors
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Church API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
    max_age=600,
)

class StaticCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        return response

app.add_middleware(StaticCORSMiddleware)

# Explicit OPTIONS handler — some hosts (alwaysdata, nginx proxies) strip
# CORS headers from preflight responses before FastAPI can add them.
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

UPLOAD_DIR = Path("uploads")
SERMON_DIR = Path("sermons")
UPLOAD_DIR.mkdir(exist_ok=True)
SERMON_DIR.mkdir(exist_ok=True)

STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/sermons", StaticFiles(directory=str(SERMON_DIR)), name="sermons")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ---------------------------------------------------------------------------
# Database connection
# ---------------------------------------------------------------------------

def get_db():
    try:
        conn = pymysql.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "church_db"),
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
            connect_timeout=5,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")
    try:
        yield conn
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ContactIn(BaseModel):
    name: str
    phone: str
    subject: Optional[str] = ""
    message: str


class EventIn(BaseModel):
    date: str
    day: str
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None


class EventPatch(BaseModel):
    date: Optional[str] = None
    day: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None


class GallerySectionIn(BaseModel):
    eyebrow: str
    title: str
    cols: Optional[int] = 3
    sort_order: Optional[int] = 0


class GallerySectionPatch(BaseModel):
    eyebrow: Optional[str] = None
    title: Optional[str] = None
    cols: Optional[int] = None
    sort_order: Optional[int] = None


# ---------------------------------------------------------------------------
# Health check — use this to verify the app is running on alwaysdata:
#   curl https://caocake.alwaysdata.net/api/health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# CONTACT  /api/contact
# ---------------------------------------------------------------------------

@app.post("/api/contact", status_code=201)
def create_contact(body: ContactIn, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO contact_messages (name, phone, subject, message) VALUES (%s,%s,%s,%s)",
            (body.name, body.phone, body.subject or "", body.message),
        )
        return {"success": True, "id": cur.lastrowid}


@app.get("/api/contact")
def list_contacts(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM contact_messages ORDER BY created_at DESC")
        return cur.fetchall()


@app.delete("/api/contact/{msg_id}")
def delete_contact(msg_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM contact_messages WHERE id = %s", (msg_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "Message not found")
        return {"success": True}


# ---------------------------------------------------------------------------
# EVENTS  /api/events
# ---------------------------------------------------------------------------

@app.get("/api/events")
def list_events(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM events ORDER BY id ASC")
        return cur.fetchall()


@app.get("/api/events/{event_id}")
def get_event(event_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM events WHERE id = %s", (event_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Event not found")
        return row


@app.post("/api/events", status_code=201)
def create_event(body: EventIn, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO events (date, day, title, category, description, icon) VALUES (%s,%s,%s,%s,%s,%s)",
            (body.date, body.day, body.title, body.category, body.description, body.icon),
        )
        return {"success": True, "id": cur.lastrowid}


@app.patch("/api/events/{event_id}")
def update_event(event_id: int, body: EventPatch, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM events WHERE id = %s", (event_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(404, "Event not found")
        cur.execute(
            "UPDATE events SET date=%s, day=%s, title=%s, category=%s, description=%s, icon=%s WHERE id=%s",
            (
                body.date        or existing["date"],
                body.day         or existing["day"],
                body.title       or existing["title"],
                body.category    if body.category    is not None else existing["category"],
                body.description if body.description is not None else existing["description"],
                body.icon        if body.icon        is not None else existing["icon"],
                event_id,
            ),
        )
        return {"success": True}


@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("DELETE FROM events WHERE id = %s", (event_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "Event not found")
        return {"success": True}


# ---------------------------------------------------------------------------
# GALLERY  /api/gallery
# ---------------------------------------------------------------------------

@app.get("/api/gallery")
def list_gallery(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM gallery_sections ORDER BY sort_order")
        sections = cur.fetchall()
        cur.execute("SELECT * FROM gallery_items ORDER BY sort_order")
        items = cur.fetchall()
    return [
        {**sec, "items": [i for i in items if i["section_id"] == sec["id"]]}
        for sec in sections
    ]


@app.post("/api/gallery/sections", status_code=201)
def create_gallery_section(body: GallerySectionIn, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO gallery_sections (eyebrow, title, cols, sort_order) VALUES (%s,%s,%s,%s)",
            (body.eyebrow, body.title, body.cols or 3, body.sort_order or 0),
        )
        return {"success": True, "id": cur.lastrowid}


@app.patch("/api/gallery/sections/{section_id}")
def update_gallery_section(section_id: int, body: GallerySectionPatch, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM gallery_sections WHERE id = %s", (section_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(404, "Section not found")
        cur.execute(
            "UPDATE gallery_sections SET eyebrow=%s, title=%s, cols=%s, sort_order=%s WHERE id=%s",
            (
                body.eyebrow    or existing["eyebrow"],
                body.title      or existing["title"],
                body.cols       if body.cols       is not None else existing["cols"],
                body.sort_order if body.sort_order is not None else existing["sort_order"],
                section_id,
            ),
        )
        return {"success": True}


@app.delete("/api/gallery/sections/{section_id}")
def delete_gallery_section(section_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT src FROM gallery_items WHERE section_id = %s", (section_id,))
        items = cur.fetchall()
        for item in items:
            if item["src"] and item["src"].startswith("/uploads/"):
                p = Path(".") / item["src"].lstrip("/")
                if p.exists():
                    p.unlink()
        cur.execute("DELETE FROM gallery_sections WHERE id = %s", (section_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "Section not found")
        return {"success": True}


@app.post("/api/gallery/sections/{section_id}/items", status_code=201)
def add_gallery_item(
    section_id: int,
    image: Optional[UploadFile] = File(None),
    src: Optional[str] = Form(None),
    title: Optional[str] = Form(""),
    alt: Optional[str] = Form(""),
    sort_order: Optional[int] = Form(0),
    db=Depends(get_db),
):
    with db.cursor() as cur:
        cur.execute("SELECT id FROM gallery_sections WHERE id = %s", (section_id,))
        if not cur.fetchone():
            raise HTTPException(404, "Section not found")

        if image:
            ext = Path(image.filename).suffix
            filename = f"{int(time.time())}-{math.floor(random.random() * 1_000_000)}{ext}"
            dest = UPLOAD_DIR / filename
            with dest.open("wb") as f:
                shutil.copyfileobj(image.file, f)
            file_src = f"/uploads/{filename}"
        elif src:
            file_src = src
        else:
            raise HTTPException(400, "image file or src is required")

        cur.execute(
            "INSERT INTO gallery_items (section_id, title, src, alt, sort_order) VALUES (%s,%s,%s,%s,%s)",
            (section_id, title or "", file_src, alt or "", sort_order or 0),
        )
        return {"success": True, "id": cur.lastrowid}


@app.get("/api/gallery/{section_id}")
def get_gallery_section(section_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM gallery_sections WHERE id = %s", (section_id,))
        sec = cur.fetchone()
        if not sec:
            raise HTTPException(404, "Section not found")
        cur.execute(
            "SELECT * FROM gallery_items WHERE section_id = %s ORDER BY sort_order",
            (section_id,),
        )
        items = cur.fetchall()
    return {**sec, "items": items}


@app.delete("/api/gallery/items/{item_id}")
def delete_gallery_item(item_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM gallery_items WHERE id = %s", (item_id,))
        item = cur.fetchone()
        if not item:
            raise HTTPException(404, "Item not found")
        if item["src"] and item["src"].startswith("/uploads/"):
            p = Path(".") / item["src"].lstrip("/")
            if p.exists():
                p.unlink()
        cur.execute("DELETE FROM gallery_items WHERE id = %s", (item_id,))
        return {"success": True}


# ---------------------------------------------------------------------------
# SERMONS  /api/sermons
# ---------------------------------------------------------------------------

ALLOWED_SERMON_EXT = {".pdf", ".doc", ".docx"}


@app.get("/api/sermons")
def list_sermons(tag: Optional[str] = None, featured: Optional[str] = None, db=Depends(get_db)):
    query = "SELECT * FROM sermons WHERE 1=1"
    params: list = []
    if tag and tag != "All":
        query += " AND tag = %s"
        params.append(tag)
    if featured == "true":
        query += " AND featured = 1"
    query += " ORDER BY id DESC"
    with db.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()


@app.get("/api/sermons/tags")
def list_sermon_tags(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT DISTINCT tag FROM sermons WHERE tag IS NOT NULL ORDER BY tag")
        rows = cur.fetchall()
    return ["All", *[r["tag"] for r in rows]]


@app.get("/api/sermons/{sermon_id}")
def get_sermon(sermon_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM sermons WHERE id = %s", (sermon_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Sermon not found")
        return row


@app.post("/api/sermons", status_code=201)
def create_sermon(
    file: Optional[UploadFile] = File(None),
    file_url: Optional[str] = Form(None, alias="file_url"),
    series: str = Form(...),
    speaker: str = Form(...),
    date: str = Form(...),
    scripture: Optional[str] = Form(None),
    tag: Optional[str] = Form(None),
    featured: Optional[int] = Form(0),
    description: Optional[str] = Form(None),
    db=Depends(get_db),
):
    file_path = _save_sermon_file(file, file_url)
    with db.cursor() as cur:
        if featured == 1:
            cur.execute("UPDATE sermons SET featured = 0")
        cur.execute(
            "INSERT INTO sermons (series, speaker, date, scripture, tag, featured, description, file)"
            " VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (series, speaker, date, scripture, tag, featured or 0, description, file_path),
        )
        return {"success": True, "id": cur.lastrowid}


@app.patch("/api/sermons/{sermon_id}")
def update_sermon(
    sermon_id: int,
    file: Optional[UploadFile] = File(None),
    file_url: Optional[str] = Form(None, alias="file_url"),
    series: Optional[str] = Form(None),
    speaker: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    scripture: Optional[str] = Form(None),
    tag: Optional[str] = Form(None),
    featured: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    db=Depends(get_db),
):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM sermons WHERE id = %s", (sermon_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(404, "Sermon not found")

        new_file = _save_sermon_file(file, file_url)
        file_path = new_file if new_file else existing["file"]

        if featured == 1:
            cur.execute("UPDATE sermons SET featured = 0")

        cur.execute(
            "UPDATE sermons SET series=%s, speaker=%s, date=%s, scripture=%s,"
            " tag=%s, featured=%s, description=%s, file=%s WHERE id=%s",
            (
                series      or existing["series"],
                speaker     or existing["speaker"],
                date        or existing["date"],
                scripture   if scripture   is not None else existing["scripture"],
                tag         if tag         is not None else existing["tag"],
                featured    if featured    is not None else existing["featured"],
                description if description is not None else existing["description"],
                file_path,
                sermon_id,
            ),
        )
        return {"success": True}


@app.delete("/api/sermons/{sermon_id}")
def delete_sermon(sermon_id: int, db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT * FROM sermons WHERE id = %s", (sermon_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Sermon not found")
        if row["file"]:
            p = Path(".") / row["file"].lstrip("/")
            if p.exists():
                p.unlink()
        cur.execute("DELETE FROM sermons WHERE id = %s", (sermon_id,))
        return {"success": True}


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _save_sermon_file(
    upload: Optional[UploadFile], url: Optional[str]
) -> Optional[str]:
    if upload:
        ext = Path(upload.filename).suffix.lower()
        if ext not in ALLOWED_SERMON_EXT:
            raise HTTPException(400, "Only PDF and Word documents are allowed")
        safe_name = upload.filename.replace(" ", "-").lower()
        dest = SERMON_DIR / safe_name
        with dest.open("wb") as f:
            shutil.copyfileobj(upload.file, f)
        return f"/sermons/{safe_name}"
    return url or None


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)