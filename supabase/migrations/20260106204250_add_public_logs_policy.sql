/*
  # Add policy for viewing public logs
  
  1. Changes
    - Add new SELECT policy to allow authenticated users to view public logs from other users
  
  2. Security
    - Only logs with is_public = true are viewable by other users
    - Users still have full access to their own logs (public and private) via existing policy
*/

-- Policy: Authenticated users can view public logs from other users
CREATE POLICY "Users can view public logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (is_public = true);
