/*
  # Add email notification preferences to profiles

  1. Changes
    - Add `email_notifications` boolean column to `profiles` table
      - Defaults to `true` so existing users receive email notifications
      - Users can opt out via account settings

  2. Notes
    - Non-destructive change: adds a new column with a default value
    - No existing data is modified
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_notifications'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_notifications boolean NOT NULL DEFAULT true;
  END IF;
END $$;
