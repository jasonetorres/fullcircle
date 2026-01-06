/*
  # Create Personal Life Ledger logs table

  1. New Tables
    - `logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `created_at` (timestamptz) - When the log was created
      - `event_date` (date) - The actual date of the event (ISO-8601)
      - `title` (text) - Title of the event
      - `description` (text, nullable) - Detailed description
      - `location` (text, nullable) - Where the event took place
      - `trip_name` (text, nullable) - Associated trip name if applicable
      - `is_public` (boolean) - Whether the event is public or private
      - `user_id` (uuid) - Reference to auth.users

  2. Security
    - Enable RLS on `logs` table
    - Add policy for users to read their own logs
    - Add policy for users to insert their own logs
    - Add policy for users to update their own logs
    - Add policy for users to delete their own logs
*/

CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_date date NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  trip_name text,
  is_public boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create index for faster queries on user_id and event_date
CREATE INDEX IF NOT EXISTS logs_user_id_idx ON logs(user_id);
CREATE INDEX IF NOT EXISTS logs_event_date_idx ON logs(event_date DESC);

-- Enable Row Level Security
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own logs
CREATE POLICY "Users can update own logs"
  ON logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own logs
CREATE POLICY "Users can delete own logs"
  ON logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);