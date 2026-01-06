/*
  # Add Comment Interactions (Likes and Replies)

  1. New Tables
    - `comment_likes`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, foreign key to comments)
      - `user_id` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (comment_id, user_id)
  
  2. Changes
    - Add `parent_comment_id` to comments table for threaded replies
    - Add `mentions` jsonb array to comments table for @ mentions
  
  3. Security
    - Enable RLS on comment_likes table
    - Add policies for authenticated users to like comments
    - Add policies for users to view likes
    - Update comment policies to handle replies
*/

-- Add parent_comment_id and mentions to comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'mentions'
  ) THEN
    ALTER TABLE comments ADD COLUMN mentions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_likes
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
