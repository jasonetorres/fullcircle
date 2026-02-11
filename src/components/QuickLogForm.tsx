import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, MapPin, Plane, Lock, Globe, Image, X, Camera } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { compressImage } from '../lib/imageUtils';
import { checkAndAwardBadges } from '../lib/achievementManager';

interface QuickLogFormProps {
  onLogAdded: () => void;
  userId: string;
  onClose?: () => void;
}

export default function QuickLogForm({ onLogAdded, userId, onClose }: QuickLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        className="bg-white w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800">New Log</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition touch-target-sm"
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
              className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                <Calendar className="w-3 h-3" />
                Date
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                <MapPin className="w-3 h-3" />
                Location
              </label>
              <LocationAutocomplete
                value={formData.location}
                onChange={(value) => setFormData({ ...formData, location: value })}
                placeholder="Where?"
                className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
              <Plane className="w-3 h-3" />
              Trip Name
            </label>
            <input
              type="text"
              value={formData.trip_name}
              onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
              placeholder="Part of a trip? Name it"
              className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell the story..."
              rows={3}
              className="w-full px-3 py-2.5 text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition resize-none"
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <Image className="w-4 h-4" />
                  Gallery
                </label>
                <label
                  htmlFor="modal-camera-capture"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Visibility:</span>
              <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: true })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition text-sm font-medium ${
                    formData.is_public
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
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
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
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
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold active:scale-95"
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
