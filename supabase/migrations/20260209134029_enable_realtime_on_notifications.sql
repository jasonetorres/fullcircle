/*
  # Enable Realtime on Notifications Table

  1. Changes
    - Add `notifications` table to the `supabase_realtime` publication
    - This enables the existing real-time subscription in the app to receive live updates
    - Without this, new notifications only appear on page refresh

  2. Important Notes
    - The triggers (on_like_created, on_comment_created, on_follow_created) already create notification rows correctly
    - The frontend already has a real-time subscription set up, it just needs the table published
*/

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
