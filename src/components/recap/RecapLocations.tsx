import { MapPin, Star } from 'lucide-react';

type RecapLocationsProps = {
  locations: string[];
  topLocation: string;
  topLocationCount: number;
};

export function RecapLocations({ locations, topLocation, topLocationCount }: RecapLocationsProps) {
  return (
    <div className="h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8 text-white text-center">
        <MapPin className="w-16 h-16 mx-auto mb-8 animate-bounce" />
        <h2 className="text-5xl font-bold mb-8">Places You've Been</h2>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            <h3 className="text-3xl font-bold">Favorite Spot</h3>
          </div>
          <p className="text-5xl font-bold mb-2">{topLocation}</p>
          <p className="text-xl opacity-90">Visited {topLocationCount} {topLocationCount === 1 ? 'time' : 'times'}</p>
        </div>

        {locations.length > 1 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">All Your Destinations</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {locations.slice(0, 12).map((location, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {location}
                </span>
              ))}
              {locations.length > 12 && (
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                  +{locations.length - 12} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
