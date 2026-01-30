import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const appDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const localDir = path.join(appDir, '.local');
const dbPath = path.join(localDir, 'entries.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Local database not found. Run dev.sh or local-init first.');
  process.exit(1);
}

const db = new Database(dbPath);

const mockEntries = [
  {
    content: '如何在 AI 时代定义“人类独特贡献”的边界？',
    type: 'problem',
    author: 'LLM MOCK',
  },
  {
    content: '当 AI 普及后，哪些线下服务依然必须由人完成？',
    type: 'thought',
    author: 'LLM MOCK',
  },
  {
    content: '在真实物理世界中，AI 还做不到的关键决策有哪些？',
    type: 'problem',
    author: 'LLM MOCK',
  },
];

const insert = db.prepare('insert into entries (content, type, author) values (?, ?, ?)');
const exists = db.prepare('select 1 from entries where content = ? limit 1');

let inserted = 0;
const nonce = Date.now().toString(36);
for (const entry of mockEntries) {
  let content = entry.content;
  if (exists.get(content)) {
    content = `${content}（追加-${nonce}）`;
  }
  insert.run(content, entry.type, entry.author);
  inserted += 1;
}

console.log(`✅ Added ${inserted} mock entries.`);

db.close();
