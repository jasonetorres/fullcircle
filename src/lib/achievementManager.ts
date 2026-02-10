import { supabase } from './supabase';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserStats {
  totalPosts: number;
  uniqueLocations: number;
  followers: number;
  totalLikes: number;
  currentStreak: number;
  longestStreak: number;
}

export async function checkAndAwardBadges(userId: string): Promise<void> {
  try {
    const stats = await getUserStats(userId);
    const allBadges = await getAllBadges();
    const earnedBadgeIds = await getEarnedBadgeIds(userId);

    const newBadges: string[] = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      let shouldAward = false;

      switch (badge.requirement_type) {
        case 'posts':
          shouldAward = stats.totalPosts >= badge.requirement_value;
          break;
        case 'locations':
          shouldAward = stats.uniqueLocations >= badge.requirement_value;
          break;
        case 'followers':
          shouldAward = stats.followers >= badge.requirement_value;
          break;
        case 'total_likes':
          shouldAward = stats.totalLikes >= badge.requirement_value;
          break;
        case 'daily_streak':
          shouldAward = stats.currentStreak >= badge.requirement_value ||
                       stats.longestStreak >= badge.requirement_value;
          break;
      }

      if (shouldAward) {
        newBadges.push(badge.id);
      }
    }

    if (newBadges.length > 0) {
      await awardBadges(userId, newBadges);
    }
  } catch (err) {
    console.error('Error checking and awarding badges:', err);
  }
}

async function getUserStats(userId: string): Promise<UserStats> {
  const [logsResult, locationsResult, followersResult, likesResult, streakData] =
    await Promise.all([
      supabase.from('logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase
        .from('logs')
        .select('location')
        .eq('user_id', userId)
        .not('location', 'is', null),
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('log_id', 'in',
          `(SELECT id FROM logs WHERE user_id = '${userId}')`
        ),
      supabase
        .from('logs')
        .select('event_date')
        .eq('user_id', userId)
        .order('event_date', { ascending: false }),
    ]);

  const uniqueLocations = new Set(
    locationsResult.data?.map((l) => l.location).filter(Boolean)
  ).size;

  const streaks = calculateStreaks(streakData.data?.map(d => d.event_date) || []);

  return {
    totalPosts: logsResult.count || 0,
    uniqueLocations,
    followers: followersResult.count || 0,
    totalLikes: likesResult.count || 0,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
  };
}

function calculateStreaks(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = [...new Set(dates)].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) {
    currentStreak = 0;
  }

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const date1 = new Date(uniqueDates[i]);
    const date2 = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (i === 0 && daysDiff <= 1) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  if (daysDiff <= 1) {
    currentStreak = Math.max(currentStreak, tempStreak);
  }

  return { current: currentStreak, longest: longestStreak };
}

async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase.from('badges').select('*');

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

async function getEarnedBadgeIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching earned badges:', error);
    return new Set();
  }

  return new Set(data.map(ub => ub.badge_id));
}

async function awardBadges(userId: string, badgeIds: string[]): Promise<void> {
  const badges = badgeIds.map(badgeId => ({
    user_id: userId,
    badge_id: badgeId,
  }));

  const { error } = await supabase.from('user_badges').insert(badges);

  if (error) {
    console.error('Error awarding badges:', error);
  }
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      id,
      earned_at,
      badges (
        id,
        name,
        description,
        icon,
        category
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return data || [];
}
