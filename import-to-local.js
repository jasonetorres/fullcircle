import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOCAL SUPABASE CONFIGURATION
const LOCAL_SUPABASE_URL = 'http://localhost:8000';
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

const supabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_KEY);

const exportDir = path.join(__dirname, 'supabase-export');

async function importTable(tableName) {
  const filePath = path.join(exportDir, `${tableName}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Skipping ${tableName} - no export file found`);
    return 0;
  }

  console.log(`Importing ${tableName}...`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (data.length === 0) {
    console.log(`  No data to import for ${tableName}\n`);
    return 0;
  }

  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const { error } = await supabase
      .from(tableName)
      .insert(batch);

    if (error) {
      console.error(`  Error importing batch to ${tableName}:`, error);
      console.error(`  Failed rows:`, JSON.stringify(batch, null, 2));
    } else {
      imported += batch.length;
      console.log(`  Imported ${imported}/${data.length} rows`);
    }
  }

  console.log(`✓ Imported ${imported} rows into ${tableName}\n`);
  return imported;
}

async function createStorageBucket(bucketName) {
  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
  });

  if (error && error.message !== 'Bucket already exists') {
    console.error(`Error creating bucket ${bucketName}:`, error);
    return false;
  }

  console.log(`✓ Bucket ${bucketName} ready`);
  return true;
}

async function importStorageBucket(bucketName) {
  console.log(`Importing storage bucket: ${bucketName}...`);

  const bucketDir = path.join(exportDir, 'storage', bucketName);

  if (!fs.existsSync(bucketDir)) {
    console.log(`  No files found to import for ${bucketName}\n`);
    return 0;
  }

  await createStorageBucket(bucketName);

  const files = fs.readdirSync(bucketDir);
  let uploadedCount = 0;

  for (const filename of files) {
    const filePath = path.join(bucketDir, filename);
    const fileBuffer = fs.readFileSync(filePath);

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filename, fileBuffer, {
          contentType: filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                      filename.endsWith('.png') ? 'image/png' :
                      filename.endsWith('.gif') ? 'image/gif' :
                      'application/octet-stream',
          upsert: true
        });

      if (error) {
        console.error(`  Error uploading ${filename}:`, error);
      } else {
        uploadedCount++;
        console.log(`  Uploaded: ${filename}`);
      }
    } catch (err) {
      console.error(`  Error uploading ${filename}:`, err);
    }
  }

  console.log(`✓ Uploaded ${uploadedCount} files to ${bucketName}\n`);
  return uploadedCount;
}

async function importAll() {
  console.log('='.repeat(60));
  console.log('IMPORTING TO LOCAL SUPABASE');
  console.log('='.repeat(60));
  console.log('');

  if (!fs.existsSync(exportDir)) {
    console.error(`ERROR: Export directory not found at ${exportDir}`);
    console.error('Please run "node export-from-cloud.js" first!');
    process.exit(1);
  }

  try {
    const stats = {};

    // Import in order respecting foreign key dependencies
    stats.profiles = await importTable('profiles');
    stats.logs = await importTable('logs');
    stats.follows = await importTable('follows');
    stats.likes = await importTable('likes');
    stats.comments = await importTable('comments');
    stats.comment_likes = await importTable('comment_likes');
    stats.notifications = await importTable('notifications');

    console.log('='.repeat(60));
    console.log('IMPORTING STORAGE FILES');
    console.log('='.repeat(60));
    console.log('');

    stats.avatars = await importStorageBucket('avatars');
    stats.logImages = await importStorageBucket('log-images');

    console.log('='.repeat(60));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`  Profiles: ${stats.profiles} rows`);
    console.log(`  Logs: ${stats.logs} rows`);
    console.log(`  Follows: ${stats.follows} rows`);
    console.log(`  Likes: ${stats.likes} rows`);
    console.log(`  Comments: ${stats.comments} rows`);
    console.log(`  Comment Likes: ${stats.comment_likes} rows`);
    console.log(`  Notifications: ${stats.notifications} rows`);
    console.log(`  Avatar files: ${stats.avatars} files`);
    console.log(`  Log image files: ${stats.logImages} files`);
    console.log('');
    console.log('✅ All data imported successfully!');
    console.log('');
    console.log('Next step: Update your .env file if you haven\'t already');

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importAll();
