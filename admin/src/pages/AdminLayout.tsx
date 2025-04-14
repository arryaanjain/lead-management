// src/layout/AdminLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <TopBar toggleSidebar={toggleSidebar} />
      <div className="pt-16 lg:ml-64 transition-all duration-300 flex-1">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
