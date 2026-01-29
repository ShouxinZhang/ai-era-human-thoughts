'use client';

import { useEffect, useState } from 'react';

interface Entry {
  id: number;
  content: string;
  type: 'problem' | 'thought';
  created_at: string;
  author?: string;
}

export default function EntryList({ filter }: { filter?: 'problem' | 'thought' }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();

    const handleRefresh = () => fetchEntries();
    window.addEventListener('entries:updated', handleRefresh);

    return () => {
      window.removeEventListener('entries:updated', handleRefresh);
    };
  }, []);

  async function fetchEntries() {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetch('/api/entries', { cache: 'no-store' });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to load entries');
      }

      const payload = await response.json();
      setEntries(payload.data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setErrorMessage('无法读取数据，请检查本地数据库或 Supabase 配置。');
    } finally {
      setLoading(false);
    }
  }

  const displayedEntries = filter 
    ? entries.filter(e => e.type === filter)
    : entries;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="text-center py-12 border border-dashed border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-500 text-sm">{errorMessage}</p>
        </div>
      ) : displayedEntries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-zinc-500 text-sm">暂无内容，快来分享您的第一条思考吧。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {displayedEntries.map((item) => (
            <div 
              key={item.id} 
              className="p-5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
            >

              <div className="flex items-start justify-between gap-6 mb-4">
                <div>
                  <div className="text-xs font-mono text-zinc-500">id {item.id}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span>
                      Type: <span className="font-semibold">{item.type}</span>
                    </span>
                    <span>
                      Created: <span className="font-semibold">{new Date(item.created_at).toLocaleString()}</span>
                    </span>
                    <span>
                      Author: <span className="font-semibold">{item.author || '匿名'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-stretch">
                <div className="border p-4 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 min-h-[72px] text-sm leading-relaxed rounded-md">
                  {item.content.length > 80 ? `${item.content.substring(0, 80)}...` : item.content}
                </div>
                <button 
                  className="px-6 py-3 border border-zinc-800 dark:border-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-semibold transition-colors rounded-md"
                  onClick={() => alert(item.content)}
                >
                  查看
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
