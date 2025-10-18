import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type WorkLog = {
  id: string;
  user_id: string;
  date: string;
  hours_worked: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  work_log_id: string;
  user_id: string;
  task_name: string;
  description?: string;
  status: 'Started' | 'In Progress' | 'Finished' | 'Pending' | 'On Hold';
  created_at: string;
  updated_at: string;
};
