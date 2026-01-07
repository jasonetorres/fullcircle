/*
  # Fix Duplicate Notifications

  ## Changes
  - Update notify_on_like to prevent duplicate notifications
  - Update notify_on_comment to prevent duplicate notifications
  - Only create notification if one doesn't already exist for the same action

  ## Logic
  - For likes: Don't create a new notification if the same user has already liked the same log recently (within 1 minute)
  - For comments: Always create a new notification since each comment is unique
  - For replies: Always create a new notification since each reply is unique
*/

-- Update notify_on_like to prevent duplicates
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  existing_notification_id uuid;
BEGIN
  -- Get the post author
  SELECT user_id INTO post_author_id FROM logs WHERE id = NEW.log_id;
  
  -- Only create notification if the liker is not the post author
  IF NEW.user_id != post_author_id THEN
    -- Check if a notification already exists from this actor for this log in the last minute
    SELECT id INTO existing_notification_id
    FROM notifications
    WHERE recipient_id = post_author_id
      AND actor_id = NEW.user_id
      AND type = 'like'
      AND log_id = NEW.log_id
      AND created_at > NOW() - INTERVAL '1 minute';
    
    -- Only insert if no recent notification exists
    IF existing_notification_id IS NULL THEN
      INSERT INTO notifications (recipient_id, actor_id, type, log_id)
      VALUES (post_author_id, NEW.user_id, 'like', NEW.log_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- notify_on_comment remains the same since each comment should create a notification
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  parent_comment_author_id uuid;
BEGIN
  -- Get the post author
  SELECT user_id INTO post_author_id FROM logs WHERE id = NEW.log_id;
  
  -- Notify post author if commenter is different
  IF NEW.user_id != post_author_id THEN
    INSERT INTO notifications (recipient_id, actor_id, type, log_id, comment_id)
    VALUES (post_author_id, NEW.user_id, 'comment', NEW.log_id, NEW.id);
  END IF;

  -- If it's a reply, notify the parent comment author
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_author_id FROM comments WHERE id = NEW.parent_comment_id;
    
    IF NEW.user_id != parent_comment_author_id THEN
      INSERT INTO notifications (recipient_id, actor_id, type, log_id, comment_id)
      VALUES (parent_comment_author_id, NEW.user_id, 'reply', NEW.log_id, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
