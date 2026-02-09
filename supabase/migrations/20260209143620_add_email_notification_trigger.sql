/*
  # Add email notification trigger via pg_net

  1. Extensions
    - Enable `pg_net` extension for async HTTP calls from database

  2. New Functions
    - `send_notification_email()` trigger function
      - Fires after INSERT on `notifications` table
      - Makes async HTTP POST to the `send-notification-email` edge function
      - Passes the new notification record as JSON payload
      - Uses `net.http_post` for non-blocking execution

  3. New Triggers
    - `on_notification_email` on `notifications` table
      - AFTER INSERT trigger
      - Calls `send_notification_email()` for each new notification

  4. Security
    - Trigger function uses SECURITY DEFINER to access pg_net
    - Edge function handles authorization and preference checks
    - Non-blocking: does not slow down notification creation

  5. Notes
    - The edge function URL uses the Supabase project URL
    - pg_net calls are async and do not block the INSERT operation
    - Email preference checks happen in the edge function, not the trigger
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION send_notification_email()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://ujpjuqeybegruuayzzeb.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'id', NEW.id,
        'recipient_id', NEW.recipient_id,
        'actor_id', NEW.actor_id,
        'type', NEW.type,
        'log_id', NEW.log_id,
        'comment_id', NEW.comment_id,
        'is_read', NEW.is_read,
        'created_at', NEW.created_at
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notification_email ON notifications;

CREATE TRIGGER on_notification_email
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION send_notification_email();
