# WasteWise AI — System Architecture

**Tagline**: *"Identify. Recycle. Sustain."*

## 1. High-Level Architecture Overview

WasteWise AI is engineered as a decoupled full-stack platform consisting of a high-performance Python FastAPI backend, a modern TypeScript React frontend, a persistent SQLite/PostgreSQL relational data store, and a modular AI vision inference engine.

```
+-------------------------------------------------------------------------+
|                              USER CLIENT                                |
|   (Desktop / Tablet / Mobile Browser via React 18 + Vite + Tailwind)   |
+------------------------------------+------------------------------------+
                                     |  HTTPS / REST / JSON
                                     v
+-------------------------------------------------------------------------+
|                        FASTAPI APPLICATION SERVER                       |
|                                                                         |
|  +--------------------+   +-------------------+   +------------------+  |
|  | Authentication API |   |  Waste Scan API   |   | Center & Map API |  |
|  | - JWT (HS256)      |   | - Image Ingestion |   | - Haversine Geo  |  |
|  | - Bcrypt (<= 72 B) |   | - Persist Scans   |   | - OSM Tile Proxy |  |
|  +--------------------+   +-------------------+   +------------------+  |
|  +--------------------+   +-------------------+   +------------------+  |
|  | Dashboard Stats    |   | In-App Notifs     |   | Admin Control    |  |
|  | - CO2 Saved (kg)   |   | - Achievements    |   | - User Roles     |  |
|  | - Diversion Rate % |   | - Streak Alerts   |   | - Model Tuning   |  |
|  +--------------------+   +-------------------+   +------------------+  |
+-------------------+-----------------------------------+-----------------+
                    |                                   |
                    v                                   v
+------------------------------------+   +--------------------------------+
|       PERSISTENT DATABASE          |   |     MODULAR AI VISION CORE     |
|   (SQLite / PostgreSQL via ORM)    |   |                                |
|  - Users                           |   | - PyTorch Deep Learning Model  |
|  - WasteScans                      |   | - Pillow/NumPy Material Cues   |
|  - RecyclingCenters                |   | - 8-Class Material Taxonomy    |
|  - Notifications                   |   | - Dynamic Confidence Threshold |
|  - AIModelLogs                     |   | - Feedback Recalibration Loop  |
+------------------------------------+   +--------------------------------+
```

## 2. Security & Bcrypt 72-Byte Validation Architecture

Standard bcrypt implementations truncate input strings at 72 bytes. To prevent silent truncation vulnerabilities and ensure high entropy passwords:
1. `validate_password_rules()` inspects `len(password.encode('utf-8'))`.
2. Passwords exceeding 72 UTF-8 bytes are rejected with HTTP 422 Unprocessable Entity.
3. Passwords with fewer than 8 characters are rejected.
4. Passwords containing multi-byte Unicode (emojis, accents) are accurately measured in byte length before hashing.

## 3. Database Schema Design (SQLAlchemy ORM)

### Users (`users`)
- `id` (PK, Integer)
- `email` (Unique, Indexed, String)
- `hashed_password` (String)
- `full_name` (String)
- `role` ("USER" | "ADMIN")
- `is_active` (Boolean)
- `sustainability_score` (Integer, 0-100)
- `eco_tier` ("Seedling" | "Eco Explorer" | "Green Guardian" | "Earth Champion")
- `current_streak` (Integer)
- `total_scans_count` (Integer)
- `total_recycled_count` (Integer)
- `diverted_weight_kg` (Float)
- `carbon_saved_kg` (Float)

### Waste Scans (`waste_scans`)
- `id` (PK, Integer)
- `user_id` (FK -> users.id)
- `image_path` (String)
- `category` (String: Plastic, Paper, Glass, Metal, Organic, E-Waste, Hazardous, Landfill)
- `subcategory` (String)
- `confidence` (Float)
- `is_recyclable` (Boolean)
- `disposal_instructions` (Text)
- `target_bin_color` (String)
- `estimated_carbon_saved_kg` (Float)
- `estimated_weight_kg` (Float)
- `user_feedback_correct` (Boolean, Nullable)

### Recycling Centers (`recycling_centers`)
- `id` (PK, Integer)
- `name` (String)
- `address` (String)
- `city` (String)
- `latitude` (Float)
- `longitude` (Float)
- `operating_hours` (String)
- `accepted_materials` (JSON Array of Strings)
- `is_municipal` (Boolean)
- `rating` (Float)

## 4. Frontend Technology Stack
- **Framework**: React 18 with TypeScript and Vite.
- **Styling**: Tailwind CSS with custom eco-green and slate color palettes.
- **Charts**: Recharts for responsive waste composition pie/donut charts, weekly diversion bars, and monthly carbon trend areas.
- **Mapping**: Leaflet and React Leaflet configured with OpenStreetMap tile servers (no paid proprietary map APIs).
