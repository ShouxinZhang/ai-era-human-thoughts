import path from 'path';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const appDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const dbPath = path.join(appDir, '.local', 'entries.db');
const db = new Database(dbPath, { readonly: true });

const rows = db
  .prepare('select id, content, type, created_at, status, author, age, occupation, city from entries order by id asc')
  .all();

db.close();

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const { error } = await supabase
  .from('entries')
  .upsert(rows, { onConflict: 'id' });

if (error) {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
}

console.log(`✅ Synced ${rows.length} entries to Supabase.`);
