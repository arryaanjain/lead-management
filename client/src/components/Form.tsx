import React, { useState } from 'react';

// Define the form data type
interface FormData {
  name: string;
  phone: string;
  city: string;
  business: string;
  role: string;
}

const Form: React.FC = () => {
  // Use the FormData interface to type the state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    city: '',
    business: '',
    role: ''
  });

  // Handle input change with appropriate type for event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(`${import.meta.env.VITE_API_URL}/api/form/submit`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/form/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      // Log the response text
      const responseText = await response.text(); // Get the raw text
      console.log(responseText);
  
      // Try to parse the JSON
      const data = JSON.parse(responseText); // If it's valid JSON, this will work
      alert(data.message);  // Assuming the API returns a message
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Lead Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">Contact Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700">Contact Number</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="city" className="block text-gray-700">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="business" className="block text-gray-700">Business Name</label>
          <input
            type="text"
            id="business"
            name="business"
            value={formData.business}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select Role</option>
            <option value="Distributor">Distributor</option>
            <option value="Wholeseller">Wholeseller</option>
            <option value="Super-stockist">Super-stockist</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Form;
