// src/components/LeadsList.tsx
import React, { useState, useEffect } from 'react';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  city: string;
  business: string;
  role: string;
  status: string;
}

const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch leads from the backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`);
        const data = await response.json();
        setLeads(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${id}/approve`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead._id === id ? { ...lead, status: 'approved' } : lead
          )
        );
      }
    } catch (error) {
      console.error('Error approving lead:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${id}/reject`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead._id === id ? { ...lead, status: 'rejected' } : lead
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting lead:', error);
    }
  };

  if (loading) {
    return <p className="text-center text-xl font-semibold text-gray-600">Loading leads...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Submitted Leads</h2>
      {leads.length === 0 ? (
        <p className="text-center text-xl text-gray-600">No leads available.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Phone</th>
                <th className="px-6 py-3 text-left font-semibold">City</th>
                <th className="px-6 py-3 text-left font-semibold">Business</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{lead.name}</td>
                  <td className="px-6 py-4">{lead.phone}</td>
                  <td className="px-6 py-4">{lead.city}</td>
                  <td className="px-6 py-4">{lead.business}</td>
                  <td className="px-6 py-4">{lead.role}</td>
                  <td className="px-6 py-4">{lead.status}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    {lead.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(lead._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(lead._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
