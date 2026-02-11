import { useEffect, useState } from 'react';
import { supabase, Log, Profile } from '../lib/supabase';
import { Calendar, MapPin, Plane, Globe, Lock, Search as SearchIcon, Filter, User, UserPlus, UserMinus, Heart, MessageCircle, X } from 'lucide-react';
import LogDetailModal from './LogDetailModal';
import { linkifyText } from '../lib/linkify';
import Tooltip from './Tooltip';

interface SearchProps {
  userId: string;
}

type TabType = 'users' | 'public' | 'mine';

interface UserResult extends Profile {
  followers_count: number;
  is_following: boolean;
}

interface PublicLogResult extends Log {
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export default function Search({ userId }: SearchProps) {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);

  const [usersQuery, setUsersQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [publicQuery, setPublicQuery] = useState('');
  const [publicLocationFilter, setPublicLocationFilter] = useState('');
  const [publicLogs, setPublicLogs] = useState<PublicLogResult[]>([]);
  const [publicLocations, setPublicLocations] = useState<string[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [selectedLogProfile, setSelectedLogProfile] = useState<Profile | null>(null);

  const [myQuery, setMyQuery] = useState('');
  const [myLocationFilter, setMyLocationFilter] = useState('');
  const [myLogs, setMyLogs] = useState<Log[]>([]);
  const [myLocations, setMyLocations] = useState<string[]>([]);
  const [myLoading, setMyLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyLogs();
    } else if (activeTab === 'public') {
      fetchPublicLocations();
    }
  }, [activeTab, userId]);

  useEffect(() => {
    if (activeTab === 'users' && usersQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (activeTab === 'users' && !usersQuery.trim()) {
      setUsers([]);
    }
  }, [usersQuery, activeTab]);

  useEffect(() => {
    if (activeTab === 'public' && publicQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchPublicLogs();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (activeTab === 'public' && !publicQuery.trim() && !publicLocationFilter) {
      setPublicLogs([]);
    }
  }, [publicQuery, publicLocationFilter, activeTab]);

  const searchUsers = async () => {
    if (!usersQuery.trim()) return;

    setUsersLoading(true);
    try {
      const query = usersQuery.toLowerCase();
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', userId)
        .limit(20);

      if (error) throw error;

      const profilesWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [followersResult, followingResult] = await Promise.all([
            supabase
              .from('follows')
              .select('id', { count: 'exact', head: true })
              .eq('following_id', profile.id),
            supabase
              .from('follows')
              .select('id')
              .eq('follower_id', userId)
              .eq('following_id', profile.id)
              .maybeSingle(),
          ]);

          return {
            ...profile,
            followers_count: followersResult.count || 0,
            is_following: !!followingResult.data,
          };
        })
      );

      setUsers(profilesWithStats);
    } catch (err: any) {
      console.error('Error searching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const searchPublicLogs = async () => {
    if (!publicQuery.trim() && !publicLocationFilter) {
      setPublicLogs([]);
      return;
    }

    setPublicLoading(true);
    try {
      let query = supabase
        .from('logs')
        .select(`
          *,
          author:profiles!logs_user_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('is_public', true)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (publicQuery.trim()) {
        const searchTerm = publicQuery.toLowerCase();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,trip_name.ilike.%${searchTerm}%`);
      }

      if (publicLocationFilter) {
        query = query.eq('location', publicLocationFilter);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      const logsWithCounts = await Promise.all(
        (logs || []).map(async (log) => {
          const [likesResult, commentsResult, likedResult] = await Promise.all([
            supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .eq('log_id', log.id),
            supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('log_id', log.id),
            supabase
              .from('likes')
              .select('id')
              .eq('log_id', log.id)
              .eq('user_id', userId)
              .maybeSingle(),
          ]);

          return {
            ...log,
            author: Array.isArray(log.author) ? log.author[0] : log.author,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            is_liked: !!likedResult.data,
          };
        })
      );

      setPublicLogs(logsWithCounts);
    } catch (err: any) {
      console.error('Error searching public logs:', err);
    } finally {
      setPublicLoading(false);
    }
  };

  const fetchPublicLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('location')
        .eq('is_public', true)
        .not('location', 'is', null);

      if (error) throw error;

      const uniqueLocations = Array.from(
        new Set(data?.map((l) => l.location).filter(Boolean))
      ).sort();
      setPublicLocations(uniqueLocations as string[]);
    } catch (err: any) {
      console.error('Error fetching public locations:', err);
    }
  };

  const fetchMyLogs = async () => {
    setMyLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyLogs(data || []);

      const uniqueLocations = Array.from(
        new Set(data?.map((l) => l.location).filter(Boolean))
      ).sort();
      setMyLocations(uniqueLocations as string[]);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    } finally {
      setMyLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId
              ? { ...u, is_following: false, followers_count: u.followers_count - 1 }
              : u
          )
        );
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: userId,
            following_id: targetUserId,
          });

        if (error) throw error;

        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId
              ? { ...u, is_following: true, followers_count: u.followers_count + 1 }
              : u
          )
        );
      }
    } catch (err: any) {
      console.error('Error toggling follow:', err);
    }
  };

  const openLogDetail = (log: PublicLogResult) => {
    setSelectedLog(log);
    setSelectedLogProfile({
      id: log.author.id,
      username: log.author.username,
      display_name: log.author.display_name,
      avatar_url: log.author.avatar_url,
      bio: null,
      created_at: '',
      updated_at: '',
      email_notifications_enabled: true,
      weekly_recap_enabled: false,
    });
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

  const filteredMyLogs = myLogs.filter((log) => {
    if (myQuery) {
      const query = myQuery.toLowerCase();
      const matchesSearch =
        log.title.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        log.location?.toLowerCase().includes(query) ||
        log.trip_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (myLocationFilter && log.location !== myLocationFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-dark-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition relative ${
              activeTab === 'users'
                ? 'text-slate-800 dark:text-dark-text-primary'
                : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700'
            }`}
          >
            Users
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 dark:bg-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition relative ${
              activeTab === 'public'
                ? 'text-slate-800 dark:text-dark-text-primary'
                : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700'
            }`}
          >
            Public Logs
            {activeTab === 'public' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 dark:bg-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition relative ${
              activeTab === 'mine'
                ? 'text-slate-800 dark:text-dark-text-primary'
                : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700'
            }`}
          >
            My Logs
            {activeTab === 'mine' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 dark:bg-orange-500"></div>
            )}
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={usersQuery}
                  onChange={(e) => setUsersQuery(e.target.value)}
                  placeholder="Search users by name or username..."
                  className="w-full pl-10 pr-10 py-3 text-base border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
                {usersQuery && (
                  <button
                    onClick={() => setUsersQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-dark-text-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {usersQuery && (
                <div className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  {users.length} {users.length === 1 ? 'user' : 'users'} found
                </div>
              )}
            </div>
          )}

          {activeTab === 'public' && (
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={publicQuery}
                  onChange={(e) => setPublicQuery(e.target.value)}
                  placeholder="Search public logs..."
                  className="w-full pl-10 pr-10 py-3 text-base border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
                {publicQuery && (
                  <button
                    onClick={() => setPublicQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-dark-text-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {publicLocations.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={publicLocationFilter}
                    onChange={(e) => setPublicLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">All Locations</option>
                    {publicLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(publicQuery || publicLocationFilter) && (
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-dark-text-secondary pt-2 border-t border-slate-200 dark:border-dark-border">
                  <span>
                    {publicLogs.length} {publicLogs.length === 1 ? 'result' : 'results'}
                  </span>
                  {publicLocationFilter && (
                    <button
                      onClick={() => {
                        setPublicLocationFilter('');
                      }}
                      className="text-slate-500 dark:text-dark-text-muted hover:text-slate-700 underline text-xs"
                    >
                      Clear location
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mine' && (
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={myQuery}
                  onChange={(e) => setMyQuery(e.target.value)}
                  placeholder="Search your logs..."
                  className="w-full pl-10 pr-10 py-3 text-base border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
                {myQuery && (
                  <button
                    onClick={() => setMyQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-dark-text-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {myLocations.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={myLocationFilter}
                    onChange={(e) => setMyLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">All Locations</option>
                    {myLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-dark-text-secondary pt-2 border-t border-slate-200 dark:border-dark-border">
                <span>
                  {filteredMyLogs.length} {filteredMyLogs.length === 1 ? 'result' : 'results'}
                </span>
                {myLocationFilter && (
                  <button
                    onClick={() => {
                      setMyLocationFilter('');
                    }}
                    className="text-slate-500 dark:text-dark-text-muted hover:text-slate-700 underline text-xs"
                  >
                    Clear location
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'users' && (
        <div>
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 dark:border-dark-border border-t-slate-800"></div>
            </div>
          ) : users.length === 0 && usersQuery ? (
            <div className="text-center py-12 bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-dark-text-secondary text-sm">No users found</p>
              <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
                Try a different search term
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border">
              <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-dark-text-secondary text-sm">Search for users to discover</p>
              <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
                Find and follow people on Full Circle
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border hover:shadow-lg transition p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-slate-800 dark:bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.username?.[0]?.toUpperCase() || <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-dark-text-primary truncate">
                        {user.display_name || user.username}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-dark-text-muted truncate mb-1">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-slate-600 dark:text-dark-text-secondary line-clamp-2 mb-2">
                          {linkifyText(user.bio)}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-dark-text-muted">
                        <span>{user.followers_count} followers</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollowToggle(user.id, user.is_following)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                        user.is_following
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-800 dark:bg-orange-500 text-white hover:bg-slate-700'
                      }`}
                    >
                      {user.is_following ? (
                        <>
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'public' && (
        <div>
          {publicLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 dark:border-dark-border border-t-slate-800"></div>
            </div>
          ) : publicLogs.length === 0 && (publicQuery || publicLocationFilter) ? (
            <div className="text-center py-12 bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border">
              <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-dark-text-secondary text-sm">No matching logs found</p>
              <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
                Try adjusting your search filters
              </p>
            </div>
          ) : publicLogs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-dark-text-secondary text-sm">Search to discover public logs</p>
              <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
                Explore memories shared by the community
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {publicLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border hover:shadow-lg transition overflow-hidden cursor-pointer"
                  onClick={() => openLogDetail(log)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-slate-800 dark:bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {log.author.avatar_url ? (
                          <img
                            src={log.author.avatar_url}
                            alt={log.author.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          log.author.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary truncate">
                          {log.author.display_name || log.author.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted truncate">@{log.author.username}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(log.event_date)}</span>
                      </div>
                    </div>

                    {log.image_url && (
                      <img
                        src={log.image_url}
                        alt={log.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}

                    <h3 className="text-sm font-bold text-slate-800 dark:text-dark-text-primary mb-1">{log.title}</h3>
                    {log.description && (
                      <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-2 line-clamp-2">
                        {linkifyText(log.description)}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {log.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{log.location}</span>
                          </div>
                        )}
                        {log.trip_name && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                            <Plane className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{log.trip_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-dark-text-muted">
                        <div className="flex items-center gap-1">
                          <Heart className={`w-4 h-4 ${log.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>{log.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{log.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mine' && (
        <div>
          {myLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 dark:border-dark-border border-t-slate-800"></div>
            </div>
          ) : filteredMyLogs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border">
              <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-dark-text-secondary text-sm">No matching logs found</p>
              <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
                Try adjusting your search filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredMyLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border hover:shadow-lg transition p-4"
                >
                  <div className="flex items-start gap-3">
                    {log.image_url && (
                      <img
                        src={log.image_url}
                        alt={log.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(log.event_date)}</span>
                        </div>
                        {log.is_public ? (
                          <Tooltip text="Public" position="top">
                            <Globe className="w-3 h-3 text-green-600" />
                          </Tooltip>
                        ) : (
                          <Tooltip text="Private" position="top">
                            <Lock className="w-3 h-3 text-slate-400" />
                          </Tooltip>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-dark-text-primary mb-1 line-clamp-1">{log.title}</h3>
                      {log.description && (
                        <p className="text-xs text-slate-600 dark:text-dark-text-secondary mb-2 line-clamp-2">{log.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {log.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{log.location}</span>
                          </div>
                        )}
                        {log.trip_name && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                            <Plane className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{log.trip_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedLog && selectedLogProfile && (
        <LogDetailModal
          log={selectedLog}
          profile={selectedLogProfile}
          currentUserId={userId}
          onClose={() => {
            setSelectedLog(null);
            setSelectedLogProfile(null);
          }}
          showSocialFeatures={true}
        />
      )}
    </div>
  );
}
