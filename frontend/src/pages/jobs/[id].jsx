import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job:', error);
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/applications`,
        {
          jobId: id,
          recruiterId: job.recruiterId,
          resume: 'primary',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push('/applications?status=sent');
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Layout><div className="text-center text-gray-400">Loading...</div></Layout>;
  if (!job) return <Layout><div className="text-center text-gray-400">Job not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">{job.title}</h1>
              <p className="text-2xl text-blue-400 font-semibold mt-2">{job.company}</p>
              <p className="text-gray-400 mt-1">{job.location}</p>
            </div>
            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Job Type</p>
              <p className="text-white font-semibold">{job.jobType}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Experience Level</p>
              <p className="text-white font-semibold">{job.experienceLevel || 'N/A'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Posted</p>
              <p className="text-white font-semibold">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="border-t border-gray-700 mt-6 pt-6">
              <h2 className="text-xl font-bold text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
