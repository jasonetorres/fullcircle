import { X, Calendar, MapPin, Plane, Lock, Globe, Heart, MessageCircle, Send, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, Log, Profile, Comment } from '../lib/supabase';

interface LogDetailModalProps {
  log: Log;
  profile: Profile;
  currentUserId: string;
  onClose: () => void;
  showSocialFeatures?: boolean;
}

interface CommentWithProfile extends Comment {
  profile: Profile;
}

export default function LogDetailModal({ log, profile, currentUserId, onClose, showSocialFeatures = true }: LogDetailModalProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (showSocialFeatures) {
      fetchComments();
      fetchLikes();
    }
  }, [log.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profile:profiles(*)')
        .eq('log_id', log.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []) as CommentWithProfile[]);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchLikes = async () => {
    try {
      const [{ data: allLikes }, { data: userLike }] = await Promise.all([
        supabase.from('likes').select('id').eq('log_id', log.id),
        supabase.from('likes').select('id').eq('log_id', log.id).eq('user_id', currentUserId).maybeSingle(),
      ]);

      setLikesCount(allLikes?.length || 0);
      setUserLiked(!!userLike);
    } catch (err: any) {
      console.error('Error fetching likes:', err);
    }
  };

  const toggleLike = async () => {
    try {
      if (userLiked) {
        await supabase.from('likes').delete().eq('log_id', log.id).eq('user_id', currentUserId);
        setUserLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase.from('likes').insert({ log_id: log.id, user_id: currentUserId });
        setUserLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          log_id: log.id,
          user_id: currentUserId,
          content: newComment.trim(),
        })
        .select('*, profile:profiles(*)')
        .single();

      if (error) throw error;

      setComments((prev) => [...prev, data as CommentWithProfile]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 sm:p-4" onClick={onClose}>
      <div className="bg-white sm:rounded-xl shadow-2xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 bg-white border-b border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{profile.display_name || profile.username}</p>
              <p className="text-xs text-slate-500 truncate">@{profile.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {log.image_url && (
            <div className="bg-slate-100 flex items-center justify-center">
              <img src={log.image_url} alt={log.title} className="w-full h-auto max-h-[40vh] object-contain" />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className="truncate">{formatDate(log.event_date)}</span>
              {log.is_public ? (
                <Globe className="w-3.5 h-3.5 text-green-600 ml-auto flex-shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0" />
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">{log.title}</h2>

            {log.description && (
              <p className="text-sm text-slate-700 mb-3 leading-relaxed whitespace-pre-wrap">{log.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {log.location && (
                <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{log.location}</span>
                </div>
              )}
              {log.trip_name && (
                <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  <Plane className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{log.trip_name}</span>
                </div>
              )}
            </div>

            {showSocialFeatures && log.is_public && (
              <>
                <div className="flex items-center gap-4 py-3 border-t border-slate-200 mb-3">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1.5 transition ${
                      userLiked
                        ? 'text-red-600 font-semibold'
                        : 'text-slate-500 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${userLiked ? 'fill-red-600' : ''}`} />
                    <span className="text-sm">{likesCount}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{comments.length}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm">Comments</h3>
                  <div className="space-y-2 mb-3">
                    {comments.length === 0 ? (
                      <p className="text-center text-slate-500 text-xs py-3">No comments yet</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {comment.profile?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-lg p-2 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {comment.profile?.display_name || comment.profile?.username}
                              </span>
                              <span className="text-xs text-slate-500 flex-shrink-0">
                                {formatTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 break-words">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={submitComment} className="flex gap-2 sticky bottom-0 bg-white pt-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
