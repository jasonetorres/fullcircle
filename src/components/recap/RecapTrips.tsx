import { Plane } from 'lucide-react';

type RecapTripsProps = {
  trips: string[];
};

export function RecapTrips({ trips }: RecapTripsProps) {
  return (
    <div className="h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8 text-white text-center">
        <Plane className="w-16 h-16 mx-auto mb-8 animate-bounce" />
        <h2 className="text-5xl font-bold mb-12">Your Adventures</h2>

        {trips.length > 0 ? (
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-2xl font-semibold animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {trip}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <p className="text-2xl opacity-90">
              You explored freely without naming your trips.
              <br />
              Every journey was its own adventure!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
