/*
  # Add Achievements/Badge System

  1. New Tables
    - `badges`
      - `id` (uuid, primary key)
      - `name` (text) - Badge name
      - `description` (text) - What the badge is for
      - `icon` (text) - Icon identifier or emoji
      - `category` (text) - Category like 'streak', 'milestone', 'explorer'
      - `requirement_type` (text) - Type of requirement (posts, days, locations, etc.)
      - `requirement_value` (integer) - Value needed to unlock
      - `created_at` (timestamptz)

    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `badge_id` (uuid, foreign key to badges)
      - `earned_at` (timestamptz)
      - Unique constraint on (user_id, badge_id)

  2. Security
    - Enable RLS on both tables
    - Anyone can view badges
    - Users can view their own earned badges
    - Users can view other users' earned badges

  3. Seed Data
    - Create initial badges for common achievements
*/

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all earned badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can earn badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES
  ('First Steps', 'Create your first post', '🎯', 'milestone', 'posts', 1),
  ('Getting Started', 'Create 5 posts', '📝', 'milestone', 'posts', 5),
  ('Prolific Writer', 'Create 10 posts', '✍️', 'milestone', 'posts', 10),
  ('Memory Keeper', 'Create 25 posts', '📚', 'milestone', 'posts', 25),
  ('Chronicle Master', 'Create 50 posts', '🏆', 'milestone', 'posts', 50),
  ('Legend', 'Create 100 posts', '👑', 'milestone', 'posts', 100),
  
  ('On Fire', 'Post 3 days in a row', '🔥', 'streak', 'daily_streak', 3),
  ('Unstoppable', 'Post 7 days in a row', '⚡', 'streak', 'daily_streak', 7),
  ('Dedicated', 'Post 30 days in a row', '💪', 'streak', 'daily_streak', 30),
  ('Eternal Flame', 'Post 100 days in a row', '🌟', 'streak', 'daily_streak', 100),
  
  ('Explorer', 'Visit 5 different places', '🗺️', 'explorer', 'locations', 5),
  ('Wanderer', 'Visit 10 different places', '🧭', 'explorer', 'locations', 10),
  ('Globetrotter', 'Visit 25 different places', '🌍', 'explorer', 'locations', 25),
  ('World Traveler', 'Visit 50 different places', '✈️', 'explorer', 'locations', 50),
  
  ('Social Butterfly', 'Get 10 followers', '🦋', 'social', 'followers', 10),
  ('Influencer', 'Get 50 followers', '💫', 'social', 'followers', 50),
  ('Celebrity', 'Get 100 followers', '⭐', 'social', 'followers', 100),
  
  ('Engaged', 'Receive 50 total likes', '❤️', 'engagement', 'total_likes', 50),
  ('Popular', 'Receive 100 total likes', '💕', 'engagement', 'total_likes', 100),
  ('Beloved', 'Receive 500 total likes', '💖', 'engagement', 'total_likes', 500)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
