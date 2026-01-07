/*
  # Fix Comments Visibility Policy

  ## Problem
  Users cannot see their own comments on other people's posts, even though comments are being created successfully. The current SELECT policy only allows viewing comments on public logs.

  ## Changes
  1. Drop the existing restrictive SELECT policy
  2. Create a new policy that allows users to see:
     - Comments on public logs (everyone)
     - Comments on their own logs (even if private)
     - Their own comments on any log

  ## Security
  This maintains proper security while allowing users to see their own activity.
*/

DROP POLICY IF EXISTS "Comments are viewable on public logs" ON comments;

CREATE POLICY "Users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = comments.log_id
      AND (
        logs.is_public = true
        OR logs.user_id = auth.uid()
      )
    )
    OR comments.user_id = auth.uid()
  );
