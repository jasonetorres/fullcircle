# Complete Migration Guide: Cloud to Local Supabase

## Prerequisites

- Node.js 18 or higher installed
- Your local Supabase instance running at http://localhost:8000
- Access to your cloud Supabase dashboard

---

## STEP 1: Get Your Cloud Service Role Key

You need the service role key from your CLOUD Supabase (the old one).

1. Go to https://app.supabase.com
2. Select your project: **ujpjuqeybegruuayzzeb**
3. Click **Settings** (gear icon) in left sidebar
4. Click **API** under Project Settings
5. Scroll to **Project API keys** section
6. Find **service_role** key (marked "secret")
7. Click the eye icon to reveal it
8. Click **Copy** to copy the entire key

**SAVE THIS KEY** - You'll need it in the next step!

---

## STEP 2: Configure Export Script

Open the file `export-from-cloud.js` and find this line:

```javascript
const CLOUD_SERVICE_KEY = 'YOUR_CLOUD_SERVICE_ROLE_KEY_HERE';
```

Replace `YOUR_CLOUD_SERVICE_ROLE_KEY_HERE` with the service role key you just copied.

**IMPORTANT:** Make sure you paste the ENTIRE key. It should be very long (over 200 characters).

---

## STEP 3: Export Data from Cloud

Run the export script:

```bash
node export-from-cloud.js
```

This will:
- Export all 7 database tables to JSON files
- Download all images from storage buckets
- Create a `supabase-export/` folder with everything

**Expected output:**
```
===========================================================
EXPORTING FROM CLOUD SUPABASE
===========================================================

Exporting profiles...
  Fetched X rows from profiles
✓ Exported X rows to .../supabase-export/profiles.json

...

✓ Downloaded X files from avatars
✓ Downloaded X files from log-images

EXPORT COMPLETE
```

**What if there are errors?**
- "fetch is not defined" → Upgrade to Node.js 18+
- "Invalid API key" → Check you used the SERVICE_ROLE key (not anon key)
- "RLS policy violation" → Make sure you're using service_role key
- "No files found" → That's OK if you don't have images yet

---

## STEP 4: Verify Export

Check that the export worked:

```bash
ls -la supabase-export/
```

You should see:
- `profiles.json`
- `logs.json`
- `follows.json`
- `likes.json`
- `comments.json`
- `comment_likes.json`
- `notifications.json`
- `storage/` folder (with avatars/ and log-images/ subfolders)

**Quick check:** Open one of the JSON files to see your data:
```bash
cat supabase-export/profiles.json
```

---

## STEP 5: Make Sure Local Supabase is Running

Verify your local instance is up:

```bash
curl http://localhost:8000/rest/v1/
```

If you get a response (even an error about missing auth), it's working!

If not working:
```bash
cd /path/to/your/supabase-docker
docker-compose up -d
```

---

## STEP 6: Import Data to Local Supabase

The import script is already configured with the correct local credentials.

Run the import:

```bash
node import-to-local.js
```

This will:
- Import all 7 database tables in the correct order
- Create storage buckets (avatars, log-images)
- Upload all image files
- Handle any conflicts automatically

**Expected output:**
```
===========================================================
IMPORTING TO LOCAL SUPABASE
===========================================================

Importing profiles...
  Imported X/X rows
✓ Imported X rows into profiles

...

✓ Uploaded X files to avatars
✓ Uploaded X files to log-images

✅ All data imported successfully!
```

**What if there are errors?**
- "Export directory not found" → Run Step 3 first
- "Connection refused" → Check local Supabase is running (Step 5)
- "duplicate key value violates unique constraint" → Data already imported (safe to ignore)
- "relation does not exist" → Run migrations first (see below)

---

## STEP 7: Update Your Application

Your `.env` file should already have:

```
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

If not, update it now.

---

## STEP 8: Test Your Application

Start your app:

```bash
npm run dev
```

Open your browser and:
1. Try logging in with your existing account
2. Check if your logs appear
3. Verify images load correctly
4. Test creating a new log

**Everything should work exactly as before!**

---

## Troubleshooting

### "No data appears in my app"

Check if data was imported:
```bash
curl http://localhost:8000/rest/v1/profiles?select=* \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### "Images not loading"

Check storage buckets exist:
- Go to http://localhost:8000 (if Studio is running)
- Or check Docker logs: `docker-compose logs storage`

### "Migrations not applied"

If you get "relation does not exist" errors during import, your database schema isn't set up.

The migrations should already be applied, but if not:
1. Your migrations are in `supabase/migrations/` folder
2. Use Supabase CLI to apply them, or
3. Copy the SQL from each file and run it in your database

---

## What Got Migrated?

✅ **All user accounts** (from auth.users)
✅ **All profiles** (usernames, bios, avatars)
✅ **All travel logs** (with locations, dates, descriptions)
✅ **All social interactions** (follows, likes, comments)
✅ **All notifications**
✅ **All images** (avatars and log photos)
✅ **Database schema** (tables, policies, indexes)

---

## Backup Your Old Data

Keep the `supabase-export/` folder safe! This is your backup.

Consider creating a zip file:

```bash
zip -r backup-$(date +%Y%m%d).zip supabase-export/ supabase/migrations/
```

---

## Summary of Files Created

- `export-from-cloud.js` - Exports from cloud Supabase
- `import-to-local.js` - Imports to local Supabase
- `supabase-export/` - Your exported data (created after Step 3)
- `MIGRATION-INSTRUCTIONS.md` - This file

---

## Support

If you run into issues:

1. Check the error message carefully
2. Verify local Supabase is running: `docker-compose ps`
3. Check Docker logs: `docker-compose logs`
4. Try re-running the import: `node import-to-local.js` (it's safe to run multiple times)

---

**You're done! Your data is now running on your local Supabase instance.**
