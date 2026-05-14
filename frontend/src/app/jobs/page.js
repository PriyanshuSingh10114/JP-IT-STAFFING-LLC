'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const fetchJobs = async (page) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/jobs?page=${page}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Jobs Found</h1>

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-400">No jobs found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition">
                <h3 className="text-lg font-bold text-white">{job.title}</h3>
                <p className="text-blue-400 font-semibold">{job.company}</p>
                <p className="text-gray-400 text-sm mt-2">{job.description?.substring(0, 100)}...</p>
                <div className="flex gap-2 mt-4">
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">{job.jobType}</span>
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
