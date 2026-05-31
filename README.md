# MediTrace

**A full-stack digital healthcare platform connecting patients, doctors, and pharmacies.**

MediTrace lets patients run symptom-driven self-triage with their vitals, book the right specialist, track medications and healthy habits, and find medicines at registered pharmacies nearby. Doctors get a clinical dashboard for appointments, patient records, and prescription writing. Pharmacies manage live inventory that patients can search across.

---

## Tech Stack

- **Frontend:** HTML5 + CSS3 + Vanilla JS (no build step). Distinctive clinical-editorial design using Fraunces (serif), Outfit (sans), JetBrains Mono.
- **Backend:** Node.js + Express.js (REST API)
- **Database:** MySQL 8+
- **Auth:** JWT (7-day expiry), bcryptjs password hashing
- **Deployment:** Render-ready (single-process serves API + static frontend)

---

## Project structure

```
meditrace/
├── backend/
│   ├── config/database.js       # MySQL pool
│   ├── database/
│   │   ├── schema.sql           # 18-table DDL
│   │   ├── seed.sql             # 100+ symptoms, 60+ diseases, demo users
│   │   └── init.js              # Bootstrap script
│   ├── middleware/auth.js       # JWT + role guard
│   ├── routes/                  # auth, symptoms, appointments, prescriptions,
│   │                            #   vitals, habits, medicines
│   ├── server.js                # Express app + static file serving
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html               # Landing + login + register
│   ├── pages/
│   │   ├── patient.html         # Patient dashboard
│   │   ├── doctor.html          # Doctor dashboard
│   │   └── medical.html         # Pharmacy dashboard
│   ├── css/style.css            # Full design system
│   └── js/
│       ├── api.js               # Shared API client + utilities
│       ├── patient.js
│       ├── doctor.js
│       └── medical.js
└── README.md
```

---

## Getting started locally

### 1. Prerequisites

- **Node.js 18+** (`node -v`)
- **MySQL 8+** running locally (or a remote MySQL URL)
- npm

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=meditrace
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5000
```

### 4. Create database

In MySQL:

```sql
CREATE DATABASE meditrace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Initialize schema + seed data

```bash
npm run init-db
```

This loads the 18-table schema, seeds 100+ symptoms, 60+ diseases with weighted symptom mappings, healthy habits, sample medicines and inventory, plus demo accounts.

### 6. Start the server

```bash
npm start          # production
npm run dev        # with nodemon auto-reload
```

Open **http://localhost:5000** — you should see the MediTrace landing page.

---

## Demo accounts

All demo accounts use password **`password123`**:

| Email | Role | Notes |
|---|---|---|
| `patient@demo.com` | Patient | Sample patient with profile pre-filled |
| `doctor@demo.com` | Doctor | Dr. Rajesh Kumar — General Physician |
| `cardio@demo.com` | Doctor | Dr. Priya Sharma — Cardiologist |
| `neuro@demo.com` | Doctor | Dr. Amit Patel — Neurologist |
| `medical@demo.com` | Pharmacy | Apollo Pharmacy, Pune — 8 medicines in stock |

---

## What each role can do

### Patient
- **Symptom checker** — Pick from 100+ symptoms (grouped by body system), set severity 1–5 per symptom, add vitals (HR, BP, SpO₂, blood sugar, temp). Algorithm returns top-4 most probable conditions with confidence %, plus vitals-based safety warnings.
- **Find doctors** — Auto-suggested by recommended specialization from the symptom check, or browse all doctors and book directly.
- **Healthy habits library** — 15+ exercises/diet/sleep/mental health/lifestyle entries with descriptions, benefits, "how to", video links. One-tap logging.
- **Medication tracking** — See all prescriptions written by doctors, log each dose as taken/missed.
- **Vitals logging** — Manual or wearable-source entries; doctor sees the trend.
- **Medicine search** — Cross-pharmacy search by name/generic, with price, stock status, and directions.

### Doctor
- **Appointments** — Pending/confirmed/completed/cancelled. Confirm or mark complete.
- **Patients** — Auto-built from appointment history. View vitals trends, medication adherence, demographics.
- **Prescription writer** — Multi-medicine + multi-exercise prescriptions in one form, with dosage, frequency, duration, and instructions.
- **Prescription history** — Everything written by you.
- **Profile** — Qualification, specialization, license, clinic, fees, availability — what patients see when searching.

### Pharmacy
- **Inventory management** — Add, edit, delete medicines. Each entry: name, generic, manufacturer, category, price, quantity, expiry.
- **Stock status** — Auto-derived (`in_stock` ≥10, `low_stock` <10, `out_of_stock` 0 or unavailable).
- **Shop profile** — Name, license, location (lat/long for map directions), hours, 24-hour flag, delivery flag.

---

## API reference (summary)

Base URL: `/api`. All authenticated endpoints require `Authorization: Bearer <jwt>`.

### Auth
- `POST /auth/register` — `{user_type, email, password, full_name, phone}`
- `POST /auth/login` — `{email, password}` → `{token, user}`
- `GET  /auth/me` — current user + profile
- `PUT  /auth/profile` — update profile (role-aware)

### Symptoms / Prediction
- `GET  /symptoms/symptoms` — all symptoms, grouped by category
- `GET  /symptoms/diseases` — all diseases
- `POST /symptoms/predict` — `{symptom_ids[], severity{}, vitals{}}` → top-4 diseases + warnings
- `GET  /symptoms/history` — patient's prediction history
- `GET  /symptoms/doctors/:specialization` — relevant doctors

### Appointments
- `GET  /appointments/doctors?specialization=&city=&search=`
- `POST /appointments/book` — `{doctor_id, appointment_date, appointment_time, reason}`
- `GET  /appointments/my-appointments` — role-aware
- `PUT  /appointments/:id/status` — confirm/complete/cancel

### Prescriptions
- `POST /prescriptions/` — doctor only — `{patient_id, diagnosis, medicines[], exercises[], notes}`
- `GET  /prescriptions/` — role-aware
- `POST /prescriptions/log-medication` — `{prescription_item_id, status}`
- `GET  /prescriptions/medication-logs/:patientId?`

### Vitals
- `POST /vitals/` — patient — `{heart_rate, bp_systolic, bp_diastolic, oxygen_level, blood_sugar, temperature, sleep_hours, steps, source}`
- `GET  /vitals/:patientId?` — vitals + computed stats

### Habits
- `GET  /habits/?category=`
- `POST /habits/log` — `{habit_id, completed, duration_minutes, notes}`
- `GET  /habits/my-logs`

### Medicines
- `GET  /medicines/search?query=&city=`
- `GET  /medicines/shops?city=`
- `GET  /medicines/my-inventory` — pharmacy only
- `POST /medicines/inventory` — pharmacy adds a medicine
- `PUT  /medicines/inventory/:id`
- `DELETE /medicines/inventory/:id`

---

## Disease-prediction algorithm

It's a **weighted symptom-matching** model, not ML. For each disease in the database:

1. For each user-selected symptom present in the `disease_symptoms` mapping, sum `weight × (severity / 2)`. Mapping weights (set in seed data) are higher for symptoms that are pathognomonic, lower for vague symptoms.
2. `probability = (matched_weight / total_weight_for_disease) × 100`, capped at 95% to avoid over-confidence.
3. Sort descending, return top 4.

Vitals trigger separate threshold-based warnings (HR <60 or >100, BP ≥140/90, SpO₂ <95, blood sugar <70 or >200, temp ≥100.4°F).

> **Not a diagnostic tool.** The UI explicitly says the result isn't a diagnosis and recommends consulting a doctor.

---

## Deploying to Render

1. **Push to GitHub.** The repo root should contain the `backend/` and `frontend/` folders, plus this README.

2. **Create a MySQL database.** Render doesn't offer managed MySQL, so use any MySQL provider (Aiven free tier, PlanetScale, Railway, AWS RDS, your own VPS). Get the connection details.

3. **On Render, create a new Web Service:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** copy from `.env.example`, fill in the MySQL connection from step 2, set a strong `JWT_SECRET`.

4. **Initialize the database** — either run `npm run init-db` from a local machine with the production `DB_HOST` etc. in `.env`, or SSH into the Render service shell once and run it there.

5. Done. Render gives you a public URL — the same process serves API at `/api/*` and the frontend at `/`.

---

## Deploying frontend on Vercel + backend on Render

If you want them separate:

- Deploy `frontend/` to Vercel as a static site (no build needed; root is `frontend/`).
- Deploy `backend/` to Render.
- In `backend/.env`, set `FRONTEND_URL` to your Vercel URL.
- In `frontend/js/api.js`, change `const API_BASE = '/api';` to `const API_BASE = 'https://your-backend.onrender.com/api';`.

---

## Security notes

- Passwords are bcrypt-hashed (cost 10) before storage.
- JWT secret must be a long random string in production. The default in `.env.example` is just a placeholder.
- The API has rate limiting (200 requests / 15 min) and helmet headers.
- For production, also enable HTTPS-only cookies if you switch from `localStorage` token storage, set up DB SSL, and audit CORS origins.

---

## License

MIT. Use it, modify it, ship it.

---

**Built with care in Pune.** This is a clinical decision-support reference implementation, not a substitute for professional medical advice.
