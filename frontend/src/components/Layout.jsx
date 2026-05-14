'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/jobs', label: 'Jobs', icon: '💼' },
    { href: '/applications', label: 'Applications', icon: '📝' },
    { href: '/recruiters', label: 'Recruiters', icon: '👥' },
    { href: '/resumes', label: 'Resumes', icon: '📄' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-gray-800 ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-gray-700`}>
        <div className="p-6">
          <h1 className={`font-bold text-blue-400 ${sidebarOpen ? 'text-2xl' : 'text-lg text-center'}`}>
            {sidebarOpen ? 'JobAuto' : 'JA'}
          </h1>
        </div>

        <nav className="space-y-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white"
          >
            ☰
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
