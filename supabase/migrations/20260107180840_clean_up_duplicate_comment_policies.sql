/*
  # Clean Up Duplicate Comment Policies

  ## Problem
  There are multiple duplicate SELECT policies on the comments table causing confusion

  ## Changes
  - Drop the duplicate "Users can view comments on public logs and own comments" policy
  - Keep the "Users can view comments" policy which has the correct logic
  - Add an anon policy for public viewing
*/

-- Drop the duplicate policy
DROP POLICY IF EXISTS "Users can view comments on public logs and own comments" ON comments;

-- Ensure we have the correct policy for authenticated users
DROP POLICY IF EXISTS "Users can view comments" ON comments;

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

-- Ensure anonymous users can view comments on public logs
DROP POLICY IF EXISTS "Anonymous users can view comments on public logs" ON comments;

CREATE POLICY "Anonymous users can view comments on public logs"
  ON comments FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = comments.log_id
      AND logs.is_public = true
    )
  );
