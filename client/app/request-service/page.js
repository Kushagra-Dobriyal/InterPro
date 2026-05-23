'use client';

import { useState } from 'react';
import API_URL from '../config';

export default function RequestService() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    serviceId: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceId: Number(form.serviceId)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Lead created! Assigned to providers: ${data.lead.assignedProviders.join(', ')}` });
        setForm({ name: '', phone: '', city: '', serviceId: '', description: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create lead' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Request a Service</h1>

      {message && (
        <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
            <input id="phone" name="phone" type="text" value={form.phone} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
            <input id="city" name="city" type="text" value={form.city} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>

          <div className="mb-4">
            <label htmlFor="serviceId" className="block text-sm font-medium mb-1">Service Type</label>
            <select id="serviceId" name="serviceId" value={form.serviceId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Select a service</option>
              <option value="1">Service 1</option>
              <option value="2">Service 2</option>
              <option value="3">Service 3</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[80px] resize-y" />
          </div>

          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
