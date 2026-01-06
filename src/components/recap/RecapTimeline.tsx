import { TrendingUp } from 'lucide-react';

type RecapTimelineProps = {
  monthBreakdown: Record<string, number>;
  busiestMonth: number;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function RecapTimeline({ monthBreakdown, busiestMonth }: RecapTimelineProps) {
  const maxCount = Math.max(...Object.values(monthBreakdown));

  return (
    <div className="h-full bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8 text-white">
        <div className="text-center mb-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-8 animate-bounce" />
          <h2 className="text-5xl font-bold mb-4">Your Activity</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-2xl mb-2">Busiest Month</p>
            <p className="text-4xl font-bold">{MONTH_NAMES[busiestMonth - 1]}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="space-y-3">
            {MONTH_NAMES.map((month, index) => {
              const count = monthBreakdown[String(index + 1)] || 0;
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{month.slice(0, 3)}</div>
                    <div className="flex-1 bg-white/20 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                        style={{ width: `${percentage}%` }}
                      >
                        {count > 0 && <span className="text-sm font-bold">{count}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
