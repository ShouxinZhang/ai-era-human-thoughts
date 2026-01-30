'use client';

import { useState } from 'react';

export default function SubmitEntry() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    type: 'problem' as 'problem' | 'thought',
    author: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || '提交失败');
      }

      setFormData({ content: '', type: 'problem', author: '' });
      setIsOpen(false);
      window.dispatchEvent(new Event('entries:updated'));
    } catch (error) {
      alert('提交失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-[#07C160] hover:bg-[#06ad56] text-white font-medium rounded-lg shadow-sm transition-all"
      >
        + 新增记录
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">New Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Type</label>
            <div className="flex gap-2">
              {(['problem', 'thought'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    formData.type === t 
                      ? 'bg-[#07C160] text-white' 
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Author</label>
            <input
              className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg border-none focus:ring-2 focus:ring-[#07C160] outline-none transition-all placeholder:text-zinc-400"
              placeholder="匿名 / Your name"
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">Content</label>
            <textarea 
              required
              rows={4}
              className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg border-none focus:ring-2 focus:ring-[#07C160] outline-none transition-all placeholder:text-zinc-400"
              placeholder="在这里输入您的想法..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#07C160] hover:bg-[#06ad56] text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? 'SAVING...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
