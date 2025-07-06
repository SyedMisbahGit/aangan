import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass: password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_jwt', data.token);
        navigate('/admin', { replace: true });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <DreamLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 transition-colors duration-500">
        <DreamHeader title="Admin Login" subtitle="Enter the secret password to access insights." className="mb-2" />
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-paper-light rounded-2xl shadow-soft p-8 mt-6 border border-cream-200 transition-colors duration-500">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full mb-4 px-4 py-2 border rounded-lg"
            required
          />
          {error && <div className="text-red-600 text-sm mb-2 italic">{error}</div>}
          <button
            type="submit"
            className="w-full bg-aangan-primary hover:bg-aangan-accent text-white font-semibold py-2 px-4 rounded-xl shadow-aangan-md transition focus:outline-none focus:ring-2 focus:ring-aangan-accent focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>
    </DreamLayout>
  );
};

export default AdminLogin; 