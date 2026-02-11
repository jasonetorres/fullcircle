import { X, Calendar, MapPin, Plane, Lock, Globe, Heart, MessageCircle, Send, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Log, Profile, Comment } from '../lib/supabase';
import { checkAndAwardBadges } from '../lib/achievementManager';

interface LogDetailModalProps {
  log: Log;
  profile: Profile;
  currentUserId: string;
  onClose: () => void;
  showSocialFeatures?: boolean;
}

interface CommentWithProfile extends Comment {
  profile: Profile;
  likes_count?: number;
  user_liked?: boolean;
  replies?: CommentWithProfile[];
}

export default function LogDetailModal({ log, profile, currentUserId, onClose, showSocialFeatures = true }: LogDetailModalProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [, setMentionSearch] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<Profile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
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

      const commentsData = (data || []) as CommentWithProfile[];

      if (commentsData.length === 0) {
        setComments([]);
        return;
      }

      const commentIds = commentsData.map(c => c.id);

      const [{ data: allLikes }, { data: userLikes }] = await Promise.all([
        supabase.from('comment_likes').select('comment_id').in('comment_id', commentIds),
        supabase.from('comment_likes').select('comment_id').eq('user_id', currentUserId).in('comment_id', commentIds),
      ]);

      const likesCountMap = new Map<string, number>();
      allLikes?.forEach(like => {
        likesCountMap.set(like.comment_id, (likesCountMap.get(like.comment_id) || 0) + 1);
      });

      const userLikedSet = new Set(userLikes?.map(l => l.comment_id));

      const commentsWithLikes = commentsData.map(comment => ({
        ...comment,
        likes_count: likesCountMap.get(comment.id) || 0,
        user_liked: userLikedSet.has(comment.id),
      }));

      const topLevelComments = commentsWithLikes.filter(c => !c.parent_comment_id);
      const commentMap = new Map(commentsWithLikes.map(c => [c.id, { ...c, replies: [] as CommentWithProfile[] }]));

      commentsWithLikes.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(comment);
          }
        }
      });

      setComments(topLevelComments.map(c => commentMap.get(c.id)!));
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
    const previousLiked = userLiked;
    const previousCount = likesCount;

    try {
      if (userLiked) {
        setUserLiked(false);
        setLikesCount(prev => prev - 1);
        await supabase.from('likes').delete().eq('log_id', log.id).eq('user_id', currentUserId);
      } else {
        setUserLiked(true);
        setLikesCount(prev => prev + 1);
        await supabase.from('likes').insert({ log_id: log.id, user_id: currentUserId });
        checkAndAwardBadges(log.user_id);
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      setUserLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const toggleCommentLike = async (commentId: string, currentlyLiked: boolean) => {
    const previousComments = comments;

    try {
      setComments(prev => updateCommentLikes(prev, commentId, !currentlyLiked));

      if (currentlyLiked) {
        await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', currentUserId);
      } else {
        await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: currentUserId });
      }
    } catch (err: any) {
      console.error('Error toggling comment like:', err);
      setComments(previousComments);
    }
  };

  const updateCommentLikes = (comments: CommentWithProfile[], commentId: string, liked: boolean): CommentWithProfile[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          user_liked: liked,
          likes_count: (comment.likes_count || 0) + (liked ? 1 : -1),
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentLikes(comment.replies, commentId, liked),
        };
      }
      return comment;
    });
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1 && lastAtSymbol === cursorPos - 1) {
      setShowMentions(true);
      setMentionSearch('');
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers('');
      }, 300);
    } else if (lastAtSymbol !== -1) {
      const searchTerm = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!searchTerm.includes(' ') && searchTerm.length >= 2) {
        setMentionSearch(searchTerm);
        setShowMentions(true);
        searchTimeoutRef.current = setTimeout(() => {
          searchUsers(searchTerm);
        }, 300);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setMentionSuggestions(data || []);
    } catch (err: any) {
      console.error('Error searching users:', err);
    }
  };

  const insertMention = (username: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = newComment.slice(0, cursorPos);
    const textAfterCursor = newComment.slice(cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    const newText = textBeforeCursor.slice(0, lastAtSymbol) + `@${username} ` + textAfterCursor;
    setNewComment(newText);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const mentions = extractMentions(newComment);

      const { error } = await supabase
        .from('comments')
        .insert({
          log_id: log.id,
          user_id: currentUserId,
          content: newComment.trim(),
          mentions: mentions,
        })
        .select('*, profile:profiles(*)')
        .single();

      if (error) throw error;

      await fetchComments();
      setNewComment('');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitReply = async (parentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const mentions = extractMentions(content);

      await supabase
        .from('comments')
        .insert({
          log_id: log.id,
          user_id: currentUserId,
          content: content.trim(),
          parent_comment_id: parentId,
          mentions: mentions,
        });

      await fetchComments();
      setReplyingTo(null);
      setReplyContent('');
    } catch (err: any) {
      console.error('Error submitting reply:', err);
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

  const renderComment = (comment: CommentWithProfile, isReply = false) => (
    <div key={comment.id} className={isReply ? 'ml-7' : ''}>
      <div className="flex gap-2">
        <Link
          to={`/profile/${comment.user_id}`}
          className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:opacity-80 transition"
        >
          {comment.profile?.username?.[0]?.toUpperCase() || 'U'}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 dark:bg-dark-hover rounded-lg p-2">
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                to={`/profile/${comment.user_id}`}
                className="text-xs font-semibold text-slate-800 dark:text-dark-text-primary truncate hover:opacity-80 transition"
              >
                {comment.profile?.display_name || comment.profile?.username}
              </Link>
              <span className="text-xs text-slate-500 dark:text-dark-text-muted flex-shrink-0">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-dark-text-secondary break-words whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex items-center gap-3 mt-1 px-2">
            <button
              onClick={() => toggleCommentLike(comment.id, comment.user_liked || false)}
              className={`flex items-center gap-1 text-xs transition ${
                comment.user_liked ? 'text-red-600 font-semibold' : 'text-slate-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${comment.user_liked ? 'fill-red-600' : ''}`} />
              {comment.likes_count ? <span>{comment.likes_count}</span> : null}
            </button>

            {!isReply && (
              <button
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyContent(`@${comment.profile?.username} `);
                }}
                className="text-xs text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text-secondary transition font-medium"
              >
                Reply
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  autoFocus
                  className="flex-1 px-2 py-1.5 text-xs border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={() => submitReply(comment.id, replyContent)}
                  disabled={!replyContent.trim()}
                  className="px-2 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-2 py-1.5 text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:text-dark-text-primary transition text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-panel sm:rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col mt-[64px] mb-[64px] max-h-[calc(100dvh-128px)] sm:mt-0 sm:mb-0 sm:h-auto sm:max-h-[85dvh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 bg-white dark:bg-dark-panel border-b border-slate-200 dark:border-dark-border p-3 flex items-center justify-between">
          <Link to={`/profile/${profile.id}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary truncate">{profile.display_name || profile.username}</p>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted truncate">@{profile.username}</p>
            </div>
          </Link>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-dark-text-secondary transition flex-shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {log.image_url && (
            <div className="bg-slate-100 flex items-center justify-center">
              <img src={log.image_url} alt={log.title} className="w-full h-auto max-h-[40dvh] object-contain" />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-dark-text-secondary mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className="truncate">{formatDate(log.event_date)}</span>
              {log.is_public ? (
                <Globe className="w-3.5 h-3.5 text-green-600 ml-auto flex-shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0" />
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary mb-2">{log.title}</h2>

            {log.description && (
              <p className="text-sm text-slate-700 dark:text-dark-text-secondary mb-3 leading-relaxed whitespace-pre-wrap">{log.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {log.location && (
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-dark-text-secondary bg-slate-100 dark:bg-dark-hover px-2.5 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{log.location}</span>
                </div>
              )}
              {log.trip_name && (
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-dark-text-secondary bg-slate-100 dark:bg-dark-hover px-2.5 py-1 rounded-full">
                  <Plane className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{log.trip_name}</span>
                </div>
              )}
            </div>

            {showSocialFeatures && log.is_public && (
              <>
                <div className="flex items-center gap-4 py-3 border-t border-slate-200 dark:border-dark-border mb-3">
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
                    <span className="text-sm">{comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-dark-border pt-3">
                  <h3 className="font-semibold text-slate-800 dark:text-dark-text-primary mb-2 text-sm">Comments</h3>
                  <div className="space-y-3 mb-3">
                    {comments.length === 0 ? (
                      <p className="text-center text-slate-500 dark:text-dark-text-muted text-xs py-3">No comments yet</p>
                    ) : (
                      comments.map((comment) => renderComment(comment))
                    )}
                  </div>

                  <form onSubmit={submitComment} className="bg-white dark:bg-dark-panel pt-2 pb-2">
                    <div className="relative">
                      {showMentions && mentionSuggestions.length > 0 && (
                        <div className="absolute bottom-full mb-1 w-full bg-white dark:bg-dark-panel border border-slate-300 dark:border-dark-border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                          {mentionSuggestions.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => insertMention(user.username)}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-dark-hover transition flex items-center gap-2"
                            >
                              <div className="w-5 h-5 bg-slate-800 dark:bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {user.username[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-dark-text-primary">{user.display_name || user.username}</div>
                                <div className="text-slate-500 dark:text-dark-text-muted">@{user.username}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={newComment}
                          onChange={handleInputChange}
                          placeholder="Write a comment... (use @ to mention)"
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:border-transparent outline-none transition"
                        />
                        <button
                          type="submit"
                          disabled={!newComment.trim() || submittingComment}
                          className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 touch-manipulation"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
