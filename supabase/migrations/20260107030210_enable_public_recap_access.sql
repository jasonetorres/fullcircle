/*
  # Enable Public Access for Year Recaps

  1. New Policies
    - Allow anonymous users to view public logs
    - Allow anonymous users to view all profiles
    - Allow anonymous users to view likes on public logs
    - Allow anonymous users to view comments on public logs

  2. New Function
    - `get_public_year_recap_stats(user_id, year)` - Public version of year recap that only includes public logs
    - Does not require authentication
    - Only aggregates data from logs where is_public = true

  3. Security
    - Only public logs are accessible to unauthenticated users
    - Private logs remain protected
    - User profiles are publicly viewable (common for social apps)
*/

-- Policy: Anonymous users can view public logs
CREATE POLICY "Anonymous users can view public logs"
  ON logs
  FOR SELECT
  TO anon
  USING (is_public = true);

-- Policy: Anonymous users can view all profiles
CREATE POLICY "Anonymous users can view profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Anonymous users can view likes on public logs
CREATE POLICY "Anonymous users can view likes on public logs"
  ON likes
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = likes.log_id
      AND logs.is_public = true
    )
  );

-- Policy: Anonymous users can view comments on public logs
CREATE POLICY "Anonymous users can view comments on public logs"
  ON comments
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM logs
      WHERE logs.id = comments.log_id
      AND logs.is_public = true
    )
  );

-- Create public year recap function
CREATE OR REPLACE FUNCTION get_public_year_recap_stats(target_user_id uuid, target_year integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- This function is public and only includes data from public logs
  WITH year_logs AS (
    SELECT *
    FROM logs
    WHERE user_id = target_user_id
      AND EXTRACT(YEAR FROM event_date) = target_year
      AND is_public = true
  ),
  stats AS (
    SELECT
      COUNT(*) as total_logs,
      COUNT(DISTINCT location) FILTER (WHERE location IS NOT NULL) as unique_locations,
      COUNT(*) FILTER (WHERE image_url IS NOT NULL) as total_photos,
      COUNT(DISTINCT trip_name) FILTER (WHERE trip_name IS NOT NULL) as unique_trips,
      MIN(event_date) as first_log_date,
      MAX(event_date) as last_log_date,
      MODE() WITHIN GROUP (ORDER BY EXTRACT(MONTH FROM event_date)) as busiest_month
    FROM year_logs
  ),
  likes_count AS (
    SELECT COUNT(*) as total_likes
    FROM likes l
    INNER JOIN year_logs yl ON l.log_id = yl.id
  ),
  comments_count AS (
    SELECT COUNT(*) as total_comments
    FROM comments c
    INNER JOIN year_logs yl ON c.log_id = yl.id
  ),
  top_location AS (
    SELECT location, COUNT(*) as visit_count
    FROM year_logs
    WHERE location IS NOT NULL
    GROUP BY location
    ORDER BY visit_count DESC
    LIMIT 1
  ),
  month_breakdown AS (
    SELECT
      json_object_agg(
        month,
        log_count
      ) as months
    FROM (
      SELECT
        EXTRACT(MONTH FROM event_date)::integer as month,
        COUNT(*) as log_count
      FROM year_logs
      GROUP BY EXTRACT(MONTH FROM event_date)
      ORDER BY month
    ) monthly
  )
  SELECT json_build_object(
    'total_logs', COALESCE(s.total_logs, 0),
    'unique_locations', COALESCE(s.unique_locations, 0),
    'total_photos', COALESCE(s.total_photos, 0),
    'unique_trips', COALESCE(s.unique_trips, 0),
    'first_log_date', s.first_log_date,
    'last_log_date', s.last_log_date,
    'busiest_month', COALESCE(s.busiest_month, 1),
    'total_likes', COALESCE(lc.total_likes, 0),
    'total_comments', COALESCE(cc.total_comments, 0),
    'top_location', COALESCE(tl.location, 'Unknown'),
    'top_location_count', COALESCE(tl.visit_count, 0),
    'month_breakdown', COALESCE(mb.months, '{}'::json)
  )
  INTO result
  FROM stats s
  CROSS JOIN likes_count lc
  CROSS JOIN comments_count cc
  LEFT JOIN top_location tl ON true
  LEFT JOIN month_breakdown mb ON true;

  RETURN result;
END;
$$;