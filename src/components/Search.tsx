import { useEffect, useState } from 'react';
import { supabase, Log } from '../lib/supabase';
import { Calendar, MapPin, Plane, Globe, Lock, Search as SearchIcon, Filter } from 'lucide-react';

interface SearchProps {
  userId: string;
}

export default function Search({ userId }: SearchProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const uniqueLocations = Array.from(new Set(logs.map((l) => l.location).filter(Boolean))).sort();

  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        log.title.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        log.location?.toLowerCase().includes(query) ||
        log.trip_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (locationFilter && log.location !== locationFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your logs..."
            className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
          />
        </div>
        {uniqueLocations.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location || ''}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-slate-600 pt-2 border-t border-slate-200">
          <span>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'result' : 'results'}
          </span>
          {(searchQuery || locationFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationFilter('');
              }}
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">No matching logs found</p>
          <p className="text-slate-500 text-xs mt-1">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
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
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(log.event_date)}</span>
                    </div>
                    {log.is_public ? (
                      <Globe className="w-3 h-3 text-green-600" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{log.title}</h3>
                  {log.description && (
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">{log.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {log.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{log.location}</span>
                      </div>
                    )}
                    {log.trip_name && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
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
  );
}
