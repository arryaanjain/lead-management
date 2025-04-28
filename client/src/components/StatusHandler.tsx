// src/components/StatusHandler.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Catalogue from './Catalogue';
import WaitingApproval from './WaitingApproval';
import axiosJWT from '../utils/axiosJWT';

type LeadStatus = 'approved' | 'pending' | 'rejected' | null;

const StatusHandler: React.FC = () => {
  const [status, setStatus] = useState<LeadStatus>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const phone = localStorage.getItem('leadPhone');
    if (!phone) {
      localStorage.removeItem('leadPhone');
      localStorage.removeItem('clientAccessToken');
      navigate('/');
      return;
    }

    // Check if status is passed in location state
    if (location.state?.status) {
      setStatus(location.state.status);
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/api/client/leads/status/${phone}`);
        setStatus(res.data.status);
      } catch (err) {
        console.error('Error fetching lead status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [location.state, navigate]);

  if (loading) {
    return <p className="text-center mt-10">Checking your status...</p>;
  }

  if (status === 'approved') return <Catalogue />;
  if (status === 'pending') return <WaitingApproval />;
  if (status === 'rejected') {
    return <p className="text-center text-red-600">Your request has been rejected.</p>;
  }

  return <p className="text-center text-gray-600">Lead not found.</p>;
};

export default StatusHandler;
