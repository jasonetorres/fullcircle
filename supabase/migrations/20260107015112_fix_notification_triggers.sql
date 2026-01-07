/*
  # Fix Notification Triggers

  1. Changes
    - Fix notify_on_comment function to use correct column name `parent_comment_id` instead of `parent_id`
    - This will fix reply notifications not being created
*/

-- Update the notify_on_comment function to use the correct column name
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
  IF NEW.parent_comment_id IS NOT NULL AND NEW.user_id != (SELECT user_id FROM comments WHERE id = NEW.parent_comment_id) THEN
    INSERT INTO notifications (recipient_id, actor_id, type, log_id, comment_id)
    VALUES (
      (SELECT user_id FROM comments WHERE id = NEW.parent_comment_id),
      NEW.user_id,
      'reply',
      NEW.log_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;