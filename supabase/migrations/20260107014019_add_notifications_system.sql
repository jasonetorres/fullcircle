/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `recipient_id` (uuid, references auth.users) - who receives the notification
      - `actor_id` (uuid, references auth.users) - who performed the action
      - `type` (text) - type of notification: 'like', 'comment', 'reply'
      - `log_id` (uuid, references logs) - the post being interacted with
      - `comment_id` (uuid, references comments) - if notification is about a comment
      - `is_read` (boolean) - whether notification has been read
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Users can read their own notifications
    - System can create notifications via triggers

  3. Triggers
    - Auto-create notification when someone likes a post
    - Auto-create notification when someone comments on a post
    - Auto-create notification when someone replies to a comment
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'reply')),
  log_id uuid REFERENCES logs(id) ON DELETE CASCADE NOT NULL,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Create function to notify on like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the liker is not the post author
  IF NEW.user_id != (SELECT user_id FROM logs WHERE id = NEW.log_id) THEN
    INSERT INTO notifications (recipient_id, actor_id, type, log_id)
    VALUES (
      (SELECT user_id FROM logs WHERE id = NEW.log_id),
      NEW.user_id,
      'like',
      NEW.log_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to notify on comment
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify post author if commenter is different
  IF NEW.user_id != (SELECT user_id FROM logs WHERE id = NEW.log_id) THEN
    INSERT INTO notifications (recipient_id, actor_id, type, log_id, comment_id)
    VALUES (
      (SELECT user_id FROM logs WHERE id = NEW.log_id),
      NEW.user_id,
      'comment',
      NEW.log_id,
      NEW.id
    );
  END IF;

  -- If it's a reply, notify the parent comment author
  IF NEW.parent_id IS NOT NULL AND NEW.user_id != (SELECT user_id FROM comments WHERE id = NEW.parent_id) THEN
    INSERT INTO notifications (recipient_id, actor_id, type, log_id, comment_id)
    VALUES (
      (SELECT user_id FROM comments WHERE id = NEW.parent_id),
      NEW.user_id,
      'reply',
      NEW.log_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_like_created ON likes;
CREATE TRIGGER on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

DROP TRIGGER IF EXISTS on_comment_created ON comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;