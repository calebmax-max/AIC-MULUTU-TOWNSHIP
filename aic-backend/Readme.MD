# Church API — Python / FastAPI

## Project Structure

```
church-api/
├── main.py               # All API routes (Contact, Events, Gallery, Sermons)
├── schema.sql            # MySQL table definitions — run once
├── requirements.txt      # Python dependencies
├── .env                  # Local environment variables (do not commit)
├── .gitignore
└── README.md
```

## Setup

### 1. Install dependencies
```bash
pip3 install -r requirements.txt --user
```

### 2. Create the database tables
Log in to your alwaysdata phpMyAdmin or run via SSH:
```bash
mysql -h mysql-youraccountname.alwaysdata.net -u your_db_user -p your_db_name < schema.sql
```

### 3. Configure environment variables
Copy `.env` and fill in your real values:
```
DB_HOST=mysql-youraccountname.alwaysdata.net
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

### 4. Run locally
```bash
uvicorn main:app --reload --port 8000
```

### 5. Deploy on alwaysdata
- Go to **Web > Sites** → Add site → Type: **User program**
- Command: `uvicorn main:app --port $PORT --host $IP`
- Working directory: `/home/your-account/church-api`
- Set DB env vars under **Advanced > Environment**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact message |
| GET | `/api/contact` | List all messages |
| DELETE | `/api/contact/:id` | Delete a message |
| GET | `/api/events` | List all events |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event |
| PATCH | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/api/gallery` | Full gallery with sections & items |
| GET | `/api/gallery/:sectionId` | Single section with items |
| POST | `/api/gallery/sections` | Create gallery section |
| PATCH | `/api/gallery/sections/:id` | Update section |
| DELETE | `/api/gallery/sections/:id` | Delete section + images |
| POST | `/api/gallery/sections/:id/items` | Upload gallery image |
| DELETE | `/api/gallery/items/:id` | Delete gallery item + file |
| GET | `/api/sermons` | List sermons (filter: ?tag=&featured=true) |
| GET | `/api/sermons/tags` | List distinct tags |
| GET | `/api/sermons/:id` | Get single sermon |
| POST | `/api/sermons` | Upload sermon |
| PATCH | `/api/sermons/:id` | Update sermon |
| DELETE | `/api/sermons/:id` | Delete sermon + file |