import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function ApplicationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailHistory, setEmailHistory] = useState([]);

  useEffect(() => {
    if (id) {
      fetchApplicationDetail();
    }
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplication(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching application:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-500/20 text-yellow-400',
      sent: 'bg-blue-500/20 text-blue-400',
      viewed: 'bg-purple-500/20 text-purple-400',
      replied: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      accepted: 'bg-emerald-500/20 text-emerald-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) return <Layout><div className="text-center text-gray-400">Loading...</div></Layout>;
  if (!application) return <Layout><div className="text-center text-gray-400">Application not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Application Details</h1>
              <p className="text-gray-400 mt-2">Job ID: {application.jobId}</p>
            </div>
            <span className={`px-4 py-2 rounded font-semibold ${getStatusColor(application.status)}`}>
              {application.status?.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Recruiter</p>
              <p className="text-white font-semibold">{application.recruiter?.name || 'Unknown'}</p>
              <p className="text-gray-500 text-sm">{application.recruiter?.email}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Sent Date</p>
              <p className="text-white font-semibold">{new Date(application.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-500 text-sm">{new Date(application.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Email Opens</p>
              <p className="text-white font-semibold text-2xl">{application.openCount || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Link Clicks</p>
              <p className="text-white font-semibold text-2xl">{application.clickCount || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Retries</p>
              <p className="text-white font-semibold text-2xl">{application.retryCount || 0}</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Email Content</h2>
            <div className="bg-gray-700 p-4 rounded space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Subject</p>
                <p className="text-white">{application.emailSubject || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Message</p>
                <p className="text-gray-300 whitespace-pre-wrap text-sm">{application.emailBody || 'N/A'}</p>
              </div>
            </div>
          </div>

          {application.personalizationData && (
            <div className="border-t border-gray-700 mt-6 pt-6">
              <h2 className="text-xl font-bold text-white mb-4">Personalization Data</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(application.personalizationData).map(([key, value]) => (
                  <div key={key} className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-sm">{key}</p>
                    <p className="text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
