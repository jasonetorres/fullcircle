import { useEffect, useState } from 'react';
import { supabase, Log, Profile } from '../lib/supabase';
import { Calendar, MapPin, Plane, Heart, MessageCircle, User } from 'lucide-react';
import LogDetailModal from './LogDetailModal';

interface FeedProps {
  userId: string;
}

interface FeedLog extends Log {
  profile: Profile;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
}

export default function Feed({ userId }: FeedProps) {
  const [logs, setLogs] = useState<FeedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<FeedLog | null>(null);

  useEffect(() => {
    fetchFeed();
  }, [userId]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('is_public', true)
        .order('event_date', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Error fetching logs:', logsError);
        throw logsError;
      }

      if (!logsData || logsData.length === 0) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(logsData.map((log) => log.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const logIds = logsData.map((log) => log.id);
      const [{ data: likesData }, { data: commentsData }, { data: userLikesData }] =
        await Promise.all([
          supabase.from('likes').select('log_id').in('log_id', logIds),
          supabase.from('comments').select('log_id').in('log_id', logIds),
          supabase.from('likes').select('log_id').eq('user_id', userId).in('log_id', logIds),
        ]);

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));
      const likesCount = new Map<string, number>();
      const commentsCount = new Map<string, number>();
      const userLikedSet = new Set(userLikesData?.map((l) => l.log_id));

      likesData?.forEach((like) => {
        likesCount.set(like.log_id, (likesCount.get(like.log_id) || 0) + 1);
      });

      commentsData?.forEach((comment) => {
        commentsCount.set(comment.log_id, (commentsCount.get(comment.log_id) || 0) + 1);
      });

      const feedLogs: FeedLog[] = logsData
        .filter((log) => profilesMap.has(log.user_id))
        .map((log) => ({
          ...log,
          profile: profilesMap.get(log.user_id)!,
          likes_count: likesCount.get(log.id) || 0,
          comments_count: commentsCount.get(log.id) || 0,
          user_liked: userLikedSet.has(log.id),
        }));

      setLogs(feedLogs);
    } catch (err: any) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
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
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
    }
  };

  const handleLogRefresh = () => {
    fetchFeed();
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
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {log.profile?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {log.profile?.display_name || log.profile?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    @{log.profile?.username || 'unknown'}
                  </p>
                </div>
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
