import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

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

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recruiters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecruiters(response.data.data);
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
          <div className="text-center text-gray-400">Loading...</div>
        ) : recruiters.length === 0 ? (
          <div className="text-center text-gray-400">No recruiters found</div>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left text-gray-300">Company</th>
                  <th className="px-6 py-3 text-left text-gray-300">Applications</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((recruiter) => (
                  <tr key={recruiter._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-3 text-white">{recruiter.name}</td>
                    <td className="px-6 py-3 text-white">{recruiter.email}</td>
                    <td className="px-6 py-3 text-gray-400">{recruiter.company}</td>
                    <td className="px-6 py-3 text-white">{recruiter.applicationCount}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${recruiter.blacklisted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {recruiter.blacklisted ? 'Blacklisted' : 'Active'}
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
