/*
  # Add Year Recap Statistics Function

  1. New Functions
    - `get_year_recap_stats(user_id, year)` - Aggregates all statistics for a user's year recap
      Returns:
        - total_logs: Total number of logs created in the year
        - unique_locations: Number of unique locations visited
        - total_photos: Number of logs with images
        - busiest_month: Month with most activity (1-12)
        - total_likes: Total likes received on logs
        - total_comments: Total comments received on logs
        - unique_trips: Number of unique trip names
        - first_log_date: Date of first log in the year
        - last_log_date: Date of last log in the year

  2. Notes
    - Function is secured to only return data for the requesting user
    - Efficient aggregation using CTEs and window functions
    - Returns JSON for easy consumption by frontend
*/

CREATE OR REPLACE FUNCTION get_year_recap_stats(target_user_id uuid, target_year integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Ensure user can only get their own stats
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  WITH year_logs AS (
    SELECT *
    FROM logs
    WHERE user_id = target_user_id
      AND EXTRACT(YEAR FROM event_date) = target_year
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