import { useEffect, useState } from 'react';
import { supabase, Log } from '../lib/supabase';
import { Calendar, MapPin, X } from 'lucide-react';

interface MemoriesProps {
  userId: string;
}

export default function Memories({ userId }: MemoriesProps) {
  const [memories, setMemories] = useState<(Log & { yearsAgo: number })[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [userId]);

  const fetchMemories = async () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentYear = now.getFullYear();

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .like('event_date', `%-${month}-${day}`)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) return;

    const pastMemories = data
      .filter((log) => {
        const logYear = parseInt(log.event_date.split('-')[0]);
        return logYear < currentYear;
      })
      .map((log) => ({
        ...log,
        yearsAgo: currentYear - parseInt(log.event_date.split('-')[0]),
      }));

    setMemories(pastMemories);
  };

  if (dismissed || memories.length === 0) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">On This Day</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-400 hover:text-amber-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 pb-3 flex gap-3 overflow-x-auto scrollbar-hide">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="flex-shrink-0 w-44 bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {memory.image_url ? (
              <img
                src={memory.image_url}
                alt={memory.title}
                className="w-full h-24 object-cover"
              />
            ) : (
              <div className="w-full h-24 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-amber-300" />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs font-bold text-amber-700 mb-0.5">
                {memory.yearsAgo} {memory.yearsAgo === 1 ? 'year' : 'years'} ago
              </p>
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{memory.title}</p>
              {memory.location && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  <span className="text-[10px] text-slate-500 truncate">{memory.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
