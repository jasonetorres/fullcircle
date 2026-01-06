import { supabase, Log } from './supabase';

export type YearRecapStats = {
  total_logs: number;
  unique_locations: number;
  total_photos: number;
  unique_trips: number;
  first_log_date: string | null;
  last_log_date: string | null;
  busiest_month: number;
  total_likes: number;
  total_comments: number;
  top_location: string;
  top_location_count: number;
  month_breakdown: Record<string, number>;
};

export type YearRecapData = {
  stats: YearRecapStats;
  topPosts: Log[];
  allLocations: string[];
  allTrips: string[];
  photoHighlights: Log[];
};

export async function getYearRecapStats(userId: string, year: number): Promise<YearRecapStats | null> {
  const { data, error } = await supabase.rpc('get_year_recap_stats', {
    target_user_id: userId,
    target_year: year
  });

  if (error) {
    console.error('Error fetching year recap stats:', error);
    return null;
  }

  return data as YearRecapStats;
}

export async function getTopPosts(userId: string, year: number, limit: number = 5): Promise<Log[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('logs')
    .select(`
      *,
      likes:likes(count)
    `)
    .eq('user_id', userId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('likes(count)', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top posts:', error);
    return [];
  }

  return data as Log[];
}

export async function getAllLocations(userId: string, year: number): Promise<string[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('logs')
    .select('location')
    .eq('user_id', userId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .not('location', 'is', null);

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  const locations = [...new Set(data.map(d => d.location).filter(Boolean))];
  return locations as string[];
}

export async function getAllTrips(userId: string, year: number): Promise<string[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('logs')
    .select('trip_name')
    .eq('user_id', userId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .not('trip_name', 'is', null);

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  const trips = [...new Set(data.map(d => d.trip_name).filter(Boolean))];
  return trips as string[];
}

export async function getPhotoHighlights(userId: string, year: number, limit: number = 9): Promise<Log[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching photo highlights:', error);
    return [];
  }

  return data as Log[];
}

export async function getFullYearRecap(userId: string, year: number): Promise<YearRecapData | null> {
  const [stats, topPosts, allLocations, allTrips, photoHighlights] = await Promise.all([
    getYearRecapStats(userId, year),
    getTopPosts(userId, year),
    getAllLocations(userId, year),
    getAllTrips(userId, year),
    getPhotoHighlights(userId, year)
  ]);

  if (!stats) {
    return null;
  }

  return {
    stats,
    topPosts,
    allLocations,
    allTrips,
    photoHighlights
  };
}
