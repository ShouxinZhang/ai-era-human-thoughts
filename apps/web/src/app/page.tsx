'use client';

import { useState } from "react";
import SubmitEntry from "@/components/SubmitEntry";
import EntryList from "@/components/EntryList";
import FeedbackButton from "@/components/FeedbackButton";

export default function Home() {
  const [filter, setFilter] = useState<'problem' | 'thought' | undefined>(undefined);

  return (
    <div className="min-h-screen font-sans text-zinc-900 dark:text-zinc-100">
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              AI Era Human Thoughts
            </h1>
            <SubmitEntry />
          </div>
          
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mb-6 leading-relaxed">
            人工智能快速发展的时代，AI能帮人类做的事情越来越多。这时，人工智能还不能做到的事情，人们基于真实物理世界的思考和想法，以及，人们在日常生活中遇到的实际问题，就显得格外重要。
          </p>

          <div className="flex gap-2 items-center bg-white dark:bg-zinc-900 p-1 rounded-lg shadow-sm w-fit">
            <button 
              onClick={() => setFilter(undefined)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${!filter ? 'bg-[#07C160] text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('problem')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'problem' ? 'bg-[#07C160] text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              Problem
            </button>
            <button 
              onClick={() => setFilter('thought')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'thought' ? 'bg-[#07C160] text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            >
              Thoughts
            </button>
          </div>
        </header>

        {/* List Section */}
        <section>
          <EntryList filter={filter} />
        </section>

        {/* Simple Footer */}
        <footer className="mt-24 pt-8 text-[12px] text-zinc-400 text-center tracking-wide">
          <div className="flex justify-center mb-4">
            <FeedbackButton />
          </div>
          Repository: ai-era-human-thoughts // 2026
        </footer>
      </main>
    </div>
  );
}


