import { useEffect, useState } from 'react';
import { supabase, Log, Profile } from '../lib/supabase';
import { Calendar, MapPin, Plane, Globe, Lock, Trash2, ChevronDown, ChevronUp, Heart, MessageCircle } from 'lucide-react';
import Tooltip from './Tooltip';
import LogDetailModal from './LogDetailModal';

interface TimelineProps {
  userId: string;
  refreshTrigger: number;
}

interface LogWithEngagement extends Log {
  likes_count: number;
  comments_count: number;
}

export default function Timeline({ userId, refreshTrigger }: TimelineProps) {
  const [logs, setLogs] = useState<LogWithEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [selectedLog, setSelectedLog] = useState<LogWithEngagement | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchUserProfile();
  }, [userId, refreshTrigger]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: logsData, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!logsData || logsData.length === 0) {
        setLogs([]);
        return;
      }

      const logsWithEngagement = await Promise.all(
        logsData.map(async (log) => {
          const [{ count: likesCount }, { count: commentsCount }] = await Promise.all([
            supabase.from('likes').select('*', { count: 'exact', head: true }).eq('log_id', log.id),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('log_id', log.id),
          ]);

          return {
            ...log,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
          };
        })
      );

      setLogs(logsWithEngagement);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm('Delete this log entry?')) return;

    try {
      const { error } = await supabase.from('logs').delete().eq('id', id);
      if (error) throw error;
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete log');
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 dark:border-dark-border border-t-slate-800 dark:border-t-slate-700"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-slate-300 dark:text-dark-border mx-auto mb-2" />
        <p className="text-slate-600 dark:text-dark-text-secondary text-sm">No entries yet</p>
        <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
          Start logging your life's moments above
        </p>
      </div>
    );
  }

  const groupLogsByMonth = (logs: Log[]) => {
    const grouped: { [key: string]: Log[] } = {};
    logs.forEach((log) => {
      const [year, month, day] = log.event_date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthYear = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(log);
    });
    return grouped;
  };

  const groupedLogs = groupLogsByMonth(logs);

  const toggleMonth = (monthYear: string) => {
    setCollapsedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) {
        newSet.delete(monthYear);
      } else {
        newSet.add(monthYear);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="space-y-4">
        {Object.entries(groupedLogs).map(([monthYear, groupLogs]) => (
          <div key={monthYear}>
            <div className="sticky top-0 bg-slate-50 dark:bg-dark-bg z-10 py-2 mb-3">
              <button
                onClick={() => toggleMonth(monthYear)}
                className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-dark-text-primary hover:text-slate-600 dark:hover:text-dark-text-secondary transition"
              >
                <span>{monthYear}</span>
                {collapsedMonths.has(monthYear) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-normal">({groupLogs.length})</span>
              </button>
            </div>

            {!collapsedMonths.has(monthYear) && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-dark-border"></div>

              <div className="space-y-3">
                {groupLogs.map((log) => (
                <div key={log.id} className="relative pl-11">
                  <div className="absolute left-0 w-8 h-8 bg-slate-800 dark:bg-slate-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs">
                    {formatDate(log.event_date).split(' ')[1]}
                  </div>

                  <div
                    onClick={() => setSelectedLog(log)}
                    className="bg-white dark:bg-dark-panel rounded-lg shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-200 p-3 group cursor-pointer">

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(log.event_date)}</span>
                          {log.is_public ? (
                            <Tooltip text="Public" position="top">
                              <Globe className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </Tooltip>
                          ) : (
                            <Tooltip text="Private" position="top">
                              <Lock className="w-3 h-3 text-slate-400 dark:text-dark-text-muted" />
                            </Tooltip>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary leading-tight">
                          {log.title}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLog(log.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition text-slate-400 dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {log.image_url && (
                      <img
                        src={log.image_url}
                        alt={log.title}
                        className="w-full h-32 object-cover rounded-lg mb-2 border dark:border-dark-border"
                      />
                    )}

                    {log.description && (
                      <p className="text-slate-600 dark:text-dark-text-secondary mb-2 leading-relaxed text-xs">
                        {log.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-hover px-2 py-1 rounded-full">
                          <MapPin className="w-3 h-3" />
                          <span>{log.location}</span>
                        </div>
                      )}
                      {log.trip_name && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-hover px-2 py-1 rounded-full">
                          <Plane className="w-3 h-3" />
                          <span>{log.trip_name}</span>
                        </div>
                      )}
                    </div>

                    {(log.likes_count > 0 || log.comments_count > 0) && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-dark-border">
                        {log.likes_count > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-secondary">
                            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                            <span>{log.likes_count}</span>
                          </div>
                        )}
                        {log.comments_count > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-secondary">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{log.comments_count}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
          </div>
        ))}
      </div>

      {selectedLog && userProfile && (
        <LogDetailModal
          log={selectedLog}
          profile={userProfile}
          currentUserId={userId}
          onClose={() => setSelectedLog(null)}
          showSocialFeatures={false}
        />
      )}
    </>
  );
}
