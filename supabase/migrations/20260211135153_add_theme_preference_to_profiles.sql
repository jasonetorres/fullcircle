/*
  # Add Theme Preference to Profiles

  1. Changes
    - Add `theme_preference` column to `profiles` table
      - Type: text with constraint for valid values ('light', 'dark', 'system')
      - Default: 'light'
      - Allows users to set and persist their preferred theme across devices

  2. Notes
    - Uses CHECK constraint to ensure only valid theme values
    - Default value is 'light' for backward compatibility
    - Existing users will default to light theme
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system'));
  END IF;
END $$;