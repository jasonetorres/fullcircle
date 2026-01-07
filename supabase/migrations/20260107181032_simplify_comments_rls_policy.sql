/*
  # Simplify Comments RLS Policy

  ## Problem
  Comments are not showing up correctly in the UI even though they exist in the database

  ## Changes
  - Drop all existing SELECT policies on comments
  - Create one simple, clear policy for authenticated users
  - Authenticated users can see ALL comments on public logs
  - Authenticated users can see ALL comments on their own logs (even if private)
  - Anonymous users can see comments on public logs

  ## Logic
  For authenticated users: Show comment if (log is public) OR (user owns the log)
  For anonymous users: Show comment if log is public
*/

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can view comments on public logs and own comments" ON comments;
DROP POLICY IF EXISTS "Anonymous users can view comments on public logs" ON comments;
DROP POLICY IF EXISTS "Comments are viewable on public logs" ON comments;

-- Create new policy for authenticated users
CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = log_id
      AND (
        logs.is_public = true
        OR logs.user_id = auth.uid()
      )
    )
  );

-- Create new policy for anonymous users
CREATE POLICY "Anonymous users can view public comments"
  ON comments FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = log_id
      AND logs.is_public = true
    )
  );
