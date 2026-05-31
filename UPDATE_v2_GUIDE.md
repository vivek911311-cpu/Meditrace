# MediTrace Phase 2 — Update Guide for Vivek

## 🎉 What's NEW in this update

### ✅ Bug fixes
- **Book appointment** now works properly with error handling
- **Habit log** button now correctly logs to backend with visual feedback
- **Prescriptions** issued by doctors now properly show up for patients
- Frontend file path errors fixed

### ✅ New features
1. **🌙 Dark / Light mode toggle** — in sidebar, bottom area
2. **🌐 Language switcher** — English / हिंदी / मराठी (sidebar)
3. **📷 Profile photo upload** — for all 3 user types (in Profile tab)
4. **📩 Medicine Request system** — patients can request medicine from pharmacy
5. **34+ MORE diseases** — chickenpox, measles, jaundice, GERD, piles, sciatica, glaucoma, PCOS, and many more
6. **37+ MORE symptoms** mapped to predictions

### ✅ What you need to do
Three things, in order:

1. **Run migration_v2.sql on your Aiven database** (adds new table + columns + diseases)
2. **Replace files locally** (use the updated files from this package)
3. **Push to GitHub** (`git add . && git commit && git push`) — Render auto-deploys

---

## 📋 Step-by-step deployment

### STEP 1 — Update database (5 min)

Open **DBeaver** and connect to your Aiven database (same as before).

1. Right-click your connection → **SQL Editor** → **New SQL script**
2. Open the file `backend/database/migration_v2.sql` in Notepad
3. **Ctrl+A → Ctrl+C** to copy all
4. Paste into DBeaver SQL editor (**Ctrl+V**)

**⚠️ IMPORTANT:** Look at the top of the script. You'll see TWO ALTER TABLE lines:
```sql
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'light';
ALTER TABLE users ADD COLUMN lang_preference VARCHAR(5) DEFAULT 'en';
```

5. **Press Alt+X to run the script.**

If you see any error about "Duplicate column name" or "Unknown column" — that's fine, just means those columns already exist. The rest will run.

6. **Verify** by running:
   ```sql
   SELECT COUNT(*) FROM diseases;
   SELECT COUNT(*) FROM medicine_requests;
   ```
   You should see disease count > 90 and medicine_requests = 0 (empty table, ready for use).

✅ Database updated.

---

### STEP 2 — Replace local files

You have two options:

#### Option A — Unzip the new package over your existing folder (recommended)

1. Download `meditrace-v2.zip` (linked at the end of this conversation)
2. Open File Explorer → go to `C:\Users\vivek\Desktop\meditrace\`
3. Right-click `meditrace-v2.zip` → **Extract All** → choose the same `meditrace` folder → **OK**
4. When asked "Replace files?" → click **Yes** / **Replace all**

#### Option B — Replace files individually (if Option A doesn't work)

The following files have changed. Copy them from the new package over the old ones:

**Frontend:**
- `frontend/css/style.css`
- `frontend/js/api.js`
- `frontend/js/patient.js`
- `frontend/js/doctor.js`
- `frontend/js/medical.js`
- `frontend/pages/patient.html`
- `frontend/pages/doctor.html`
- `frontend/pages/medical.html`

**Backend:**
- `backend/server.js`
- `backend/routes/auth.js`
- `backend/routes/medicine_requests.js` (NEW file — make sure this exists)
- `backend/database/migration_v2.sql` (NEW file)

---

### STEP 3 — Push to GitHub & Render

1. Open File Explorer → go to `C:\Users\vivek\Desktop\meditrace\`
2. Click the address bar at the top
3. Type **`cmd`** and press Enter
4. In Command Prompt, run these 3 commands one by one:

```
git add .
```

```
git commit -m "Phase 2: dark mode, photo upload, medicine requests, more diseases"
```

```
git push
```

If browser pops up → authorize GitHub.

5. Open https://dashboard.render.com → click your service
6. Watch **Events** tab — within 30 sec you'll see "Deploy in progress"
7. Wait 3-4 minutes for "🟢 Live"

---

### STEP 4 — Test on your live site

1. Open https://meditrace-vivek.onrender.com
2. **Hard refresh: Ctrl + Shift + R** (very important — clears cache)
3. Login as `patient@demo.com` / `password123`

### Test checklist:

- [ ] **Dark mode** — bottom of sidebar, click "🌙 Dark mode" → page goes dark
- [ ] **Language switcher** — bottom of sidebar, click "हि" → sidebar text turns Hindi
- [ ] **Book appointment** — Appointments tab → "+ Book new appointment" → pick a doctor → submit
- [ ] **Log habit** — Healthy Habits tab → click "✓ Log" on any habit → see green toast
- [ ] **Profile photo** — Profile tab → "📷 Upload new photo" → pick image → photo shows in sidebar
- [ ] **Medicine request** — Find Medicine → search "paracetamol" → click "📩 Request" → submit → see in "My Requests" tab
- [ ] **More diseases** — Symptom Checker → search "itchy" or "yellow" → new symptoms appear

Login as `medical@demo.com` / `password123`:
- [ ] **Incoming Requests** tab — see the request you just made
- [ ] **Accept / Reject** — change status, add note → patient sees update

Login as `doctor@demo.com` / `password123`:
- [ ] **Write prescription** — pick patient → add medicines → submit → logout
- [ ] Login back as patient → **Medications** tab → see the prescription

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| Migration script fails | Run each section separately. Skip ALTER TABLE if "Duplicate column" — that's OK. |
| Render deploy fails | Check Logs tab for the error. Most common: forgot to commit `medicine_requests.js` — add it and re-push. |
| Photo upload "Image too large" | Use a smaller image (under 2MB) |
| Dark mode doesn't persist | Clear browser cache (Ctrl+Shift+R) |
| New diseases not showing | Re-run migration_v2.sql — disease inserts probably skipped |
| 500 errors on medicine requests | The `medicine_requests` table wasn't created. Re-run the CREATE TABLE part of migration |

---

## 🔮 Coming in Phase 3 (when you ask)

- **Interactive map view** (Leaflet.js — free, no API key) showing pharmacies + doctors near you
- More Hindi/Marathi translations (currently sidebar + common buttons only)
- Email notifications (requires SendGrid setup)

---

## ✅ Quick test command (after deploy)

Open browser console (F12 → Console) on your live site and paste:
```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
```

You should see:
```
{success: true, message: "MediTrace API is running", version: "1.0.0"}
```

If yes → backend is live and working. 🚀

---

**Made with care for Vivek Gupta — vivek911311@gmail.com**

Questions? Just ask Claude. 🙌
