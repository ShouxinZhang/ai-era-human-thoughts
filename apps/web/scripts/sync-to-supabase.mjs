import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;
const isAdmin = Boolean(supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const appDir = path.join(path.dirname(__filename), '..');
const dbPath = path.join(appDir, '.local', 'entries.db');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ Local DB not found: ${dbPath}`);
  console.error('Run scripts/local-init.mjs first to create it.');
  process.exit(1);
}

// Open local DB readonly
const db = new Database(dbPath, { readonly: true });

function tableExists(tableName) {
  const row = db
    .prepare("select name from sqlite_master where type='table' and name=?")
    .get(tableName);
  return Boolean(row);
}

if (!tableExists('entries')) {
  console.error('❌ Local DB missing table: entries. Run scripts/local-init.mjs first.');
  db.close();
  process.exit(1);
}

const entryRows = db
  .prepare(
    'select id, content, type, created_at, status, author, age, occupation, city from entries order by id asc'
  )
  .all();

const feedbackRows = tableExists('feedback')
  ? db
      .prepare(
        'select id, message, contact, page_url, user_agent, ip, created_at from feedback order by id asc'
      )
      .all()
  : [];

db.close();

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTable({ tableName, rows }) {
  if (!rows.length) {
    console.log(`ℹ️  No rows to sync for ${tableName}.`);
    return { synced: 0 };
  }

  // If we don't have admin key, avoid UPDATE behavior.
  // Using upsert with ignoreDuplicates translates to INSERT ... ON CONFLICT DO NOTHING.
  const upsertOptions = isAdmin
    ? { onConflict: 'id' }
    : { onConflict: 'id', ignoreDuplicates: true };

  const { error } = await supabase.from(tableName).upsert(rows, upsertOptions);

  if (error) {
    throw new Error(`${tableName} sync failed: ${error.message}`);
  }

  return { synced: rows.length };
}

try {
  console.log(`🔑 Using key type: ${isAdmin ? 'service_role' : 'anon'}`);

  const entriesResult = await syncTable({ tableName: 'entries', rows: entryRows });
  const feedbackResult = await syncTable({ tableName: 'feedback', rows: feedbackRows });

  console.log(`✅ Synced entries: ${entriesResult.synced}`);
  console.log(`✅ Synced feedback: ${feedbackResult.synced}`);
} catch (err) {
  console.error('❌ Sync failed:', err.message);
  process.exit(1);
}
