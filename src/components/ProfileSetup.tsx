import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

interface ProfileSetupProps {
  userId: string;
  onComplete: () => void;
}

export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        username: username.toLowerCase().trim(),
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      });

      if (profileError) {
        if (profileError.code === '23505') {
          setError('Username already taken. Please choose another.');
        } else {
          throw profileError;
        }
        return;
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-3">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create Your Profile</h2>
          <p className="text-sm text-slate-600 mt-1">
            Set up your profile to start sharing with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              required
              minLength={3}
              maxLength={20}
              placeholder="johndoe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-slate-500 mt-1">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{bio.length}/200</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username}
            className="w-full py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
