import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

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

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resumes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResumes(response.data.data);
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resumes/upload`, formData, {
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Resumes</h1>
          <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Upload Resume
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center text-gray-400">No resumes uploaded yet</div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold">{resume.title}</h3>
                  <p className="text-gray-400 text-sm">{(resume.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                {resume.isPrimary && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm">Primary</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
