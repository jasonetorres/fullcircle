import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, MapPin, Plane, Lock, Globe, Image, X, Camera, Navigation } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { compressImage } from '../lib/imageUtils';
import { checkAndAwardBadges } from '../lib/achievementManager';

interface QuickLogFormProps {
  onLogAdded: () => void;
  userId: string;
  onClose?: () => void;
  emailVerified?: boolean;
}

export default function QuickLogForm({ onLogAdded, userId, onClose, emailVerified = true }: QuickLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    return getLocalDate();
  };

  const getMinDate = () => {
    const now = new Date();
    const year = now.getFullYear() - 100;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    event_date: getLocalDate(),
    description: '',
    location: '',
    trip_name: '',
    is_public: true,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressed);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'DailyLog/1.0',
              },
            }
          );

          if (!response.ok) throw new Error('Failed to fetch location');

          const data = await response.json();

          const address = data.address;
          let locationString = '';

          if (address.road && address.city) {
            locationString = `${address.road}, ${address.city}`;
          } else if (address.city && address.country) {
            locationString = `${address.city}, ${address.country}`;
          } else if (address.town && address.country) {
            locationString = `${address.town}, ${address.country}`;
          } else if (address.village && address.country) {
            locationString = `${address.village}, ${address.country}`;
          } else if (data.display_name) {
            const parts = data.display_name.split(',').slice(0, 3);
            locationString = parts.join(',');
          } else {
            locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }

          setFormData({ ...formData, location: locationString });
        } catch (error) {
          console.error('Error fetching location:', error);
          alert('Failed to get location name. Please enter manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission denied. Please enable location access in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert('Location information unavailable. Please enter location manually.');
        } else if (error.code === error.TIMEOUT) {
          alert('Location request timed out. Please try again.');
        } else {
          alert('Failed to get location. Please enter manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!emailVerified) {
        alert('Please verify your email address before creating posts. Check your inbox for the verification link.');
        setLoading(false);
        return;
      }

      const eventDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const hundredYearsAgo = new Date();
      hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
      hundredYearsAgo.setHours(0, 0, 0, 0);

      if (eventDate > today) {
        alert('Event date cannot be in the future. Please select today or an earlier date.');
        setLoading(false);
        return;
      }

      if (eventDate < hundredYearsAgo) {
        alert('Event date cannot be more than 100 years in the past. Please select a more recent date.');
        setLoading(false);
        return;
      }

      let imageUrl = null;

      if (imageFile) {
        setUploadProgress(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('log-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('log-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        setUploadProgress(false);
      }

      const { error } = await supabase.from('logs').insert({
        ...formData,
        user_id: userId,
        image_url: imageUrl,
      });

      if (error) throw error;

      checkAndAwardBadges(userId);

      onLogAdded();
    } catch (err: any) {
      alert(err.message || 'Failed to add log');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-white dark:bg-dark-panel w-full max-w-md rounded-2xl max-h-[90dvh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-dark-panel border-b border-slate-200 dark:border-dark-border px-4 py-3 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary">New Log</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-dark-text-secondary transition touch-target-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What happened today?"
              required
              autoFocus
              className="w-full px-4 py-3 text-base border-2 border-slate-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-dark-text-secondary mb-1">
                <Calendar className="w-3 h-3" />
                Date
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                max={getMaxDate()}
                min={getMinDate()}
                required
                className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-dark-text-secondary mb-1">
                <MapPin className="w-3 h-3" />
                Location
              </label>
              <div className="flex gap-1">
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                  placeholder="Where?"
                  className="flex-1 px-2.5 py-2 text-sm border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="px-2 py-2 border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Use current location"
                >
                  {locationLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 text-slate-600 dark:text-dark-text-secondary" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-dark-text-secondary mb-1">
              <Plane className="w-3 h-3" />
              Trip Name
            </label>
            <input
              type="text"
              value={formData.trip_name}
              onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
              placeholder="Part of a trip? Name it"
              className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-primary mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell the story..."
              rows={3}
              className="w-full px-3 py-2.5 text-base border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="modal-image-upload"
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
              id="modal-camera-capture"
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                {uploadProgress && (
                  <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <label
                  htmlFor="modal-image-upload"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <Image className="w-4 h-4" />
                  Gallery
                </label>
                <label
                  htmlFor="modal-camera-capture"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text-primary">Visibility:</span>
              <div className="inline-flex bg-slate-100 dark:bg-dark-hover rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: true })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition text-sm font-medium ${
                    formData.is_public
                      ? 'bg-white dark:bg-dark-panel text-emerald-700 shadow-sm'
                      : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:text-dark-text-primary'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: false })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition text-sm font-medium ${
                    !formData.is_public
                      ? 'bg-white dark:bg-dark-panel text-slate-800 dark:text-dark-text-primary shadow-sm'
                      : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:text-dark-text-primary'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.title}
              className="bg-slate-800 dark:bg-orange-500 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Post Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
