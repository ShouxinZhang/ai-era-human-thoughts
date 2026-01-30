import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const appDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const localDir = path.join(appDir, '.local');
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
  .all()
  .map((row) => row.name);

if (!columns.includes('author')) {
  db.exec("alter table entries add column author text default '匿名'");
}
if (!columns.includes('age')) {
  db.exec("alter table entries add column age text");
}
if (!columns.includes('occupation')) {
  db.exec("alter table entries add column occupation text");
}
if (!columns.includes('city')) {
  db.exec("alter table entries add column city text");
}

const count = db.prepare('select count(*) as count from entries').get().count;

if (count === 0) {
  const insert = db.prepare('insert into entries (content, type) values (?, ?)');
  insert.run('如何在大模型时代重新定义程序员的价值？', 'problem');
  insert.run('AI 可能会让初级程序员的岗位减少，但会极快提升高级架构师的产出。', 'thought');
  db.exec("update entries set author = 'LLM MOCK'");
  console.log('✅ Local database initialized with mock data.');
} else {
  console.log('ℹ️  Local database already has data, skip seeding.');
}

db.exec(`
  update entries
  set author = 'LLM MOCK'
  where content in (
    '如何在大模型时代重新定义程序员的价值？',
    'AI 可能会让初级程序员的岗位减少，但会极快提升高级架构师的产出。',
    '目前的幻觉问题在垂直领域的法律咨询中非常致命。'
  )
  and (author is null or author = '' or author = '匿名');
`);

db.close();
