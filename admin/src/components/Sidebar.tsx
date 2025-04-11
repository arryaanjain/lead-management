// admin/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC<{ isSidebarOpen: boolean, toggleSidebar: () => void }> = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <div 
      className={`lg:w-64 w-full h-full bg-gray-800 text-white p-4 transform transition-all fixed lg:static top-0 left-0 z-10 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <h2 className="text-2xl font-bold mb-6">Lead Manager</h2>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link to="/leads" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Leads</Link>
          </li>
          <li>
            <Link to="/add" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Add Prospective</Link>
          </li>
          <li>
            <Link to="/settings" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Settings</Link>
          </li>
        </ul>
      </nav>

      <button
        className="lg:hidden absolute top-4 right-4 p-2 bg-gray-600 rounded-md hover:bg-gray-700 transition"
        onClick={toggleSidebar}
      >
        <span className="text-xl">×</span>
      </button>
    </div>
  );
};

export default Sidebar;
