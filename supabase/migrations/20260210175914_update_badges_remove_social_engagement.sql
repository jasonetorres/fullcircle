/*
  # Update Badge System - Remove Social and Engagement Badges

  1. Changes
    - Remove social badges (followers-based)
    - Remove engagement badges (likes-based)
    - Keep milestone, streak, and explorer badges
    - Add more streak badges to emphasize daily posting

  2. New Streak Badges
    - Added 365-day streak badge for posting every day for a year
*/

DELETE FROM badges WHERE category IN ('social', 'engagement');

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES
  ('Year Warrior', 'Post 365 days in a row', '🏅', 'streak', 'daily_streak', 365)
ON CONFLICT DO NOTHING;
