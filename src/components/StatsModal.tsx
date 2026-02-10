import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { X, User, MapPin, Calendar } from 'lucide-react';

interface StatsModalProps {
  userId: string;
  type: 'followers' | 'following' | 'posts' | 'places';
  onClose: () => void;
}

interface FollowUser extends Profile {
  isFollowing?: boolean;
}

interface PostItem {
  id: string;
  title: string;
  event_date: string;
  location?: string;
  image_url?: string;
}

interface PlaceItem {
  location: string;
  count: number;
}

export default function StatsModal({ userId, type, onClose }: StatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    getCurrentUser();
    fetchData();
  }, [userId, type]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || '');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (type === 'followers') {
        const { data, error } = await supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(*)')
          .eq('following_id', userId);

        if (error) throw error;

        const followerProfiles = data?.map((f: any) => f.profiles) || [];
        setUsers(followerProfiles);
      } else if (type === 'following') {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(*)')
          .eq('follower_id', userId);

        if (error) throw error;

        const followingProfiles = data?.map((f: any) => f.profiles) || [];
        setUsers(followingProfiles);
      } else if (type === 'posts') {
        const { data, error } = await supabase
          .from('logs')
          .select('id, title, event_date, location, image_url')
          .eq('user_id', userId)
          .order('event_date', { ascending: false })
          .limit(50);

        if (error) throw error;
        setPosts(data || []);
      } else if (type === 'places') {
        const { data, error } = await supabase
          .from('logs')
          .select('location')
          .eq('user_id', userId)
          .not('location', 'is', null);

        if (error) throw error;

        const locationCounts = (data || []).reduce((acc: Record<string, number>, log: any) => {
          if (log.location) {
            acc[log.location] = (acc[log.location] || 0) + 1;
          }
          return acc;
        }, {});

        const sortedPlaces = Object.entries(locationCounts)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count);

        setPlaces(sortedPlaces);
      }
    } catch (err) {
      console.error('Error fetching stats data:', err);
    } finally {
      setLoading(false);
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

  const getTitle = () => {
    switch (type) {
      case 'followers': return 'Followers';
      case 'following': return 'Following';
      case 'posts': return 'Posts';
      case 'places': return 'Places';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-800"></div>
            </div>
          ) : (
            <>
              {(type === 'followers' || type === 'following') && (
                <div className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">
                        {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-4 hover:bg-slate-50 transition"
                      >
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.username?.[0]?.toUpperCase() || <User className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {type === 'posts' && (
                <div className="divide-y divide-slate-100">
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">No posts yet</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex gap-3">
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 mb-1 truncate">
                              {post.title}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.event_date)}
                              </span>
                              {post.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {post.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {type === 'places' && (
                <div className="divide-y divide-slate-100">
                  {places.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">No places yet</p>
                    </div>
                  ) : (
                    places.map((place, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {place.location}
                          </p>
                        </div>
                        <span className="text-sm text-slate-500 font-medium flex-shrink-0 ml-2">
                          {place.count} {place.count === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
