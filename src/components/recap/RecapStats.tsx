import { YearRecapStats } from '../../lib/recapService';
import { Calendar, MapPin, Camera, Map } from 'lucide-react';

type RecapStatsProps = {
  stats: YearRecapStats;
  year: number;
};

export function RecapStats({ stats }: RecapStatsProps) {
  const statCards = [
    {
      icon: Calendar,
      value: stats.total_logs,
      label: stats.total_logs === 1 ? 'Memory Captured' : 'Memories Captured',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MapPin,
      value: stats.unique_locations,
      label: stats.unique_locations === 1 ? 'Place Visited' : 'Places Visited',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Camera,
      value: stats.total_photos,
      label: stats.total_photos === 1 ? 'Photo Shared' : 'Photos Shared',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Map,
      value: stats.unique_trips,
      label: stats.unique_trips === 1 ? 'Trip Taken' : 'Trips Taken',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8">
        <h2 className="text-5xl font-bold text-white text-center mb-16">By the Numbers</h2>
        <div className="grid grid-cols-2 gap-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center transform hover:scale-105 transition animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-6xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-xl text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
