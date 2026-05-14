import React from 'react';

export default function DashboardStats({ data }) {
  const stats = [
    { label: 'Total Jobs Found', value: data.totalJobs, icon: '💼', color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Applications Sent', value: data.totalApplications, icon: '📧', color: 'bg-green-500/20 text-green-400' },
    { label: 'Recruiters', value: data.totalRecruiters, icon: '👥', color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Success Rate', value: `${data.successRate}%`, icon: '📈', color: 'bg-yellow-500/20 text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.color} border border-white/10 p-6 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <span className="text-4xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
