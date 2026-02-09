import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, UserPlus, X } from 'lucide-react';

interface ToastData {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow';
  actorName: string;
  logTitle: string | null;
  logId: string | null;
}

interface NotificationToastProps {
  userId: string;
  onNotificationClick: (logId: string) => void;
}

export default function NotificationToast({ userId, onNotificationClick }: NotificationToastProps) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((data: ToastData) => {
    setToast(data);
    setVisible(true);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`toast:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const notification = payload.new as any;

          const { data: actor } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', notification.actor_id)
            .maybeSingle();

          let logTitle = null;
          if (notification.log_id) {
            const { data: log } = await supabase
              .from('logs')
              .select('title')
              .eq('id', notification.log_id)
              .maybeSingle();
            logTitle = log?.title || null;
          }

          showToast({
            id: notification.id,
            type: notification.type,
            actorName: actor?.display_name || actor?.username || 'Someone',
            logTitle,
            logId: notification.log_id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
      case 'reply': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getMessage = () => {
    switch (toast.type) {
      case 'like': return `${toast.actorName} liked "${toast.logTitle || 'your post'}"`;
      case 'comment': return `${toast.actorName} commented on "${toast.logTitle || 'your post'}"`;
      case 'reply': return `${toast.actorName} replied to your comment`;
      case 'follow': return `${toast.actorName} started following you`;
    }
  };

  const handleClick = () => {
    if (toast.logId) {
      onNotificationClick(toast.logId);
    }
    setVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  return (
    <div
      className={`fixed top-16 left-4 right-4 z-[60] max-w-lg mx-auto transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div
        onClick={handleClick}
        className="bg-white rounded-xl shadow-lg shadow-black/10 border border-slate-200 p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        <p className="text-sm text-slate-700 flex-1 line-clamp-2">{getMessage()}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
            setTimeout(() => setToast(null), 300);
          }}
          className="p-1 text-slate-300 hover:text-slate-500 transition flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
