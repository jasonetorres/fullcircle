import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, MapPin, Plane, Lock, Globe, Image, X } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';

interface QuickLogFormProps {
  onLogAdded: () => void;
  userId: string;
}

export default function QuickLogForm({ onLogAdded, userId }: QuickLogFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    is_public: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('log-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('log-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('logs').insert({
        ...formData,
        user_id: userId,
        image_url: imageUrl,
      });

      if (error) throw error;

      setFormData({
        title: '',
        event_date: getLocalDate(),
        description: '',
        location: '',
        trip_name: '',
        is_public: false,
      });
      setImageFile(null);
      setImagePreview(null);
      setIsExpanded(false);
      onLogAdded();
    } catch (err: any) {
      alert(err.message || 'Failed to add log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onFocus={() => setIsExpanded(true)}
              placeholder="What happened today?"
              required
              className="w-full px-3 py-2 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Log</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                  <Calendar className="w-3 h-3" />
                  Event Date
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                  placeholder="Where were you?"
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                <Plane className="w-3 h-3" />
                Trip Name
              </label>
              <input
                type="text"
                value={formData.trip_name}
                onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                placeholder="Part of a trip? Name it"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell the story..."
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                <Image className="w-3 h-3" />
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <Image className="w-3 h-3" />
                Choose Image
              </label>
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, is_public: !formData.is_public })
                }
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition text-xs font-medium ${
                  formData.is_public
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {formData.is_public ? (
                  <>
                    <Globe className="w-3 h-3" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    Private
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-slate-600 hover:text-slate-800 text-xs transition py-1.5 px-2"
              >
                Collapse
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
