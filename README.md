# AIC Mulutu Township — Backend API

Node.js + Express + SQLite backend for the church website.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and edit if needed
cp .env.example .env

# 3. Start the server
npm start          # production
npm run dev        # development (auto-restart on changes)
```

The server starts on **http://localhost:4000**.  
The SQLite database (`aic.db`) and all tables are created automatically on first run. Seed data is also inserted automatically (sermons, events, gallery sections).

---

## Folder structure

```
aic-backend/
├── server.js              # App entry point
├── aic.db                 # SQLite DB (auto-created)
├── sermons/               # Uploaded sermon files (.pdf / .docx)
├── uploads/               # Uploaded gallery images
├── src/
│   ├── db/
│   │   └── migrate.js     # Table creation + seed data
│   └── routes/
│       ├── contact.js
│       ├── sermons.js
│       ├── gallery.js
│       └── events.js
```

---

## API Reference

### Contact  `/api/contact`

| Method | Path              | Body                                      | Description              |
|--------|-------------------|-------------------------------------------|--------------------------|
| POST   | `/api/contact`    | `{ name, phone, subject?, message }`      | Submit contact form      |
| GET    | `/api/contact`    | —                                         | List all messages        |
| DELETE | `/api/contact/:id`| —                                         | Delete a message         |

---

### Sermons  `/api/sermons`

| Method | Path                  | Body / Params                                              | Description              |
|--------|-----------------------|------------------------------------------------------------|--------------------------|
| GET    | `/api/sermons`        | `?tag=Faith` `?featured=true`                              | List sermons (filterable)|
| GET    | `/api/sermons/tags`   | —                                                          | All unique tags          |
| GET    | `/api/sermons/:id`    | —                                                          | Single sermon            |
| POST   | `/api/sermons`        | `multipart/form-data`: `series, speaker, date, scripture?, tag?, featured?, description?, file?` | Add sermon |
| PATCH  | `/api/sermons/:id`    | Same fields (all optional)                                 | Update sermon            |
| DELETE | `/api/sermons/:id`    | —                                                          | Delete sermon + file     |

Sermon files are served at: `GET /sermons/<filename>`

---

### Gallery  `/api/gallery`

| Method | Path                                  | Body                                         | Description              |
|--------|---------------------------------------|----------------------------------------------|--------------------------|
| GET    | `/api/gallery`                        | —                                            | All sections + items     |
| GET    | `/api/gallery/:sectionId`             | —                                            | One section + items      |
| POST   | `/api/gallery/sections`               | `{ eyebrow, title, cols?, sort_order? }`     | Create section           |
| PATCH  | `/api/gallery/sections/:id`           | Same fields (all optional)                   | Update section           |
| DELETE | `/api/gallery/sections/:id`           | —                                            | Delete section + items   |
| POST   | `/api/gallery/sections/:id/items`     | `multipart/form-data`: `image?, src?, title?, alt?, sort_order?` | Add item  |
| DELETE | `/api/gallery/items/:id`              | —                                            | Delete item              |

Gallery images are served at: `GET /uploads/<filename>`

---

### Events  `/api/events`

| Method | Path               | Body                                                    | Description   |
|--------|--------------------|---------------------------------------------------------|---------------|
| GET    | `/api/events`      | —                                                       | All events    |
| GET    | `/api/events/:id`  | —                                                       | Single event  |
| POST   | `/api/events`      | `{ date, day, title, category?, description?, icon? }`  | Add event     |
| PATCH  | `/api/events/:id`  | Same fields (all optional)                              | Update event  |
| DELETE | `/api/events/:id`  | —                                                       | Delete event  |

---

## Connecting the frontend

In each React page, replace the hardcoded data arrays with `fetch` calls.  
Example for **SermonsPage**:

```js
// Replace the SERIES constant with:
const [sermons, setSermons] = useState([]);

useEffect(() => {
  fetch("http://localhost:4000/api/sermons")
    .then(r => r.json())
    .then(setSermons);
}, []);
```

Set `FRONTEND_URL` in `.env` to your deployed frontend URL when going live.# AIC-MULUTU-TOWNSHIP
