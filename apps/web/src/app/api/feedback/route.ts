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
    create table if not exists feedback (
      id integer primary key autoincrement,
      message text not null,
      contact text,
      page_url text,
      user_agent text,
      ip text,
      created_at text default (datetime('now'))
    );
  `);
  return db;
}

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials missing');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message || '').trim();
    const contact = String(body?.contact || '').trim();
    const pageUrlFromBody = String(body?.pageUrl || '').trim();

    if (!message) {
      return new NextResponse('Message is required', { status: 400 });
    }

    if (message.length > 4000) {
      return new NextResponse('Message too long', { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '';
    const pageUrl = pageUrlFromBody || referer;

    if (DATA_SOURCE === 'local') {
      const db = await getLocalDb();
      const stmt = db.prepare(
        'insert into feedback (message, contact, page_url, user_agent, ip) values (?, ?, ?, ?, ?)'
      );
      const info = stmt.run(
        message,
        contact || null,
        pageUrl || null,
        userAgent || null,
        ip || null,
      );
      const row = db
        .prepare('select * from feedback where id = ?')
        .get(info.lastInsertRowid);
      db.close();
      return NextResponse.json({ ok: true, data: row });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          message,
          contact: contact || null,
          page_url: pageUrl || null,
          user_agent: userAgent || null,
          ip: ip || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    return new NextResponse(message, { status: 500 });
  }
}
