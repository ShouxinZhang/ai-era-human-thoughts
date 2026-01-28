'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SubmitChallenge() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'public_impact',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('challenges')
      .insert([formData]);

    setLoading(false);
    if (error) {
      alert('提交失败: ' + error.message);
    } else {
      alert('提交成功！感谢您的贡献。');
      setFormData({ title: '', description: '', category: 'public_impact' });
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-8 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-blue-400 rounded-lg font-medium transition-all"
      >
        提交您的思考
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">提交新题 (New Challenge)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input 
              required
              className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="简述面临的困难..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <select 
              className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="public_impact">公众领域 (Public Context)</option>
              <option value="dev_technical">技术领域 (Dev technical)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">详细描述</label>
            <textarea 
              required
              rows={4}
              className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="详细描述这个挑战或看法..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '正在提交...' : '确认提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
