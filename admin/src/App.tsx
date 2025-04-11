// admin/App.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LeadsList from './pages/LeadsList';
import AddProspectiveLead from './pages/AddProspectiveLead';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 p-4 overflow-y-auto ml-0 lg:ml-64">
        <Routes>
          <Route path="/leads" element={<LeadsList />} />
          <Route path="/add" element={<AddProspectiveLead />} />
          <Route path="*" element={<h1>Welcome to Admin Panel</h1>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
