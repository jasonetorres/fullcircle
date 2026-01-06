import { Camera } from 'lucide-react';
import { Log } from '../../lib/supabase';

type RecapPhotosProps = {
  photos: Log[];
  totalPhotos: number;
};

export function RecapPhotos({ photos, totalPhotos }: RecapPhotosProps) {
  return (
    <div className="h-full bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-600 flex items-center justify-center overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 text-white text-center">
        <Camera className="w-16 h-16 mx-auto mb-8 animate-bounce" />
        <h2 className="text-5xl font-bold mb-4">Captured Moments</h2>
        <p className="text-2xl mb-12 opacity-90">{totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'} to remember</p>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden bg-white/10 animate-zoom-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={photo.image_url || ''}
                  alt={photo.title}
                  className="w-full h-full object-cover hover:scale-110 transition duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
