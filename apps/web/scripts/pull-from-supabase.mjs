import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const appDir = path.join(path.dirname(__filename), '..');
const dbPath = path.join(appDir, '.local', 'entries.db');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function pullTable(tableName) {
  console.log(`fetching ${tableName} from supabase...`);
  const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: true });
  
  if (error) throw error;
  return data;
}

try {
  const onlineEntries = await pullTable('entries');
  const onlineFeedback = await pullTable('feedback');

  const db = new Database(dbPath);
  
  // Update entries
  const insertEntry = db.prepare(`
    INSERT OR REPLACE INTO entries (id, content, type, created_at, status, author, age, occupation, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((data, stmt) => {
    for (const row of data) {
      stmt.run(row.id, row.content, row.type, row.created_at, row.status, row.author, row.age, row.occupation, row.city);
    }
  });

  transaction(onlineEntries, insertEntry);
  console.log(`✅ Pulled ${onlineEntries.length} entries to local.`);

  // Update feedback
  if (onlineFeedback.length > 0) {
    const insertFeedback = db.prepare(`
      INSERT OR REPLACE INTO feedback (id, message, contact, page_url, user_agent, ip, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const fbTransaction = db.transaction((data, stmt) => {
      for (const row of data) {
        stmt.run(row.id, row.message, row.contact, row.page_url, row.user_agent, row.ip, row.created_at);
      }
    });
    fbTransaction(onlineFeedback, insertFeedback);
    console.log(`✅ Pulled ${onlineFeedback.length} feedback items to local.`);
  }

  db.close();
} catch (err) {
  console.error('❌ Pull failed:', err.message);
}
