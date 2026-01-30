import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OLD CLOUD SUPABASE CONFIGURATION
const CLOUD_SUPABASE_URL = 'https://ujpjuqeybegruuayzzeb.supabase.co';
const CLOUD_SERVICE_KEY = 'YOUR_CLOUD_SERVICE_ROLE_KEY_HERE'; // Get from cloud dashboard

const supabase = createClient(CLOUD_SUPABASE_URL, CLOUD_SERVICE_KEY);

const exportDir = path.join(__dirname, 'supabase-export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

async function exportTable(tableName, orderBy = 'created_at') {
  console.log(`Exporting ${tableName}...`);

  const allData = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error(`Error exporting ${tableName}:`, error);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      from += batchSize;
      console.log(`  Fetched ${allData.length} rows from ${tableName}`);
    }

    if (!data || data.length < batchSize) {
      hasMore = false;
    }
  }

  const filePath = path.join(exportDir, `${tableName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
  console.log(`✓ Exported ${allData.length} rows to ${filePath}\n`);

  return allData.length;
}

async function exportStorageBucket(bucketName) {
  console.log(`Exporting storage bucket: ${bucketName}...`);

  const bucketDir = path.join(exportDir, 'storage', bucketName);
  if (!fs.existsSync(bucketDir)) {
    fs.mkdirSync(bucketDir, { recursive: true });
  }

  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 1000,
      offset: 0,
    });

  if (error) {
    console.error(`Error listing files in ${bucketName}:`, error);
    return 0;
  }

  if (!files || files.length === 0) {
    console.log(`  No files found in ${bucketName}\n`);
    return 0;
  }

  let downloadedCount = 0;

  for (const file of files) {
    if (file.name === '.emptyFolderPlaceholder') continue;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(file.name);

      if (error) {
        console.error(`  Error downloading ${file.name}:`, error);
        continue;
      }

      const filePath = path.join(bucketDir, file.name);
      const buffer = Buffer.from(await data.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      downloadedCount++;
      console.log(`  Downloaded: ${file.name}`);
    } catch (err) {
      console.error(`  Error saving ${file.name}:`, err);
    }
  }

  console.log(`✓ Downloaded ${downloadedCount} files from ${bucketName}\n`);
  return downloadedCount;
}

async function exportAll() {
  console.log('='.repeat(60));
  console.log('EXPORTING FROM CLOUD SUPABASE');
  console.log('='.repeat(60));
  console.log('');

  try {
    const stats = {};

    stats.profiles = await exportTable('profiles');
    stats.logs = await exportTable('logs');
    stats.follows = await exportTable('follows');
    stats.likes = await exportTable('likes');
    stats.comments = await exportTable('comments');
    stats.comment_likes = await exportTable('comment_likes');
    stats.notifications = await exportTable('notifications');

    console.log('='.repeat(60));
    console.log('EXPORTING STORAGE FILES');
    console.log('='.repeat(60));
    console.log('');

    stats.avatars = await exportStorageBucket('avatars');
    stats.logImages = await exportStorageBucket('log-images');

    console.log('='.repeat(60));
    console.log('EXPORT COMPLETE');
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
    console.log(`All data exported to: ${exportDir}`);
    console.log('');
    console.log('Next step: Run "node import-to-local.js" to import into local database');

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

exportAll();
