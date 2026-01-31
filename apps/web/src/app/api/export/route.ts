import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials missing');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Fetch entries - selecting only public fields
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('id, content, type, created_at, status, author, age, occupation, city')
      .order('id', { ascending: true });

    if (entriesError) throw entriesError;

    // Fetch feedback - selecting only non-sensitive fields
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('id, message, created_at')
      .order('id', { ascending: true });

    if (feedbackError) throw feedbackError;

    const exportData = {
      version: '1.0',
      export_date: new Date().toISOString(),
      source: 'AI Era Human Thoughts',
      data: {
        entries: entries || [],
        feedback: feedback || [],
      }
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="human-thoughts-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
