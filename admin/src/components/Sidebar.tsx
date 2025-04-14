// admin/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC<{ isSidebarOpen: boolean, toggleSidebar: () => void }> = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <div 
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-30 transform transition-transform lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">Lead Manager</h2>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link to="/admin/leads" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Leads</Link>
          </li>
          <li>
            <Link to="/admin/add" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Add Prospective</Link>
          </li>
          <li>
            <Link to="/admin/prospective-leads" className="block py-2 px-4 rounded hover:bg-gray-700 transition">View Prospective Leads</Link>
          </li>
          <li>
            <Link to="/admin/settings" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Settings</Link>
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
