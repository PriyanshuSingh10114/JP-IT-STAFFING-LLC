import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function RecruiterDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationsSent, setApplicationsSent] = useState(0);

  useEffect(() => {
    if (id) {
      fetchRecruiterDetail();
    }
  }, [id]);

  const fetchRecruiterDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recruiters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecruiter(response.data.data);
      setApplicationsSent(response.data.data.applicationCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recruiter:', error);
      setLoading(false);
    }
  };

  const handleBlacklist = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recruiters/${id}/blacklist`,
        { reason: 'User blacklisted this recruiter' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRecruiterDetail();
    } catch (error) {
      console.error('Error blacklisting:', error);
    }
  };

  if (loading) return <Layout><div className="text-center text-gray-400">Loading...</div></Layout>;
  if (!recruiter) return <Layout><div className="text-center text-gray-400">Recruiter not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">{recruiter.name}</h1>
              <p className="text-blue-400 text-lg mt-2">{recruiter.company}</p>
              <a
                href={`mailto:${recruiter.email}`}
                className="text-gray-400 hover:text-white mt-2 inline-block"
              >
                {recruiter.email}
              </a>
            </div>
            <button
              onClick={handleBlacklist}
              className={`px-4 py-2 rounded font-semibold ${
                recruiter.blacklisted
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {recruiter.blacklisted ? 'Blacklisted' : 'Blacklist'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Applications Sent</p>
              <p className="text-white font-semibold text-2xl">{applicationsSent}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Email Source</p>
              <p className="text-white font-semibold capitalize">{recruiter.bestEmail?.source || 'Unknown'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Confidence Score</p>
              <p className="text-white font-semibold">{Math.round((recruiter.bestEmail?.confidence || 0) * 100)}%</p>
            </div>
          </div>

          {recruiter.emailSources && Object.keys(recruiter.emailSources).length > 0 && (
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-bold text-white mb-4">Email Sources</h2>
              <div className="space-y-2">
                {Object.entries(recruiter.emailSources).map(([source, data]) => (
                  <div key={source} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-sm capitalize">{source}</p>
                      <p className="text-white">{data.email}</p>
                    </div>
                    <p className="text-blue-400 font-semibold">{Math.round(data.confidence * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recruiter.lastInteractionAt && (
            <div className="border-t border-gray-700 mt-6 pt-6">
              <p className="text-gray-400 text-sm">Last Interaction</p>
              <p className="text-white">{new Date(recruiter.lastInteractionAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
