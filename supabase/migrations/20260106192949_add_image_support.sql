/*
  # Add image support to logs

  1. Changes
    - Add `image_url` column to `logs` table to store uploaded images
    - Column is optional (nullable) to support logs without images
  
  2. Notes
    - Images will be stored in Supabase Storage
    - The image_url will contain the public URL to the stored image
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logs' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE logs ADD COLUMN image_url text;
  END IF;
END $$;