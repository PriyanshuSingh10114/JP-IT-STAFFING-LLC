import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSettings(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings`, settings, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center text-gray-400">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>

        {message && <div className="bg-green-600 text-white p-4 rounded">{message}</div>}

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
          {/* Automation Settings */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Automation Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings?.automation?.enabled || false}
                  onChange={(e) => handleChange('automation', 'enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Enable Automation</span>
              </label>

              <div>
                <label className="text-gray-300 block mb-2">Max Jobs Per Run</label>
                <input
                  type="number"
                  value={settings?.automation?.maxJobsPerRun || 20}
                  onChange={(e) => handleChange('automation', 'maxJobsPerRun', parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings?.automation?.headlessBrowser || true}
                  onChange={(e) => handleChange('automation', 'headlessBrowser', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Headless Browser Mode</span>
              </label>
            </div>
          </div>

          {/* LinkedIn Settings */}
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">LinkedIn Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 block mb-2">Search Keywords</label>
                <input
                  type="text"
                  value={settings?.linkedin?.searchKeywords?.join(', ') || ''}
                  placeholder="Java Developer, Backend Engineer..."
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-2">Posted Time Filter</label>
                <select
                  value={settings?.linkedin?.postedTimeFilter || 'last_24_hours'}
                  onChange={(e) => handleChange('linkedin', 'postedTimeFilter', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                >
                  <option value="last_24_hours">Last 24 Hours</option>
                  <option value="last_week">Last Week</option>
                  <option value="last_month">Last Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Email Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings?.email?.attachResume || true}
                  onChange={(e) => handleChange('email', 'attachResume', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Attach Resume</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings?.email?.enableTracking || true}
                  onChange={(e) => handleChange('email', 'enableTracking', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Enable Email Tracking</span>
              </label>
            </div>
          </div>

          {/* AI Settings */}
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">AI Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings?.ai?.enablePersonalization || true}
                  onChange={(e) => handleChange('ai', 'enablePersonalization', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Enable Email Personalization</span>
              </label>

              <div>
                <label className="text-gray-300 block mb-2">Email Tone</label>
                <select
                  value={settings?.ai?.emailTone || 'professional'}
                  onChange={(e) => handleChange('ai', 'emailTone', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
