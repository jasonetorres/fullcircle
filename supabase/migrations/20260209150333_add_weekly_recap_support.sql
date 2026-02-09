/*
  # Add weekly recap email support

  1. Changes to `profiles` table
    - `weekly_recap_enabled` (boolean, default true) - Whether user receives weekly recap emails
    - `unsubscribe_token` (uuid, unique) - Token for one-click email unsubscribe

  2. New function
    - `get_user_weekly_stats(target_user_id uuid)` - Returns weekly activity stats
      including logs count, photos count, likes received, and top location

  3. Extensions
    - Enables `pg_cron` for scheduling recurring jobs

  4. Scheduled job
    - `send-weekly-recap` cron job runs every Sunday at 2:00 PM UTC (9:00 AM EST)
    - Calls the send-weekly-recap edge function via pg_net HTTP POST
*/

-- Add weekly recap columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'weekly_recap_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN weekly_recap_enabled boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'unsubscribe_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unsubscribe_token uuid DEFAULT gen_random_uuid() UNIQUE;
  END IF;
END $$;

-- Backfill unsubscribe tokens for existing profiles
UPDATE profiles SET unsubscribe_token = gen_random_uuid() WHERE unsubscribe_token IS NULL;

-- Create function to get weekly stats for a user
CREATE OR REPLACE FUNCTION get_user_weekly_stats(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  week_start timestamptz := now() - interval '7 days';
  v_logs_count integer;
  v_photos_count integer;
  v_likes_count integer;
  v_top_location text;
BEGIN
  SELECT count(*) INTO v_logs_count
  FROM logs
  WHERE user_id = target_user_id
    AND created_at >= week_start;

  SELECT count(*) INTO v_photos_count
  FROM logs
  WHERE user_id = target_user_id
    AND created_at >= week_start
    AND image_url IS NOT NULL;

  SELECT count(*) INTO v_likes_count
  FROM likes l
  JOIN logs lg ON l.log_id = lg.id
  WHERE lg.user_id = target_user_id
    AND l.created_at >= week_start;

  SELECT location INTO v_top_location
  FROM logs
  WHERE user_id = target_user_id
    AND created_at >= week_start
    AND location IS NOT NULL
    AND location != ''
  GROUP BY location
  ORDER BY count(*) DESC
  LIMIT 1;

  result := jsonb_build_object(
    'logs_count', v_logs_count,
    'photos_count', v_photos_count,
    'likes_count', v_likes_count,
    'top_location', v_top_location
  );

  RETURN result;
END;
$$;

-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Remove existing schedule if present, then create new one
DO $$
BEGIN
  PERFORM cron.unschedule('send-weekly-recap');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule weekly recap email every Sunday at 2:00 PM UTC
SELECT cron.schedule(
  'send-weekly-recap',
  '0 14 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://ujpjuqeybegruuayzzeb.supabase.co/functions/v1/send-weekly-recap',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
