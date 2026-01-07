/*
  # Fix Feed Function Date Type Mismatch
  
  1. Problem
    - The get_feed_with_stats function returns event_date as DATE type
    - But the function signature declares it as TEXT
    - This causes a type mismatch error
  
  2. Solution
    - Update the function to properly cast event_date to TEXT format
    - This matches the existing application expectations (YYYY-MM-DD format)
*/

CREATE OR REPLACE FUNCTION get_feed_with_stats(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  event_date TEXT,
  is_public BOOLEAN,
  trip_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  profile_id UUID,
  profile_username TEXT,
  profile_display_name TEXT,
  profile_bio TEXT,
  profile_avatar_url TEXT,
  likes_count BIGINT,
  comments_count BIGINT,
  user_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.user_id,
    l.title,
    l.description,
    l.location,
    l.event_date::TEXT,
    l.is_public,
    l.trip_name,
    l.image_url,
    l.created_at,
    p.id AS profile_id,
    p.username AS profile_username,
    p.display_name AS profile_display_name,
    p.bio AS profile_bio,
    p.avatar_url AS profile_avatar_url,
    COALESCE(COUNT(DISTINCT likes.id), 0) AS likes_count,
    COALESCE(COUNT(DISTINCT comments.id), 0) AS comments_count,
    EXISTS(
      SELECT 1 FROM likes user_likes 
      WHERE user_likes.log_id = l.id 
      AND user_likes.user_id = p_user_id
    ) AS user_liked
  FROM logs l
  INNER JOIN profiles p ON l.user_id = p.id
  LEFT JOIN likes ON likes.log_id = l.id
  LEFT JOIN comments ON comments.log_id = l.id
  WHERE l.is_public = true
  GROUP BY l.id, l.user_id, l.title, l.description, l.location, l.event_date, 
           l.is_public, l.trip_name, l.image_url, l.created_at,
           p.id, p.username, p.display_name, p.bio, p.avatar_url
  ORDER BY l.event_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;