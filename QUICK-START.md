# Quick Start - Migration in 3 Steps

## What You Need

**From Cloud Supabase Dashboard:**
- Service Role Key (get it from https://app.supabase.com → your project → Settings → API)

## The 3 Steps

### 1️⃣ Get Cloud Service Key & Configure Export

1. Go to https://app.supabase.com
2. Select project: **ujpjuqeybegruuayzzeb**
3. Settings → API → Copy "service_role" key
4. Open `export-from-cloud.js`
5. Replace `YOUR_CLOUD_SERVICE_ROLE_KEY_HERE` with your key

### 2️⃣ Export from Cloud

```bash
node export-from-cloud.js
```

Wait for it to complete. You'll see a folder `supabase-export/` with all your data.

### 3️⃣ Import to Local

```bash
node import-to-local.js
```

Done! Your data is now in your local Supabase.

---

## Files Created

- `export-from-cloud.js` - Gets data FROM cloud Supabase
- `import-to-local.js` - Puts data INTO local Supabase (already configured!)
- `supabase-export/` - Your data backup (created after step 2)
- `MIGRATION-INSTRUCTIONS.md` - Detailed guide with troubleshooting

---

## Your Local Credentials (Already Updated)

Your `.env` file now has:
```
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Default Local Supabase Keys

These are the standard keys for local Supabase (already configured in scripts):

**Anon Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

**Service Role Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
```

These are public demo keys - safe to use for local development.

---

## Need Help?

See `MIGRATION-INSTRUCTIONS.md` for:
- Detailed explanations
- Troubleshooting common issues
- What to do if something goes wrong
