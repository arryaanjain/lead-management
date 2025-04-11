// admin/components/Sidebar.tsx
import React from 'react';

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
            <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Dashboard</a>
          </li>
          <li>
            <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Leads</a>
          </li>
          <li>
            <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">Settings</a>
          </li>
        </ul>
      </nav>
      {/* Button to toggle sidebar visibility on small screens */}
      <button
        className="lg:hidden absolute top-4 right-4 p-2 bg-gray-600 rounded-md hover:bg-gray-700 transition"
        onClick={toggleSidebar}
      >
        <span className="text-xl">×</span> {/* Close Icon for Mobile */}
      </button>
    </div>
  );
};

export default Sidebar;
