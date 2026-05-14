import React from 'react';

export default function RecentActivity({ activities }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400',
      sent: 'text-blue-400',
      viewed: 'text-purple-400',
      replied: 'text-green-400',
      rejected: 'text-red-400',
      accepted: 'text-emerald-400',
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Recent Activities</h2>

      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.slice(0, 10).map((activity) => (
            <div key={activity._id} className="flex items-center justify-between border-b border-gray-700 pb-4">
              <div>
                <p className="text-white font-medium">{activity.jobId?.title}</p>
                <p className="text-gray-400 text-sm">{activity.jobId?.company}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getStatusColor(activity.status)}`}>{activity.status}</p>
                <p className="text-gray-400 text-sm">{new Date(activity.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No recent activities</p>
        )}
      </div>
    </div>
  );
}
