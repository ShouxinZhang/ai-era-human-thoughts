'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

export default function DesignPurpose() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#07C160] transition-colors mb-6"
      >
        <Info size={14} />
        <span>设计目的</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">设计目的</h2>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
              <p>
                本网站的设计目的，主要是收集最原初的问题和想法，作为一个开源的问题集和创意集。
              </p>
              <p>
                有鉴于AI时代获取答案变得越来越容易，所以暂时还没有考虑增加评论功能。数学上，好的问题能引人深思。也是希望AI时代也可以有这样一种问题集，不包含任何答案，而是专注于提出好的问题。
              </p>
            </div>
            <div className="flex justify-end pt-6">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-[#07C160] hover:bg-[#06ad56] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
