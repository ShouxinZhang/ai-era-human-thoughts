'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Code, Clock, Tag } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'public_impact' | 'dev_technical';
  created_at: string;
}

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'challenges' },
        (payload) => {
          setChallenges((prev) => [payload.new as Challenge, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchChallenges() {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
        最近更新的“习题”
      </h3>
      
      {challenges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
          <p className="text-gray-500">目前还没有习题，点击上方按钮提交第一个思考吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {challenges.map((item) => (
            <div 
              key={item.id} 
              className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  item.category === 'public_impact' 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                    : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                }`}>
                  {item.category === 'public_impact' ? <MessageSquare size={10}/> : <Code size={10}/>}
                  {item.category === 'public_impact' ? '公众/社会' : '开发者/技术'}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-lg font-bold mb-2">{item.title}</h4>
              <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
