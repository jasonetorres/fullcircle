/*
  # Add Follow Notifications

  1. Changes
    - Update notifications type to include 'follow'
    - Make log_id nullable since follow notifications don't reference a log
    - Add trigger to create notification when someone follows you
    
  2. New Functionality
    - Users receive notifications when someone follows them
    - Follow notifications appear in the notification bell
*/

-- Update the type constraint to include 'follow'
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('like', 'comment', 'reply', 'follow'));

-- Make log_id nullable since follow notifications don't need it
ALTER TABLE notifications 
ALTER COLUMN log_id DROP NOT NULL;

-- Create function to notify on follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the user being followed
  INSERT INTO notifications (recipient_id, actor_id, type)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for follows
DROP TRIGGER IF EXISTS on_follow_created ON follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();
