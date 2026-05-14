'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/resumes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResumes(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('title', file.name);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/resumes/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchResumes();
    } catch (err) {
      console.error('Error uploading resume:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Resumes</h1>
            <p className="text-gray-400 mt-1">Manage your resumes for job applications</p>
          </div>
          <label className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg cursor-pointer transition shadow-lg flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? (
              <>
                <span className="animate-spin text-lg">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <span className="text-lg">📤</span>
                Upload Resume
              </>
            )}
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileUpload} 
              className="hidden" 
              disabled={uploading} 
            />
          </label>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center text-gray-400 py-20 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
            <div className="text-5xl mb-4 text-gray-600">📄</div>
            <p className="text-xl font-semibold text-gray-500">No resumes uploaded yet</p>
            <p className="text-gray-600 mt-2">Upload your first resume to start applying</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-between hover:border-blue-500/50 transition shadow-lg group">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-600/20 p-3 rounded-lg group-hover:bg-blue-600/30 transition">
                    <span className="text-2xl text-blue-400">📄</span>
                  </div>
                  {resume.isPrimary && (
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                      PRIMARY
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1 truncate" title={resume.title}>
                    {resume.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {resume.fileSize ? (resume.fileSize / 1024).toFixed(2) : '0'} KB • PDF
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-700/50 flex gap-4">
                  <button className="text-gray-300 hover:text-white text-sm font-medium transition">View</button>
                  <button className="text-gray-300 hover:text-white text-sm font-medium transition">Download</button>
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium transition ml-auto">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
