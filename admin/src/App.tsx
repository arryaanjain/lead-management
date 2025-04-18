// admin/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LeadsList from './pages/LeadsList';
import AddProspectiveLead from './pages/AddProspectiveLead';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import ProspectiveLeadsList from './pages/ProspectiveLeadsList';
import UploadCatalogue from './pages/UploadCatalogue';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="leads" element={<LeadsList />} />
        <Route path="add" element={<AddProspectiveLead />} />
        <Route path="prospective-leads" element={<ProspectiveLeadsList />} />
        <Route path="upload-catalogue" element={<UploadCatalogue />} />

        <Route index element={<h1>Welcome to Admin Panel</h1>} />
      </Route>
    </Routes>
  );
};

export default App;
