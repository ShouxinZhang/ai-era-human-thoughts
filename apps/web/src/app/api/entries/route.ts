import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE
  || (process.env.NODE_ENV === 'development' ? 'local' : 'supabase');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function getLocalDb() {
  const Database = (await import('better-sqlite3')).default;
  const localDir = path.join(process.cwd(), '.local');
  const dbPath = path.join(localDir, 'entries.db');
  fs.mkdirSync(localDir, { recursive: true });
  const db = new Database(dbPath);
  db.exec(`
    create table if not exists entries (
      id integer primary key autoincrement,
      content text not null,
      type text not null,
      created_at text default (datetime('now')),
      status text default 'open',
      author text default '匿名',
      age text,
      occupation text,
      city text
    );
  `);
  const columns = db
    .prepare("select name from pragma_table_info('entries')")
    .all() as { name: string }[];
  const columnNames = columns.map((row) => row.name);
  if (!columnNames.includes('author')) {
    db.exec("alter table entries add column author text default '匿名'");
  }
  if (!columnNames.includes('age')) {
    db.exec("alter table entries add column age text");
  }
  if (!columnNames.includes('occupation')) {
    db.exec("alter table entries add column occupation text");
  }
  if (!columnNames.includes('city')) {
    db.exec("alter table entries add column city text");
  }
  return db;
}

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials missing');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function GET() {
  try {
    if (DATA_SOURCE === 'local') {
      const db = await getLocalDb();
      const rows = db
        .prepare('select id, content, type, created_at, author, age, occupation, city from entries order by id desc')
        .all();
      db.close();
      return NextResponse.json({ data: rows });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = String(body?.content || '').trim();
    const type = body?.type === 'thought' ? 'thought' : 'problem';
    const author = String(body?.author || '').trim() || '匿名';
    const age = String(body?.age || '').trim() || null;
    const occupation = String(body?.occupation || '').trim() || null;
    const city = String(body?.city || '').trim() || null;

    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    if (DATA_SOURCE === 'local') {
      const db = await getLocalDb();
      const stmt = db.prepare(
        'insert into entries (content, type, author, age, occupation, city) values (?, ?, ?, ?, ?, ?)' 
      );
      const info = stmt.run(content, type, author, age, occupation, city);
      const row = db
        .prepare('select id, content, type, created_at, author, age, occupation, city from entries where id = ?')
        .get(info.lastInsertRowid);
      db.close();
      return NextResponse.json({ data: row });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('entries')
      .insert([{ content, type, author, age, occupation, city }])
      .select()
      .single();

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
