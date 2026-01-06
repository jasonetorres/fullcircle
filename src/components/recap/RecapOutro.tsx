import { Sparkles } from 'lucide-react';
import { YearRecapStats } from '../../lib/recapService';

type RecapOutroProps = {
  year: number;
  stats: YearRecapStats;
};

export function RecapOutro({ year, stats }: RecapOutroProps) {
  return (
    <div className="h-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-8 text-white text-center">
        <Sparkles className="w-20 h-20 mx-auto mb-8 animate-bounce text-yellow-300" />
        <h2 className="text-6xl font-bold mb-8">That Was {year}!</h2>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 mb-8">
          <p className="text-2xl leading-relaxed mb-6">
            You captured <span className="font-bold text-yellow-300">{stats.total_logs}</span> memories,
            explored <span className="font-bold text-yellow-300">{stats.unique_locations}</span> places,
            and shared <span className="font-bold text-yellow-300">{stats.total_photos}</span> moments worth remembering.
          </p>
          <p className="text-xl opacity-90">
            Every journey starts with a single step,
            <br />
            and you took plenty this year.
          </p>
        </div>

        <div className="text-3xl font-bold animate-pulse">
          Here's to more adventures in {year + 1}! 🎉
        </div>
      </div>
    </div>
  );
}
