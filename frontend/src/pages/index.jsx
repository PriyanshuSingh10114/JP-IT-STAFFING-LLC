import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Job Application Automation</h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12">
          Automate your LinkedIn job search and application process with AI
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            Register
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
            <p className="text-gray-400">Automatically search LinkedIn for relevant job postings</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Emails</h3>
            <p className="text-gray-400">Generate personalized emails using AI</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Track Results</h3>
            <p className="text-gray-400">Monitor your applications and success rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
