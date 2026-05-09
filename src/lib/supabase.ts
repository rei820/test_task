import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || url === 'your-project-url') {
  console.warn('[Supabase] VITE_SUPABASE_URL が未設定です。.env を確認してください。');
}

export const supabase = createClient(url, key);

export type DbMember = {
  id: string;
  name: string;
  color: string;
  is_admin: boolean;
  pin: string | null;
  created_at: string;
};

export type DbTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  tags: string[];
  due_date: string | null;
  archived: boolean;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
};
