// src/components/WaitingApproval.tsx
import React from 'react';

const WaitingApproval: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto p-6 bg-yellow-100 rounded-lg text-center shadow-md">
      <h2 className="text-2xl font-semibold text-yellow-700">Awaiting Approval</h2>
      <p className="mt-2 text-gray-700">Your details have been submitted and are pending admin approval. You will be notified once approved.</p>
    </div>
  );
};

export default WaitingApproval;
