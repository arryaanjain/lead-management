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
    <>
    <div className="overflow-auto rounded-lg shadow hidden md:block">
        <table className="w-full">
        <thead className="bg-gray-100 text-gray-700 border-b-2 border-gray-300">
          <tr>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">Name</th>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">Phone</th>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">City</th>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">Business</th>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">Role</th>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">Status</th>
            <th className="p-3 text-sm font-semibold tracking-wide text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b hover:bg-gray-50 whitespace-nowrap">
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{lead.name}</td>
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{lead.phone}</td>
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{lead.city}</td>
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{lead.business}</td>
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{lead.role}</td>
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{lead.status}</td>
            <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
              {lead.status === 'pending' && (
                <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                  <button
                    onClick={() => handleApprove(lead._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(lead._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </td>
          </tr>
          
          ))}
        </tbody>
      </table>
    </div>

    <div className="grid grid-cols-1 gap-4 md:hidden">
  {leads.map((lead) => (
    <div key={lead._id} className="bg-white space-y-2 shadow-md rounded-lg p-4">
      <div className="text-sm">
        <p><span className="font-semibold">Name:</span> {lead.name}</p>
        <p><span className="font-semibold">Phone:</span> {lead.phone}</p>
        <p><span className="font-semibold">City:</span> {lead.city}</p>
        <p><span className="font-semibold">Business:</span> {lead.business}</p>
        <p><span className="font-semibold">Role:</span> {lead.role}</p>
        <p><span className="font-semibold">Status:</span> <span className={`capitalize ${lead.status === 'approved' ? 'text-green-600' : lead.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{lead.status}</span></p>
      </div>
      {lead.status === 'pending' && (
        <div className="flex justify-start space-x-2 pt-2">
          <button
            onClick={() => handleApprove(lead._id)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(lead._id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  ))}
</div>

    </>
  );
};

export default LeadsList;
