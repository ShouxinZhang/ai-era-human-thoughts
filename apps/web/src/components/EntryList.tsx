'use client';

import { useEffect, useState } from 'react';

interface Entry {
  id: number;
  content: string;
  type: 'problem' | 'thought';
  created_at: string;
  author?: string;
  age?: string | null;
  occupation?: string | null;
  city?: string | null;
}

export default function EntryList({ filter }: { filter?: 'problem' | 'thought' }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

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
          {displayedEntries.map((item) => {
            const detailItems = [
              item.age ? `年龄: ${item.age}` : null,
              item.occupation ? `职业: ${item.occupation}` : null,
              item.city ? `城市: ${item.city}` : null,
            ].filter(Boolean) as string[];

            return (
              <div 
                key={item.id} 
                className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-none"
              >
                <div className="flex items-start justify-between gap-6 mb-4">
                  <div>
                    <div className="text-xs font-mono text-zinc-400">id {item.id}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-500 dark:text-zinc-400">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                        {item.type}
                      </span>
                      <span>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span>
                        {item.author || '匿名'}
                      </span>
                    </div>
                    {detailItems.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-zinc-500 dark:text-zinc-400">
                        {detailItems.map((detail) => (
                          <span key={detail}>{detail}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-stretch">
                  <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 py-2">
                    {item.content.length > 80 ? `${item.content.substring(0, 80)}...` : item.content}
                  </div>
                  <button 
                    className="px-6 py-2 bg-[#07C160] hover:bg-[#06ad56] text-white text-sm font-medium transition-colors rounded-lg shadow-sm border-none self-center"
                    onClick={() => setSelectedContent(item.content)}
                  >
                    查看
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WeChat Style Detail Modal */}
      {selectedContent && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] flex items-center justify-center p-6"
          onClick={() => setSelectedContent(null)}
        >
          <div 
            className="w-full max-w-lg animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative group">
              {/* Bubble Background */}
              <div className="bg-[#95ec6a] rounded-lg p-5 shadow-xl relative min-h-[100px] flex items-center justify-center">
                <p className="text-zinc-900 text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedContent}
                </p>
                {/* Bubble Triangle (right side style like screenshot) */}
                <div className="absolute right-[-8px] top-6 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#95ec6a]"></div>
              </div>
              
              {/* Close Hint */}
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="px-8 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-md transition-all border border-white/20"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
