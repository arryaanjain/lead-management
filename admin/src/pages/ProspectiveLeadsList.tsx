// src/components/ProspectiveLeadsList.tsx
import React, { useEffect, useState } from 'react';
import axiosJWT from '../utils/axiosInstance';

interface ProspectiveLead {
  _id: string;
  name: string;
  phone: string;
  status: 'pending' | 'approved';
}

const ProspectiveLeadsList: React.FC = () => {
  const [leads, setLeads] = useState<ProspectiveLead[]>([]);

  const fetchLeads = async () => {
    try {
      const res = await axiosJWT.get(`/api/admin/prospective-leads`);
      setLeads(res.data);
    } catch (error) {
      console.error('Failed to fetch leads', error);
    }
  };
  
  const updateStatus = async (id: string, status: 'approved' | 'pending') => {
    try {
      // Correcting the HTTP method to PATCH (instead of POST) and updating the endpoint URL.
      await axiosJWT.patch(`/api/admin/prospective-leads/${id}/status`, {
        status,  // Passing status as a body parameter
      });
      fetchLeads(); // Refresh the leads after status update
    } catch (error) {
      console.error('Failed to update lead status', error);
    }
  };
  
  

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleApprove = (id: string) => updateStatus(id, 'approved');
  const handleReject = (id: string) => updateStatus(id, 'pending');

  return (
    <>
      {/* Desktop View */}
      <div className="overflow-auto rounded-lg shadow hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 border-b-2 border-gray-300">
            <tr>
              <th className="p-3 text-sm font-semibold tracking-wide text-left">Name</th>
              <th className="p-3 text-sm font-semibold tracking-wide text-left">Phone</th>
              <th className="p-3 text-sm font-semibold tracking-wide text-left">Status</th>
              <th className="p-3 text-sm font-semibold tracking-wide text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead._id} className="border-b hover:bg-gray-50 whitespace-nowrap">
                <td className="p-3 text-sm text-gray-700">{lead.name}</td>
                <td className="p-3 text-sm text-gray-700">{lead.phone}</td>
                <td className="p-3 text-sm text-gray-700 capitalize">
                  <span className={`${lead.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>{lead.status}</span>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  {lead.status === 'pending' ? (
                    <button onClick={() => handleApprove(lead._id)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                      Approve
                    </button>
                  ) : (
                    <button onClick={() => handleReject(lead._id)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      Mark Pending
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {leads.map((lead) => (
          <div key={lead._id} className="bg-white space-y-2 shadow-md rounded-lg p-4">
            <div className="text-sm">
              <p><span className="font-semibold">Name:</span> {lead.name}</p>
              <p><span className="font-semibold">Phone:</span> {lead.phone}</p>
              <p><span className="font-semibold">Status:</span> <span className={`capitalize ${lead.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>{lead.status}</span></p>
            </div>
            <div className="flex justify-start space-x-2 pt-2">
              {lead.status === 'pending' ? (
                <button onClick={() => handleApprove(lead._id)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Approve
                </button>
              ) : (
                <button onClick={() => handleReject(lead._id)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Mark Pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProspectiveLeadsList;
