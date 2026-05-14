'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';

export default function CreateJob() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    jobType: 'Fulltime',
    experienceLevel: 'Mid Level',
    requiredSkills: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()),
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/jobs`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating job');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Create New Job</h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center gap-3">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className="block text-gray-300 font-semibold mb-2">Job Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none"
                placeholder="e.g., Senior Java Developer"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-gray-300 font-semibold mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none"
                placeholder="e.g., Google"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none"
              placeholder="e.g., Remote, New York, NY"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Job Type</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option>Fulltime</option>
                <option>Parttime</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2">Experience Level</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option>Entry Level</option>
                <option>Mid Level</option>
                <option>Senior</option>
                <option>Lead</option>
                <option>Manager</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 outline-none resize-none"
              placeholder="Provide a detailed job description..."
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">Required Skills (comma-separated)</label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="e.g., Java, Spring Boot, Docker"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl disabled:opacity-50 shadow-lg transform active:scale-[0.98] transition"
            >
              {loading ? 'Creating...' : 'Create Job Posting'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3.5 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
