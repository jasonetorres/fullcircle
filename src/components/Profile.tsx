import { useEffect, useState } from 'react';
import { supabase, Profile as ProfileType, Log } from '../lib/supabase';
import { MapPin, Calendar, Settings, User, Sparkles, Download, UserPlus, UserMinus } from 'lucide-react';
import { YearRecap } from './YearRecap';
import LogDetailModal from './LogDetailModal';
import { linkifyText } from '../lib/linkify';

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

  const isOwnProfile = userId === currentUserId;

  const availableYears = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  ).reverse();

  useEffect(() => {
    fetchProfile();
    fetchLogs();
    fetchStats();
    if (!isOwnProfile && currentUserId) {
      checkFollowStatus();
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

          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{stats.totalPosts}</div>
              <div className="text-xs text-slate-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{stats.uniqueLocations}</div>
              <div className="text-xs text-slate-500">Places</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{stats.followers}</div>
              <div className="text-xs text-slate-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">{stats.following}</div>
              <div className="text-xs text-slate-500">Following</div>
            </div>
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
    </>
  );
}
