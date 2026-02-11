import { useEffect, useState } from 'react';
import { supabase, Log } from '../lib/supabase';
import { Calendar, MapPin, Plane, Globe, Lock, Trash2, ChevronDown, ChevronUp, X, Image, Camera } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { compressImage } from '../lib/imageUtils';
import Tooltip from './Tooltip';

interface TimelineProps {
  userId: string;
  refreshTrigger: number;
}

export default function Timeline({ userId, refreshTrigger }: TimelineProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    event_date: '',
    description: '',
    location: '',
    trip_name: '',
    is_public: false,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [userId, refreshTrigger]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm('Delete this log entry?')) return;

    try {
      const { error } = await supabase.from('logs').delete().eq('id', id);
      if (error) throw error;
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete log');
    }
  };


  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 dark:border-dark-border border-t-slate-800 dark:border-t-orange-500"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-slate-300 dark:text-dark-border mx-auto mb-2" />
        <p className="text-slate-600 dark:text-dark-text-secondary text-sm">No entries yet</p>
        <p className="text-slate-500 dark:text-dark-text-muted text-xs mt-1">
          Start logging your life's moments above
        </p>
      </div>
    );
  }

  const groupLogsByMonth = (logs: Log[]) => {
    const grouped: { [key: string]: Log[] } = {};
    logs.forEach((log) => {
      const [year, month, day] = log.event_date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthYear = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(log);
    });
    return grouped;
  };

  const groupedLogs = groupLogsByMonth(logs);

  const toggleMonth = (monthYear: string) => {
    setCollapsedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthYear)) {
        newSet.delete(monthYear);
      } else {
        newSet.add(monthYear);
      }
      return newSet;
    });
  };

  const openEditModal = (log: Log) => {
    setEditingLog(log);
    setEditForm({
      title: log.title,
      event_date: log.event_date,
      description: log.description || '',
      location: log.location || '',
      trip_name: log.trip_name || '',
      is_public: log.is_public,
      image_url: log.image_url || '',
    });
    setImagePreview(log.image_url);
  };

  const closeEditModal = () => {
    setEditingLog(null);
    setImageFile(null);
    setImagePreview(null);
  };

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
    setEditForm({ ...editForm, image_url: '' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      let imageUrl = editForm.image_url;

      if (imageFile) {
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
      }

      const { error } = await supabase
        .from('logs')
        .update({
          title: editForm.title,
          event_date: editForm.event_date,
          description: editForm.description || null,
          location: editForm.location || null,
          trip_name: editForm.trip_name || null,
          is_public: editForm.is_public,
          image_url: imageUrl || null,
        })
        .eq('id', editingLog.id);

      if (error) throw error;

      closeEditModal();
      fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to update log');
    }
  };


  return (
    <>
      <div className="space-y-4">
        {Object.entries(groupedLogs).map(([monthYear, groupLogs]) => (
          <div key={monthYear}>
            <div className="sticky top-0 bg-slate-50 dark:bg-dark-bg z-10 py-2 mb-3">
              <button
                onClick={() => toggleMonth(monthYear)}
                className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-dark-text-primary hover:text-slate-600 dark:hover:text-dark-text-secondary transition"
              >
                <span>{monthYear}</span>
                {collapsedMonths.has(monthYear) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-normal">({groupLogs.length})</span>
              </button>
            </div>

            {!collapsedMonths.has(monthYear) && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-dark-border"></div>

              <div className="space-y-3">
                {groupLogs.map((log) => (
                <div key={log.id} className="relative pl-11">
                  <div className="absolute left-0 w-8 h-8 bg-slate-800 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs">
                    {formatDate(log.event_date).split(' ')[1]}
                  </div>

                  <div
                    onClick={() => openEditModal(log)}
                    className="bg-white dark:bg-dark-panel rounded-lg shadow-md dark:shadow-dark-border/50 border dark:border-dark-border hover:shadow-lg transition p-3 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-muted mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(log.event_date)}</span>
                          {log.is_public ? (
                            <Tooltip text="Public" position="top">
                              <Globe className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </Tooltip>
                          ) : (
                            <Tooltip text="Private" position="top">
                              <Lock className="w-3 h-3 text-slate-400 dark:text-dark-text-muted" />
                            </Tooltip>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary leading-tight">
                          {log.title}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLog(log.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition text-slate-400 dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {log.image_url && (
                      <img
                        src={log.image_url}
                        alt={log.title}
                        className="w-full h-32 object-cover rounded-lg mb-2 border dark:border-dark-border"
                      />
                    )}

                    {log.description && (
                      <p className="text-slate-600 dark:text-dark-text-secondary mb-2 leading-relaxed text-xs">
                        {log.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {log.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-hover px-2 py-1 rounded-full">
                          <MapPin className="w-3 h-3" />
                          <span>{log.location}</span>
                        </div>
                      )}
                      {log.trip_name && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-dark-text-secondary bg-slate-50 dark:bg-dark-hover px-2 py-1 rounded-full">
                          <Plane className="w-3 h-3" />
                          <span>{log.trip_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
          </div>
        ))}
      </div>

      {editingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-panel rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border dark:border-dark-border">
            <div className="sticky top-0 bg-white dark:bg-dark-panel border-b border-slate-200 dark:border-dark-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary">Edit Log</h2>
              <button onClick={closeEditModal} className="text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-dark-text-primary mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-dark-text-primary mb-1">Date *</label>
                <input
                  type="date"
                  value={editForm.event_date}
                  onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-dark-text-primary mb-1">Location</label>
                <LocationAutocomplete
                  value={editForm.location}
                  onChange={(value) => setEditForm({ ...editForm, location: value })}
                  placeholder="Where were you?"
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-dark-text-primary mb-1">Trip Name</label>
                <input
                  type="text"
                  value={editForm.trip_name}
                  onChange={(e) => setEditForm({ ...editForm, trip_name: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-dark-text-primary mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="edit-image-upload"
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                  id="edit-camera-capture"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label
                      htmlFor="edit-image-upload"
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Image className="w-3.5 h-3.5" />
                      Gallery
                    </label>
                    <label
                      htmlFor="edit-camera-capture"
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Camera
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_public: !editForm.is_public })}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                    editForm.is_public
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {editForm.is_public ? (
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
                  type="submit"
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
