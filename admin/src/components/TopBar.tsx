// admin/components/TopBar.tsx
import { FC } from 'react';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: FC<TopBarProps> = ({ toggleSidebar }) => {
  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4 shadow-md">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        <p className="text-sm">Admin Name</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Logout</button>
        <button 
          className="lg:hidden p-2 bg-gray-600 rounded-md hover:bg-gray-700 transition"
          onClick={toggleSidebar}
        >
          <span className="text-xl">☰</span> {/* Hamburger Menu for Mobile */}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
