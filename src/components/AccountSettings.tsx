import { useState, useRef, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { X, Upload, User, Loader, Mail, CalendarDays } from 'lucide-react';

interface AccountSettingsProps {
  userId: string;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function AccountSettings({
  userId,
  onClose,
  onProfileUpdated,
}: AccountSettingsProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setEmailNotifications(data.email_notifications ?? true);
        setWeeklyRecap(data.weekly_recap_enabled ?? true);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      showMessage('error', 'Failed to load profile');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      showMessage('success', 'Profile picture updated!');
      onProfileUpdated();
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      showMessage('error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          email_notifications: emailNotifications,
          weekly_recap_enabled: weeklyRecap,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      showMessage('success', 'Profile updated successfully!');
      onProfileUpdated();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div
            className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.username?.[0]?.toUpperCase() || <User className="w-12 h-12" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition disabled:opacity-50"
              >
                {uploading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                className="hidden"
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              Click the icon to upload a new profile picture
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={profile?.username || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={50}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your public name (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={200}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Your bio (optional)</span>
              <span>{bio.length}/200</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3 mb-1">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Email Notifications</span>
            </div>
            <div className="flex items-center justify-between mt-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 mr-3">
                <p className="text-sm text-slate-600">
                  Receive email alerts for likes, comments, replies, and new followers
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailNotifications}
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                  emailNotifications ? 'bg-slate-800' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 mr-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Weekly Recap</p>
                </div>
                <p className="text-xs text-slate-500">
                  Receive a weekly summary of your logs, photos, and engagement
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={weeklyRecap}
                onClick={() => setWeeklyRecap(!weeklyRecap)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                  weeklyRecap ? 'bg-slate-800' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    weeklyRecap ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
