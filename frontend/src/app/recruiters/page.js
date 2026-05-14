'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/recruiters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecruiters(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recruiters:', err);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Recruiters</h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : recruiters.length === 0 ? (
          <div className="text-center text-gray-400 py-12 border border-gray-700 border-dashed rounded-lg">No recruiters found</div>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold uppercase tracking-wider text-xs">Email</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold uppercase tracking-wider text-xs">Company</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold uppercase tracking-wider text-xs">Applications</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recruiters.map((recruiter) => (
                  <tr key={recruiter._id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-white font-medium">{recruiter.name}</td>
                    <td className="px-6 py-4 text-blue-400">{recruiter.email}</td>
                    <td className="px-6 py-4 text-gray-400">{recruiter.company}</td>
                    <td className="px-6 py-4 text-white font-semibold">{recruiter.applicationCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${recruiter.blacklisted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {recruiter.blacklisted ? 'BLACKLISTED' : 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
