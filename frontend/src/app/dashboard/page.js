'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import DashboardStats from '../../components/DashboardStats';
import RecentActivity from '../../components/RecentActivity';
import PerformanceChart from '../../components/PerformanceChart';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiUrl}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-xl text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {dashboardData?.user?.name}!</p>
        </div>

        {/* Error Message */}
        {error && <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded">{error}</div>}

        {/* Stats Cards */}
        {dashboardData && <DashboardStats data={dashboardData.overview} />}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardData && <PerformanceChart data={dashboardData.applicationBreakdown} />}
        </div>

        {/* Recent Activity */}
        {dashboardData && <RecentActivity activities={dashboardData.recentActivities} />}
      </div>
    </Layout>
  );
}
