'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';

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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/settings`, {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.put(`${apiUrl}/settings`, settings, {
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
        <div className="text-center text-gray-400 py-20">Loading settings...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Configure your automation and account preferences</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.includes('Error') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            <span>{message.includes('Error') ? '❌' : '✅'}</span>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Automation Settings */}
          <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-blue-400">🤖</span> Automation Settings
            </h2>
            <div className="space-y-6">
              <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition border border-transparent hover:border-gray-600">
                <div>
                  <p className="text-white font-medium">Enable Automation</p>
                  <p className="text-gray-400 text-sm">Automatically run background jobs</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.automation?.enabled || false}
                  onChange={(e) => handleChange('automation', 'enabled', e.target.checked)}
                  className="w-6 h-6 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 block mb-2 font-medium">Max Jobs Per Run</label>
                  <input
                    type="number"
                    value={settings?.automation?.maxJobsPerRun || 20}
                    onChange={(e) => handleChange('automation', 'maxJobsPerRun', parseInt(e.target.value))}
                    className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-2 font-medium">Headless Mode</label>
                  <select
                    value={settings?.automation?.headlessBrowser?.toString() || 'true'}
                    onChange={(e) => handleChange('automation', 'headlessBrowser', e.target.value === 'true')}
                    className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="true">Headless (No Browser Window)</option>
                    <option value="false">Interactive (Visible Window)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* LinkedIn Settings */}
          <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-blue-400">🔗</span> LinkedIn Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-gray-300 block mb-2 font-medium">Search Keywords</label>
                <input
                  type="text"
                  value={settings?.linkedin?.searchKeywords?.join(', ') || ''}
                  onChange={(e) => handleChange('linkedin', 'searchKeywords', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="Java Developer, Backend Engineer..."
                  className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-2 font-medium">Posted Time Filter</label>
                <select
                  value={settings?.linkedin?.postedTimeFilter || 'last_24_hours'}
                  onChange={(e) => handleChange('linkedin', 'postedTimeFilter', e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="last_24_hours">Last 24 Hours</option>
                  <option value="last_week">Last Week</option>
                  <option value="last_month">Last Month</option>
                </select>
              </div>
            </div>
          </section>

          {/* AI & Email Settings */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">📧</span> Email Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.email?.attachResume || true}
                    onChange={(e) => handleChange('email', 'attachResume', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600"
                  />
                  <span className="text-gray-300">Attach Resume</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.email?.enableTracking || true}
                    onChange={(e) => handleChange('email', 'enableTracking', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600"
                  />
                  <span className="text-gray-300">Enable Email Tracking</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">✨</span> AI Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.ai?.enablePersonalization || true}
                    onChange={(e) => handleChange('ai', 'enablePersonalization', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600"
                  />
                  <span className="text-gray-300">AI Personalization</span>
                </label>
                <div>
                  <select
                    value={settings?.ai?.emailTone || 'professional'}
                    onChange={(e) => handleChange('ai', 'emailTone', e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="professional">Professional Tone</option>
                    <option value="casual">Casual Tone</option>
                    <option value="formal">Formal Tone</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-xl transition shadow-xl transform active:scale-95 disabled:opacity-50 ${saving ? 'cursor-not-allowed' : ''}`}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
