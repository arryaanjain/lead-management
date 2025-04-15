import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosJWT from '../utils/axiosJWT';

interface FormData {
  name: string;
  phone: string;
  city: string;
  business: string;
  role: string;
}

const Form: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    city: '',
    business: '',
    role: ''
  });

  const [quickPhone, setQuickPhone] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosJWT.post('/api/client/form/submit', formData);

      const { message, token } = response.data;

      alert(message);
      localStorage.setItem('leadPhone', formData.phone);
      localStorage.setItem('clientAccessToken', token);

      navigate('/status');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const message = error?.response?.data?.message || 'Something went wrong.';
      alert(message);
    }
  };

  const handleQuickAccess = async () => {
    try {
      const response = await axiosJWT.post('/api/client/verify-phone', { phone: quickPhone });

      const { message, token } = response.data;

      alert(message);
      localStorage.setItem('clientAccessToken', token);
      navigate('/catalogue');
    } catch (error: any) {
      console.error('Quick access error:', error);
      const message = error?.response?.data?.message || 'Something went wrong.';
      alert(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg space-y-8">
      {/* Main form */}
      <div>
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

      {/* Quick access section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Already filled the form?</h3>
        <p className="mb-4 text-sm text-gray-600">Enter your phone number below to access the catalogue directly.</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter your phone number"
            value={quickPhone}
            onChange={(e) => setQuickPhone(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleQuickAccess}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
