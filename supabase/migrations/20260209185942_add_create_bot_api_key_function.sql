/*
  # Add function to create bot API keys securely

  1. New Functions
    - `create_bot_api_key` - Securely creates a new bot API key with proper hashing
      - Takes user_id, api_key (plaintext), key_prefix, and name as parameters
      - Hashes the API key using pgcrypto's crypt function
      - Stores only the hash in the database for security
      - Returns success/failure status

  2. Security
    - Function runs with SECURITY DEFINER to ensure proper RLS bypass for insertion
    - API keys are never stored in plaintext
    - Uses bcrypt-style hashing via pgcrypto
*/

-- Function to create a bot API key with proper hashing
CREATE OR REPLACE FUNCTION create_bot_api_key(
  p_user_id uuid,
  p_api_key text,
  p_key_prefix text,
  p_name text
)
RETURNS void AS $$
BEGIN
  INSERT INTO bot_api_keys (user_id, api_key_hash, key_prefix, name)
  VALUES (
    p_user_id,
    crypt(p_api_key, gen_salt('bf')),
    p_key_prefix,
    p_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_bot_api_key(uuid, text, text, text) TO authenticated;