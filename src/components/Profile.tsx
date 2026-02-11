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
  const [showAchievements, setShowAchievements] = useState(false);

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
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

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
        <p className="text-slate-600 dark:text-dark-text-secondary">Profile not found</p>
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

      {showAchievements && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowAchievements(false)}
        >
          <div
            className="bg-black border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl md:text-2xl font-display font-light text-white tracking-wide">Achievements</h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 rounded-full transition-all duration-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-10 md:space-y-12">
              {streakData.currentStreak > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Flame className="w-7 h-7 sm:w-9 sm:h-9 text-white" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.5))' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider mb-1 sm:mb-2">Current Streak</div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-white mb-2 sm:mb-3">
                        {streakData.currentStreak}<span className="text-lg sm:text-xl md:text-2xl text-white/60 ml-1 sm:ml-2">{streakData.currentStreak === 1 ? 'day' : 'days'}</span>
                      </div>
                      {streakData.longestStreak > 0 && (
                        <div className="text-xs sm:text-sm text-white/50">
                          Best: <span className="font-medium text-white/70">{streakData.longestStreak} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {streakData.isActiveToday ? (
                    <p className="text-xs sm:text-sm text-white/60">
                      Posted today. Keep the momentum going.
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-white/60">
                      Post today to continue your streak.
                    </p>
                  )}
                </div>
              )}
              {badges.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider">Badges Earned</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {badges.map((userBadge: any) => (
                      <div
                        key={userBadge.id}
                        className="flex items-start gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg sm:rounded-xl transition-all duration-300"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl flex-shrink-0 bg-white/5 rounded-lg sm:rounded-xl border border-white/10">
                          {userBadge.badges?.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                          <div className="text-base sm:text-lg font-display font-light text-white mb-1 sm:mb-2">{userBadge.badges?.name}</div>
                          <div className="text-xs sm:text-sm text-white/60 leading-relaxed mb-2 sm:mb-3">{userBadge.badges?.description}</div>
                          <div className="text-[10px] sm:text-xs text-white/30">
                            {new Date(userBadge.earned_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <Award className="w-12 h-12 sm:w-16 sm:h-16 text-white/10 mx-auto mb-4 sm:mb-6" />
                  <p className="text-white/40 mb-2">No badges earned yet</p>
                  <p className="text-xs sm:text-sm text-white/30">Keep posting to unlock achievements</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-dark-panel rounded-xl sm:rounded-2xl shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border overflow-hidden mb-4 sm:mb-6">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-start gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/10 dark:to-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-800 dark:text-white text-lg sm:text-xl md:text-2xl font-display font-light flex-shrink-0 ${profile.avatar_url ? 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200' : ''}`}
              onClick={() => profile.avatar_url && setShowAvatarModal(true)}
              style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full rounded-xl sm:rounded-2xl object-cover"
                />
              ) : (
                profile.username?.[0]?.toUpperCase() || <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2 sm:mb-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-light text-slate-800 dark:text-white truncate tracking-wide flex-1">
                  {profile.display_name || profile.username}
                </h1>
                {isOwnProfile ? (
                  <button
                    onClick={onOpenSettings}
                    className="flex-shrink-0 text-slate-400 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-white transition-all duration-200 mt-0.5"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                ) : currentUserId ? (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                        : 'bg-slate-800 dark:bg-white text-white dark:text-black hover:bg-slate-700 dark:hover:bg-gray-100 border border-transparent'
                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Follow</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-text-muted truncate">@{profile.username}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                  <Flame className={`w-3 h-3 sm:w-4 sm:h-4 ${streakData.currentStreak > 0 ? 'text-orange-500 dark:text-white' : 'text-slate-300 dark:text-white/30'}`} />
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white/90">{streakData.currentStreak}</span>
                  {streakData.longestStreak > streakData.currentStreak && (
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-white/40">/ {streakData.longestStreak}</span>
                  )}
                </div>
                {badges.length > 0 && (
                  <button
                    onClick={() => setShowAchievements(true)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-lg transition-all duration-200 active:scale-95"
                  >
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">{badges.length}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-white/60 mb-4 sm:mb-6 leading-relaxed">{linkifyText(profile.bio)}</p>
          )}

          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/5">
            <button
              onClick={() => setShowStatsModal('posts')}
              className="text-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg sm:rounded-xl py-2 sm:py-3 md:py-4 transition-all duration-200"
            >
              <div className="text-lg sm:text-xl md:text-2xl font-display font-light text-slate-800 dark:text-white mb-0.5 sm:mb-1">{stats.totalPosts}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">Posts</div>
            </button>
            <button
              onClick={() => setShowStatsModal('places')}
              className="text-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg sm:rounded-xl py-2 sm:py-3 md:py-4 transition-all duration-200"
            >
              <div className="text-lg sm:text-xl md:text-2xl font-display font-light text-slate-800 dark:text-white mb-0.5 sm:mb-1">{stats.uniqueLocations}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">Places</div>
            </button>
            <button
              onClick={() => setShowStatsModal('followers')}
              className="text-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg sm:rounded-xl py-2 sm:py-3 md:py-4 transition-all duration-200"
            >
              <div className="text-lg sm:text-xl md:text-2xl font-display font-light text-slate-800 dark:text-white mb-0.5 sm:mb-1">{stats.followers}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">Followers</div>
            </button>
            <button
              onClick={() => setShowStatsModal('following')}
              className="text-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg sm:rounded-xl py-2 sm:py-3 md:py-4 transition-all duration-200"
            >
              <div className="text-lg sm:text-xl md:text-2xl font-display font-light text-slate-800 dark:text-white mb-0.5 sm:mb-1">{stats.following}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-white/40 uppercase tracking-wider">Following</div>
            </button>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/5">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-white/20"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="bg-white dark:bg-black text-slate-800 dark:text-white">{year}</option>
                ))}
              </select>
              <button
                onClick={() => setShowRecap(true)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-slate-800 dark:bg-white text-white dark:text-black rounded-lg sm:rounded-xl hover:bg-slate-700 dark:hover:bg-gray-100 transition-all duration-200 flex-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Recap</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 items-center">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 font-medium ${
              activeFilter === 'all'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('public')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 font-medium ${
              activeFilter === 'public'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setActiveFilter('private')}
            className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 font-medium ${
              activeFilter === 'private'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
            }`}
          >
            Private
          </button>
          {logs.length > 0 && (
            <button
              onClick={exportLogs}
              className="ml-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white dark:bg-dark-panel rounded-lg sm:rounded-xl shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border">
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 dark:text-white/10 mx-auto mb-2 sm:mb-3" />
          <p className="text-slate-600 dark:text-white/40 text-xs sm:text-sm">No posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-dark-panel rounded-lg sm:rounded-xl shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border overflow-hidden hover:shadow-lg transition group cursor-pointer"
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
                    <h3 className="font-bold text-slate-800 dark:text-dark-text-primary text-xs mb-1 line-clamp-2">{log.title}</h3>
                    {log.description && (
                      <p className="text-xs text-slate-600 dark:text-dark-text-secondary line-clamp-3">{log.description}</p>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {log.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{log.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted">
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
