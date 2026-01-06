import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your deployment environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Log = {
  id: string;
  created_at: string;
  event_date: string;
  title: string;
  description: string | null;
  location: string | null;
  trip_name: string | null;
  is_public: boolean;
  user_id: string;
  image_url: string | null;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  log_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  log_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};
