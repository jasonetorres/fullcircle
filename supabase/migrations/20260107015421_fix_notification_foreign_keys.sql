/*
  # Fix Notification Foreign Keys

  1. Changes
    - Update notifications table to reference profiles instead of auth.users
    - This allows proper joins with the profiles table for display names and usernames
    - Drop and recreate foreign key constraints

  2. Notes
    - This ensures notification queries can properly join with profiles data
    - Maintains referential integrity through profiles table
*/

-- Drop existing foreign key constraints for actor_id and recipient_id
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

-- Add new foreign key constraints that reference profiles
ALTER TABLE notifications 
  ADD CONSTRAINT notifications_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications 
  ADD CONSTRAINT notifications_recipient_id_fkey 
  FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;