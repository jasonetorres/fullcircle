import { useEffect, useState } from 'react';
import { supabase, Profile as ProfileType, Log } from '../lib/supabase';
import { MapPin, Calendar, Settings, User, Sparkles, Download, UserPlus, UserMinus, Award, Flame } from 'lucide-react';
import { YearRecap } from './YearRecap';
import LogDetailModal from './LogDetailModal';
import StatsModal from './StatsModal';
import { linkifyText } from '../lib/linkify';
import { getUserBadges, checkAndAwardBadges, getUserStreak, StreakData } from '../lib/achievementManager';

interface ProfileProps {
  userId: string;
  currentUserId: string;
  onOpenSettings: () => void;
}

interface TravelStats {
  totalPosts: number;
  uniqueLocations: number;
  followers: number;
  following: number;
}

export default function Profile({ userId, currentUserId, onOpenSettings }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<TravelStats>({
    totalPosts: 0,
    uniqueLocations: 0,
    followers: 0,
    following: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'public' | 'private'>('all');
  const [showRecap, setShowRecap] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState<'followers' | 'following' | 'posts' | 'places' | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPostDate: null,
    isActiveToday: false,
  });

  const isOwnProfile = userId === currentUserId;

  const availableYears = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  ).reverse();

  useEffect(() => {
    fetchProfile();
    fetchLogs();
    fetchStats();
    fetchBadges();
    fetchStreak();
    if (!isOwnProfile && currentUserId) {
      checkFollowStatus();
    }
    if (isOwnProfile) {
      checkAndAwardBadges(userId);
    }
  }, [userId, activeFilter]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false });

      if (!isOwnProfile) {
        query = query.eq('is_public', true);
      } else if (activeFilter === 'public') {
        query = query.eq('is_public', true);
      } else if (activeFilter === 'private') {
        query = query.eq('is_public', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);

      fetchStreak();
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [logsResult, locationsResult, followersResult, followingResult] =
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
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', userId),
        ]);

      const uniqueLocations = new Set(
        locationsResult.data?.map((l) => l.location).filter(Boolean)
      ).size;

      setStats({
        totalPosts: logsResult.count || 0,
        uniqueLocations,
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchBadges = async () => {
    try {
      const userBadges = await getUserBadges(userId);
      setBadges(userBadges);
    } catch (err: any) {
      console.error('Error fetching badges:', err);
    }
  };

  const fetchStreak = async () => {
    try {
      const streak = await getUserStreak(userId);
      setStreakData(streak);
    } catch (err: any) {
      console.error('Error fetching streak:', err);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (err: any) {
      console.error('Error checking follow status:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUserId || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });

        if (error) throw error;
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        checkAndAwardBadges(userId);
      }
    } catch (err: any) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportLogs = () => {
    const exportData = logs.map(log => ({
      date: log.event_date,
      title: log.title,
      description: log.description || '',
      location: log.location || '',
      trip: log.trip_name || '',
      visibility: log.is_public ? 'Public' : 'Private',
      image: log.image_url || '',
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullcircle-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-800"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Profile not found</p>
      </div>
    );
  }

  return (
    <>
      {showRecap && (
        <YearRecap
          userId={userId}
          year={selectedYear}
          onClose={() => setShowRecap(false)}
        />
      )}

      {showAvatarModal && profile.avatar_url && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${profile.avatar_url ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
              onClick={() => profile.avatar_url && setShowAvatarModal(true)}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.username?.[0]?.toUpperCase() || <User className="w-8 h-8" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800 truncate">
                  {profile.display_name || profile.username}
                </h1>
                {isOwnProfile ? (
                  <button
                    onClick={onOpenSettings}
                    className="flex-shrink-0 text-slate-600 hover:text-slate-800 transition"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                ) : currentUserId ? (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
              <p className="text-sm text-slate-500 truncate">@{profile.username}</p>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-slate-700 mb-3">{linkifyText(profile.bio)}</p>
          )}

          <div className="mb-3 pb-3 border-b border-slate-200">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    streakData.currentStreak > 0
                      ? 'bg-gradient-to-br from-orange-500 to-red-500'
                      : 'bg-slate-300'
                  }`}>
                    <Flame className={`w-6 h-6 ${streakData.currentStreak > 0 ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 uppercase">Current Streak</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
                {streakData.longestStreak > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-slate-600">Best</div>
                    <div className="text-lg font-bold text-slate-700">
                      {streakData.longestStreak}
                    </div>
                  </div>
                )}
              </div>
              {streakData.currentStreak === 0 ? (
                <p className="text-xs text-slate-600">
                  Start your streak by posting today!
                </p>
              ) : streakData.isActiveToday ? (
                <p className="text-xs text-green-700 font-medium">
                  ✓ Posted today! Keep it going!
                </p>
              ) : (
                <p className="text-xs text-amber-700 font-medium">
                  Post today to continue your streak!
                </p>
              )}
            </div>
          </div>

          {badges.length > 0 && (
            <div className="mb-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-600">ACHIEVEMENTS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.slice(0, 8).map((userBadge: any) => (
                  <div
                    key={userBadge.id}
                    className="group relative flex items-center gap-1.5 px-2 py-1 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-full text-xs hover:shadow-md transition cursor-pointer"
                    title={userBadge.badges?.description}
                  >
                    <span className="text-base">{userBadge.badges?.icon}</span>
                    <span className="font-medium text-slate-700">{userBadge.badges?.name}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded hidden group-hover:block whitespace-nowrap z-10">
                      {userBadge.badges?.description}
                    </div>
                  </div>
                ))}
                {badges.length > 8 && (
                  <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                    +{badges.length - 8} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-3">
            <button
              onClick={() => setShowStatsModal('posts')}
              className="text-center hover:bg-slate-50 rounded-lg py-2 transition"
            >
              <div className="text-lg font-bold text-slate-800">{stats.totalPosts}</div>
              <div className="text-xs text-slate-500">Posts</div>
            </button>
            <button
              onClick={() => setShowStatsModal('places')}
              className="text-center hover:bg-slate-50 rounded-lg py-2 transition"
            >
              <div className="text-lg font-bold text-slate-800">{stats.uniqueLocations}</div>
              <div className="text-xs text-slate-500">Places</div>
            </button>
            <button
              onClick={() => setShowStatsModal('followers')}
              className="text-center hover:bg-slate-50 rounded-lg py-2 transition"
            >
              <div className="text-lg font-bold text-slate-800">{stats.followers}</div>
              <div className="text-xs text-slate-500">Followers</div>
            </button>
            <button
              onClick={() => setShowStatsModal('following')}
              className="text-center hover:bg-slate-50 rounded-lg py-2 transition"
            >
              <div className="text-lg font-bold text-slate-800">{stats.following}</div>
              <div className="text-xs text-slate-500">Following</div>
            </button>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg border-none text-sm font-medium hover:bg-slate-200 transition"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => setShowRecap(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex-1"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Recap</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-2 mb-4 items-center">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-md'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('public')}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              activeFilter === 'public'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-md'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setActiveFilter('private')}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              activeFilter === 'private'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-md'
            }`}
          >
            Private
          </button>
          {logs.length > 0 && (
            <button
              onClick={exportLogs}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 shadow-md rounded-full transition text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group cursor-pointer"
              onClick={() => setSelectedLog(log)}
            >
              {log.image_url ? (
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <img
                    src={log.image_url}
                    alt={log.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      <h3 className="font-semibold text-xs mb-0.5 truncate">{log.title}</h3>
                      {log.location && (
                        <div className="flex items-center gap-1 text-xs truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{log.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs mb-1 line-clamp-2">{log.title}</h3>
                    {log.description && (
                      <p className="text-xs text-slate-600 line-clamp-3">{log.description}</p>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {log.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{log.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(log.event_date)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>

      {selectedLog && profile && (
        <LogDetailModal
          log={selectedLog}
          profile={profile}
          currentUserId={currentUserId}
          onClose={() => setSelectedLog(null)}
          showSocialFeatures={!isOwnProfile && selectedLog.is_public}
        />
      )}

      {showStatsModal && (
        <StatsModal
          userId={userId}
          type={showStatsModal}
          onClose={() => setShowStatsModal(null)}
        />
      )}
    </>
  );
}
