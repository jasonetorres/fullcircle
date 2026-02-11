import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { X, Upload, User, Loader, Mail, CalendarDays, Key, Copy, Trash2, Plus, Eye, EyeOff, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

interface AccountSettingsProps {
  userId: string;
  onClose: () => void;
  onProfileUpdated: () => void;
}

interface BotApiKey {
  id: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
  is_active: boolean;
}

export default function AccountSettings({
  userId,
  onClose,
  onProfileUpdated,
}: AccountSettingsProps) {
  const { theme, setTheme } = useTheme();
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
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [apiKeys, setApiKeys] = useState<BotApiKey[]>([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [showDocsFor, setShowDocsFor] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchApiKeys();
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

  const showMessage = useCallback((type: 'success' | 'error', text: string, autoClose = false) => {
    setMessage({ type, text });
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (autoClose && type === 'success') {
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } else {
      setTimeout(() => setMessage(null), 3000);
    }
  }, [onClose]);

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

      showMessage('success', 'Profile updated successfully!', true);
      onProfileUpdated();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_api_keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'fc_';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showMessage('error', 'Please enter a name for your API key');
      return;
    }

    setCreatingKey(true);
    try {
      const apiKey = generateApiKey();
      const keyPrefix = apiKey.substring(0, 10);

      const { error } = await supabase.rpc('create_bot_api_key', {
        p_user_id: userId,
        p_api_key: apiKey,
        p_key_prefix: keyPrefix,
        p_name: newKeyName.trim(),
      });

      if (error) throw error;

      setGeneratedKey(apiKey);
      setNewKeyName('');
      setShowNewKeyForm(false);
      await fetchApiKeys();
      showMessage('success', 'API key created! Copy it now, it will not be shown again.');
    } catch (err: any) {
      console.error('Error creating API key:', err);
      showMessage('error', 'Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bot_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      await fetchApiKeys();
      showMessage('success', 'API key deleted successfully');
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      showMessage('error', 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('success', 'Copied to clipboard!');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-dark-panel rounded-xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-dark-panel border-b border-slate-200 dark:border-dark-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-dark-text-secondary hover:text-slate-600 dark:hover:text-dark-text-primary transition touch-target-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {message && (
          <div
            className={`sticky top-[73px] z-10 mx-4 mt-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
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
            <p className="text-xs text-slate-500 dark:text-dark-text-muted text-center">
              Click the icon to upload a new profile picture
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-primary mb-1">
              Username
            </label>
            <input
              type="text"
              value={profile?.username || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-hover text-slate-500 dark:text-dark-text-muted cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1">Username cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-primary mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={50}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1">
              Your public name (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-primary mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={200}
              className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:border-transparent outline-none transition resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-dark-text-muted mt-1">
              <span>Your bio (optional)</span>
              <span>{bio.length}/200</span>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-dark-border pt-6">
            <div className="flex items-center gap-3 mb-1">
              <Mail className="w-4 h-4 text-slate-500 dark:text-dark-text-secondary" />
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text-primary">Email Notifications</span>
            </div>
            <div className="flex items-center justify-between mt-3 p-3 bg-slate-50 dark:bg-dark-hover rounded-lg">
              <div className="flex-1 mr-3">
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  Receive email alerts for likes, comments, replies, and new followers
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailNotifications}
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:ring-offset-2 dark:focus:ring-offset-dark-panel ${
                  emailNotifications ? 'bg-slate-800 dark:bg-slate-700' : 'bg-slate-300 dark:bg-dark-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 p-3 bg-slate-50 dark:bg-dark-hover rounded-lg">
              <div className="flex-1 mr-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500 dark:text-dark-text-secondary" />
                  <p className="text-sm font-medium text-slate-700 dark:text-dark-text-primary">Weekly Recap</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                  Receive a weekly summary of your logs, photos, and engagement
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={weeklyRecap}
                onClick={() => setWeeklyRecap(!weeklyRecap)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:ring-offset-2 dark:focus:ring-offset-dark-panel ${
                  weeklyRecap ? 'bg-slate-800 dark:bg-slate-700' : 'bg-slate-300 dark:bg-dark-border'
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

          <div className="border-t border-slate-200 dark:border-dark-border pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-4 h-4 text-slate-500 dark:text-dark-text-secondary" />
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text-primary">Theme</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                  theme === 'light'
                    ? 'border-slate-800 dark:border-slate-700 bg-slate-50 dark:bg-dark-hover'
                    : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
                }`}
              >
                <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-slate-800 dark:text-slate-400' : 'text-slate-500 dark:text-dark-text-secondary'}`} />
                <span className={`text-xs font-medium ${theme === 'light' ? 'text-slate-800 dark:text-slate-400' : 'text-slate-600 dark:text-dark-text-secondary'}`}>
                  Light
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                  theme === 'dark'
                    ? 'border-slate-800 dark:border-slate-700 bg-slate-50 dark:bg-dark-hover'
                    : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
                }`}
              >
                <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-800 dark:text-slate-400' : 'text-slate-500 dark:text-dark-text-secondary'}`} />
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-800 dark:text-slate-400' : 'text-slate-600 dark:text-dark-text-secondary'}`}>
                  Dark
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                  theme === 'system'
                    ? 'border-slate-800 dark:border-slate-700 bg-slate-50 dark:bg-dark-hover'
                    : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
                }`}
              >
                <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-slate-800 dark:text-slate-400' : 'text-slate-500 dark:text-dark-text-secondary'}`} />
                <span className={`text-xs font-medium ${theme === 'system' ? 'text-slate-800 dark:text-slate-400' : 'text-slate-600 dark:text-dark-text-secondary'}`}>
                  System
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-2">
              Choose your preferred theme or let it match your system settings
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-dark-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-slate-500 dark:text-dark-text-secondary" />
                <span className="text-sm font-medium text-slate-700 dark:text-dark-text-primary">Bot API Keys</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsFor(showDocsFor ? null : 'docs')}
                className="text-xs text-slate-500 dark:text-dark-text-secondary hover:text-slate-700 dark:hover:text-dark-text-primary underline"
              >
                {showDocsFor === 'docs' ? 'Hide' : 'View'} Docs
              </button>
            </div>

            {showDocsFor === 'docs' && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-dark-hover rounded-lg text-xs space-y-2">
                <p className="font-medium text-slate-700 dark:text-dark-text-primary">API Documentation</p>
                <p className="text-slate-600 dark:text-dark-text-secondary">Create logs programmatically using the Bot API.</p>
                <div className="mt-3">
                  <p className="font-medium text-slate-700 dark:text-dark-text-primary mb-1">Endpoint:</p>
                  <code className="block bg-white dark:bg-dark-bg p-2 rounded border border-slate-200 dark:border-dark-border text-slate-800 dark:text-dark-text-primary break-all">
                    {import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-api
                  </code>
                </div>
                <div className="mt-3">
                  <p className="font-medium text-slate-700 dark:text-dark-text-primary mb-1">Example Request:</p>
                  <pre className="bg-white dark:bg-dark-bg p-2 rounded border border-slate-200 dark:border-dark-border text-slate-800 dark:text-dark-text-primary overflow-x-auto text-xs">
{`curl -X POST \\
  ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-api \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Log Title",
    "event_date": "2024-01-15",
    "description": "Optional description",
    "location": "Optional location",
    "is_public": false
  }'`}
                  </pre>
                </div>
              </div>
            )}

            {generatedKey && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                  Your new API key (copy it now, it won't be shown again):
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedKey}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-dark-bg border border-green-300 dark:border-green-800 rounded text-sm font-mono text-slate-800 dark:text-dark-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedKey)}
                    className="px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedKey(null)}
                  className="mt-2 text-xs text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline"
                >
                  I've copied it, dismiss
                </button>
              </div>
            )}

            {!showNewKeyForm && (
              <button
                type="button"
                onClick={() => setShowNewKeyForm(true)}
                className="w-full p-3 border-2 border-dashed border-slate-300 dark:border-dark-border rounded-lg text-slate-600 dark:text-dark-text-secondary hover:border-slate-400 dark:hover:border-dark-hover hover:text-slate-700 dark:hover:text-dark-text-primary transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New API Key
              </button>
            )}

            {showNewKeyForm && (
              <div className="p-4 bg-slate-50 dark:bg-dark-hover rounded-lg space-y-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Bot, Automation Script"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text-primary placeholder-slate-400 dark:placeholder-dark-text-muted focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-700 focus:border-transparent outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewKeyForm(false);
                      setNewKeyName('');
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createApiKey}
                    disabled={creatingKey || !newKeyName.trim()}
                    className="flex-1 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {creatingKey ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Key'
                    )}
                  </button>
                </div>
              </div>
            )}

            {apiKeys.length > 0 && (
              <div className="mt-4 space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-3 bg-white dark:bg-dark-hover border border-slate-200 dark:border-dark-border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-dark-text-primary truncate">
                          {key.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted font-mono mt-1">
                          {key.key_prefix}...
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-slate-500 dark:text-dark-text-muted">
                          <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.last_used_at && (
                            <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                          )}
                          <span>{key.usage_count} uses</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteApiKey(key.id)}
                        className="ml-2 p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        title="Delete API key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text-primary rounded-lg hover:bg-slate-50 dark:hover:bg-dark-hover transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
