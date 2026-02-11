import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Log, Profile } from '../lib/supabase';
import { Calendar, MapPin, Plane, Heart, MessageCircle, User } from 'lucide-react';
import LogDetailModal from './LogDetailModal';
import { checkAndAwardBadges } from '../lib/achievementManager';

interface FeedProps {
  userId: string;
  initialLogId?: string | null;
  onLogOpened?: () => void;
}

interface FeedLog extends Log {
  profile: Profile;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
}

export default function Feed({ userId, initialLogId, onLogOpened }: FeedProps) {
  const [logs, setLogs] = useState<FeedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLog, setSelectedLog] = useState<FeedLog | null>(null);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    fetchFeed(true);
  }, [userId]);

  useEffect(() => {
    if (initialLogId && logs.length > 0) {
      const logToOpen = logs.find(log => log.id === initialLogId);
      if (logToOpen) {
        setSelectedLog(logToOpen);
        onLogOpened?.();
      }
    }
  }, [initialLogId, logs, onLogOpened]);

  const fetchFeed = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentOffset = reset ? 0 : offset;
      const { data, error } = await supabase.rpc('get_feed_with_stats', {
        p_user_id: userId,
        p_limit: LIMIT,
        p_offset: currentOffset,
      });

      if (error) {
        console.error('Error fetching feed:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        if (reset) {
          setLogs([]);
        }
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const feedLogs: FeedLog[] = data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        location: row.location,
        event_date: row.event_date,
        is_public: row.is_public,
        trip_name: row.trip_name,
        image_url: row.image_url,
        created_at: row.created_at,
        profile: {
          id: row.profile_id,
          username: row.profile_username,
          display_name: row.profile_display_name,
          bio: row.profile_bio,
          avatar_url: row.profile_avatar_url,
          created_at: '',
        },
        likes_count: Number(row.likes_count),
        comments_count: Number(row.comments_count),
        user_liked: row.user_liked,
      }));

      if (reset) {
        setLogs(feedLogs);
        setOffset(LIMIT);
      } else {
        setLogs(prev => [...prev, ...feedLogs]);
        setOffset(prev => prev + LIMIT);
      }

      setHasMore(data.length === LIMIT);
    } catch (err: any) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const toggleLike = async (log: FeedLog, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (log.user_liked) {
        await supabase.from('likes').delete().eq('log_id', log.id).eq('user_id', userId);
        setLogs((prev) =>
          prev.map((l) =>
            l.id === log.id
              ? { ...l, user_liked: false, likes_count: l.likes_count - 1 }
              : l
          )
        );
      } else {
        await supabase.from('likes').insert({ log_id: log.id, user_id: userId });
        setLogs((prev) =>
          prev.map((l) =>
            l.id === log.id
              ? { ...l, user_liked: true, likes_count: l.likes_count + 1 }
              : l
          )
        );
        checkAndAwardBadges(log.user_id);
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
    }
  };

  const handleLogRefresh = () => {
    fetchFeed(true);
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


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-800"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">No public logs yet</p>
        <p className="text-slate-500 text-xs mt-1">
          Be the first to share your experiences!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
            onClick={() => setSelectedLog(log)}
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/profile/${log.user_id}`}
                  state={{ from: 'feed' }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:opacity-80 transition overflow-hidden"
                >
                  {log.profile?.avatar_url ? (
                    <img
                      src={log.profile.avatar_url}
                      alt={log.profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    log.profile?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />
                  )}
                </Link>
                <Link
                  to={`/profile/${log.user_id}`}
                  state={{ from: 'feed' }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 hover:opacity-80 transition"
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {log.profile?.display_name || log.profile?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    @{log.profile?.username || 'unknown'}
                  </p>
                </Link>
                <div className="text-xs text-slate-500 flex-shrink-0">{formatDate(log.event_date)}</div>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-1">{log.title}</h3>

              {log.description && (
                <p className="text-sm text-slate-600 mb-2 line-clamp-3">{log.description}</p>
              )}

              {log.image_url && (
                <img
                  src={log.image_url}
                  alt={log.title}
                  className="w-full h-64 object-cover rounded-lg mb-2"
                />
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                {log.location && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    <span>{log.location}</span>
                  </div>
                )}
                {log.trip_name && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                    <Plane className="w-3 h-3" />
                    <span>{log.trip_name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <button
                  onClick={(e) => toggleLike(log, e)}
                  className={`flex items-center gap-1 text-sm transition ${
                    log.user_liked
                      ? 'text-red-600 font-semibold'
                      : 'text-slate-500 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${log.user_liked ? 'fill-red-600' : ''}`} />
                  <span>{log.likes_count}</span>
                </button>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{log.comments_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {hasMore && !loading && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => fetchFeed(false)}
              disabled={loadingMore}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          profile={selectedLog.profile}
          currentUserId={userId}
          onClose={() => {
            setSelectedLog(null);
            handleLogRefresh();
          }}
          showSocialFeatures={true}
        />
      )}
    </>
  );
}
