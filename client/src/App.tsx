import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Form from './components/Form';
import StatusHandler from './components/StatusHandler';
import Catalogue from './components/Catalogue';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/status" element={<StatusHandler />} />
        <Route path="/catalogue" element={<ProtectedRoute> <Catalogue /> </ProtectedRoute>} /> {/* <-- Add this */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;

/*
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

        <Route index element={<h1>Welcome to Admin Panel</h1>} />
      </Route>
    </Routes>

*/
