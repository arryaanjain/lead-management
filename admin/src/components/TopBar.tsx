// src/components/TopBar.tsx
import { FC } from 'react';
import axiosJWT from '../utils/axiosInstance';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: FC<TopBarProps> = ({ toggleSidebar }) => {

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.error("No refresh token found");
        return;
      }

      const response = await axiosJWT.post('/api/auth/logout', {
        token: refreshToken,
      });

      if (response.status === 200) {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fixed top-0 z-20 w-full h-16 px-4 shadow-md bg-gray-800 text-white flex justify-between items-center transition-all duration-300">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        <p className="text-sm">Admin Name</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button 
          className="lg:hidden p-2 bg-gray-600 rounded-md hover:bg-gray-700 transition"
          onClick={toggleSidebar}
        >
          <span className="text-xl">☰</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
