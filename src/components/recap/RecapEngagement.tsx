import { Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { Log } from '../../lib/supabase';

type RecapEngagementProps = {
  likes: number;
  comments: number;
  topPosts: Log[];
};

export function RecapEngagement({ likes, comments, topPosts }: RecapEngagementProps) {
  return (
    <div className="h-full bg-gradient-to-br from-rose-600 via-red-600 to-orange-600 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8 text-white text-center">
        <TrendingUp className="w-16 h-16 mx-auto mb-8 animate-bounce" />
        <h2 className="text-5xl font-bold mb-12">Your Impact</h2>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-red-400 fill-red-400" />
            <div className="text-6xl font-bold mb-2">{likes}</div>
            <div className="text-xl opacity-90">{likes === 1 ? 'Like' : 'Likes'} Received</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-400 fill-blue-400" />
            <div className="text-6xl font-bold mb-2">{comments}</div>
            <div className="text-xl opacity-90">{comments === 1 ? 'Comment' : 'Comments'} Received</div>
          </div>
        </div>

        {topPosts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">Most Popular Moments</h3>
            <div className="space-y-4">
              {topPosts.slice(0, 3).map((post, index) => (
                <div
                  key={post.id}
                  className="bg-white/10 rounded-xl p-4 text-left flex items-center gap-4 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{post.title}</p>
                    <p className="text-sm opacity-75">{post.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
