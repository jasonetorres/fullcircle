/*
  # Create Bot API Keys System

  1. New Tables
    - `bot_api_keys`
      - `id` (uuid, primary key) - Unique identifier for the API key
      - `user_id` (uuid, foreign key to auth.users) - Owner of the API key
      - `api_key_hash` (text) - Hashed API key for secure storage
      - `key_prefix` (text) - First 8 characters of the key for display purposes
      - `name` (text) - User-friendly name for the key
      - `created_at` (timestamptz) - When the key was created
      - `last_used_at` (timestamptz, nullable) - Last time the key was used
      - `is_active` (boolean) - Whether the key is currently active
      - `usage_count` (integer) - Number of times the key has been used

  2. Security
    - Enable RLS on `bot_api_keys` table
    - Add policies for users to manage their own API keys
    - Create function to validate API keys securely

  3. Important Notes
    - API keys are hashed using pgcrypto extension
    - Only the key prefix is stored in plaintext for user reference
    - Keys are validated server-side only for security
*/

-- Enable pgcrypto extension for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create bot_api_keys table
CREATE TABLE IF NOT EXISTS bot_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_hash text NOT NULL,
  key_prefix text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE bot_api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own API keys
CREATE POLICY "Users can view own API keys"
  ON bot_api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys"
  ON bot_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update own API keys"
  ON bot_api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys"
  ON bot_api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to validate API key and return user_id
CREATE OR REPLACE FUNCTION validate_bot_api_key(api_key_input text)
RETURNS TABLE (
  user_id uuid,
  key_id uuid,
  is_valid boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bak.user_id,
    bak.id as key_id,
    true as is_valid
  FROM bot_api_keys bak
  WHERE bak.api_key_hash = crypt(api_key_input, bak.api_key_hash)
    AND bak.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS bot_api_keys_user_id_idx ON bot_api_keys(user_id);
CREATE INDEX IF NOT EXISTS bot_api_keys_key_prefix_idx ON bot_api_keys(key_prefix);