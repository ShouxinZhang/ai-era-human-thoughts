'use client';

import { useState } from "react";
import SubmitEntry from "@/components/SubmitEntry";
import EntryList from "@/components/EntryList";

export default function Home() {
  const [filter, setFilter] = useState<'problem' | 'thought' | undefined>(undefined);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 border-b-4 border-zinc-900 dark:border-zinc-100 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
              AI Era Human Thoughts
            </h1>
            <div className="flex gap-4 items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Filter By:</span>
              <button 
                onClick={() => setFilter(undefined)}
                className={`text-sm font-bold uppercase transition-all ${!filter ? 'underline decoration-4 underline-offset-4' : 'opacity-40 hover:opacity-100'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('problem')}
                className={`text-sm font-bold uppercase transition-all ${filter === 'problem' ? 'underline decoration-4 underline-offset-4' : 'opacity-40 hover:opacity-100'}`}
              >
                Problem
              </button>
              <button 
                onClick={() => setFilter('thought')}
                className={`text-sm font-bold uppercase transition-all ${filter === 'thought' ? 'underline decoration-4 underline-offset-4' : 'opacity-40 hover:opacity-100'}`}
              >
                Thoughts
              </button>
            </div>
          </div>
          <SubmitEntry />
        </header>

        {/* List Section */}
        <section>
          <EntryList filter={filter} />
        </section>

        {/* Simple Footer */}
        <footer className="mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 text-center uppercase tracking-widest">
          Repository: ai-era-human-thoughts // 2026
        </footer>
      </main>
    </div>
  );
}


