'use client';

import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';

export default function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`);
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const eventSource = new EventSource(`${API_URL}/api/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.addEventListener('lead_assigned', () => {
      fetchDashboard();
    });

    eventSource.addEventListener('quota_reset', () => {
      fetchDashboard();
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto p-8"><p className="text-gray-500">Loading dashboard...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sseConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {sseConnected ? '● Live' : '● Disconnected'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <div key={provider.providerId} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{provider.name}</h3>
            <div className="flex gap-3 mb-3">
              <span className="bg-gray-100 text-sm px-2 py-1 rounded">
                Quota: <span className="font-bold">{provider.remainingQuota}</span>/{provider.monthlyQuota}
              </span>
              <span className="bg-gray-100 text-sm px-2 py-1 rounded">
                Leads: <span className="font-bold">{provider.currentMonthLeads}</span>
              </span>
            </div>

            {provider.assignedLeads.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto">
                {provider.assignedLeads.map((lead) => (
                  <li key={lead.leadId} className="py-2 border-b border-gray-100 last:border-b-0 text-sm">
                    <span className="font-medium">{lead.name}</span> — {lead.phone} — {lead.city}
                    <br />
                    <span className="text-gray-400 text-xs">
                      Service {lead.serviceId} • {new Date(lead.assignedAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No leads assigned yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
