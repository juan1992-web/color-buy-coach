import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'aflphoxlvvuztbhjipxw';
if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JjicDByPSFOpDuuCSCdwsg_bRN4t27m';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
