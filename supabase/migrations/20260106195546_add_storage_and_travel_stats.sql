/*
  # Add Storage Bucket and Travel Stats Support

  1. Changes
    - Create storage bucket for profile avatars
    - Add policies for avatar upload and access
    - Add index on logs.location for faster stats queries
    - Add index on logs.is_public for faster public log queries
  
  2. Security
    - Users can upload their own avatars
    - Avatars are publicly accessible
    - Users can only delete their own avatars
  
  3. Notes
    - Travel stats will be computed from logs table
    - Unique locations visited = distinct location values in user's logs
    - Total posts = count of logs for user
*/

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DO $$
BEGIN
  -- Allow authenticated users to upload their own avatar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own avatar'
  ) THEN
    CREATE POLICY "Users can upload own avatar"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Allow public read access to avatars
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Avatar images are publicly accessible'
  ) THEN
    CREATE POLICY "Avatar images are publicly accessible"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'avatars');
  END IF;

  -- Allow users to update their own avatar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own avatar'
  ) THEN
    CREATE POLICY "Users can update own avatar"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Allow users to delete their own avatar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own avatar'
  ) THEN
    CREATE POLICY "Users can delete own avatar"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Add indexes for better performance on travel stats queries
CREATE INDEX IF NOT EXISTS idx_logs_location ON logs(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_is_public ON logs(is_public);
CREATE INDEX IF NOT EXISTS idx_logs_user_public ON logs(user_id, is_public);
