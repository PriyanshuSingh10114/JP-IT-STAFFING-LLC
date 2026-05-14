import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchApplications(currentPage);
  }, [filterStatus, currentPage]);

  const fetchApplications = async (page) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/applications?page=${page}&limit=20`;
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(response.data.data);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      sent: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      viewed: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      replied: 'bg-green-500/20 text-green-400 border border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
      accepted: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Job Applications</h1>

        {/* Filter */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <label className="text-gray-300 mr-4">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="replied">Replied</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-center text-gray-400">No applications found</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-gray-800 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-gray-300">Job Title</th>
                    <th className="px-6 py-3 text-left text-gray-300">Company</th>
                    <th className="px-6 py-3 text-left text-gray-300">Recruiter</th>
                    <th className="px-6 py-3 text-left text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-gray-300">Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-6 py-3 text-white">{app.jobId?.title}</td>
                      <td className="px-6 py-3 text-white">{app.jobId?.company}</td>
                      <td className="px-6 py-3 text-white">{app.recruiterId?.name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded ${
                      currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
