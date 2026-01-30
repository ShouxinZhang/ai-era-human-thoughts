-- Initial Schema for AI Era Human Thoughts
-- Simplified for "Problem" and "Thought" entries

-- Enable UUID extension for unique identifiers
create extension if not exists "uuid-ossp";

-- Define the entry types
create type entry_type as enum ('problem', 'thought');

-- Main table for storing entries
create table entries (
  id serial primary key, -- Using serial for simple "id 1, 2, 3" display
  content text not null,
  type entry_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Simple status tracking
  status text default 'open',

  -- Signature
  author text default '匿名',

  -- Demographics (free input)
  age text,
  occupation text,
  city text,
  
  -- Metadata
  author_id uuid references auth.users(id)
);

-- Enable Row Level Security (RLS)
alter table entries enable row level security;

-- Policy: Everyone can view entries
create policy "Entries are viewable by everyone" 
  on entries for select 
  using ( true );

-- Policy: Anyone can insert entries (simplified for collection phase)
create policy "Anyone can insert entries" 
  on entries for insert 
  with check ( true );

-- Mock Data
insert into entries (content, type, author) values 
('如何在大模型时代重新定义程序员的价值？', 'problem', 'LLM MOCK'),
('AI 可能会让初级程序员的岗位减少，但会极快提升高级架构师的产出。', 'thought', 'LLM MOCK'),
('目前的幻觉问题在垂直领域的法律咨询中非常致命。', 'problem', 'LLM MOCK'),
('提示词工程可能只是一个过渡阶段，未来的交互应该是更直接的意图对齐。', 'thought', 'LLM MOCK');
