// src/App.tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LeadsList from './components/LeadsList';

const App: React.FC = () => {
  // State to control sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col relative">
        {/* Fixed TopBar */}
        <TopBar toggleSidebar={toggleSidebar} />

        {/* Main content - Scrollable area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 pt-16"> {/* pt-16 adds padding for the fixed TopBar */}
          <h2 className="text-2xl font-bold mb-4">Welcome to the Admin Dashboard</h2>

          {/* Main content section with scrollable LeadsList */}
          <div className="">
            <LeadsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
