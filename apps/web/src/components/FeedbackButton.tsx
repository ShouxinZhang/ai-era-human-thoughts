'use client';

import { useState } from 'react';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) {
      setStatus('error');
      setErrorText('请填写反馈内容');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorText('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, contact: contact.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '发送失败');
      }

      setStatus('success');
      setMessage('');
      setContact('');
      setIsOpen(false);
      alert('反馈已发送，感谢你的建议！');
    } catch (err) {
      setStatus('error');
      setErrorText((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#07C160] hover:bg-[#06ad56] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
      >
        反馈
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">发送反馈</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          点击“发送”会由服务器直接把反馈发送到维护者邮箱。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">反馈内容</label>
            <textarea
              rows={5}
              className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg border-none focus:ring-2 focus:ring-[#07C160] outline-none transition-all placeholder:text-zinc-400"
              placeholder="写下你的建议 / 问题 / 想法..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">联系方式（可选）</label>
            <input
              className="w-full p-3 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg border-none focus:ring-2 focus:ring-[#07C160] outline-none transition-all placeholder:text-zinc-400"
              placeholder="微信 / 邮箱 / 其他"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="px-6 py-2 bg-[#07C160] hover:bg-[#06ad56] text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>

          {status === 'error' && errorText && (
            <div className="text-sm text-red-500">发送失败：{errorText}</div>
          )}
        </div>
      </div>
    </div>
  );
}
