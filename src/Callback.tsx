import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/calendar');
  }, [navigate]);
  return <div>Redirecting...</div>;
};

export default Callback;