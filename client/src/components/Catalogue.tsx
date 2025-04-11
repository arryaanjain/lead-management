// src/components/Catalogue.tsx
import React from 'react';

const Catalogue: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-green-600">Welcome to the Catalogue!</h2>
      <p className="text-gray-700">Here is your exclusive access to our catalogue...</p>

      {/* Example catalogue content */}
      <ul className="mt-4 list-disc pl-6 text-gray-600">
        <li>Product 1 - Price</li>
        <li>Product 2 - Price</li>
        <li>Product 3 - Price</li>
      </ul>
    </div>
  );
};

export default Catalogue;
