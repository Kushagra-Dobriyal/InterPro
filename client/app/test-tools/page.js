'use client';

import { useState } from 'react';
import API_URL from '../config';

export default function TestTools() {
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState('');

  const addResult = (text) => {
    setResults(prev => prev + '\n' + text);
  };

  const handleResetQuota = async () => {
    setLoading('reset');
    const eventId = `reset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      const res = await fetch(`${API_URL}/api/webhook/reset-quota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await res.json();
      addResult(`[RESET QUOTA] eventId: ${eventId}`);
      addResult(`  Response: ${JSON.stringify(data)}`);
    } catch (err) {
      addResult(`[RESET QUOTA] Error: ${err.message}`);
    } finally {
      setLoading('');
    }
  };

  const handleIdempotencyTest = async () => {
    setLoading('idempotency');
    const eventId = `idem-${Date.now()}`;
    addResult(`\n[IDEMPOTENCY TEST] Calling webhook 5 times with same eventId: ${eventId}`);

    const promises = Array.from({ length: 5 }, async (_, i) => {
      try {
        const res = await fetch(`${API_URL}/api/webhook/reset-quota`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        });
        const data = await res.json();
        addResult(`  Call ${i + 1}: ${data.message}`);
      } catch (err) {
        addResult(`  Call ${i + 1}: Error - ${err.message}`);
      }
    });

    await Promise.all(promises);
    addResult('[IDEMPOTENCY TEST] Complete — only first call should have had effect');
    setLoading('');
  };

  const handleGenerateLeads = async () => {
    setLoading('generate');
    addResult('\n[GENERATE LEADS] Sending 10 concurrent lead requests...');

    try {
      const res = await fetch(`${API_URL}/api/test/generate-leads`, {
        method: 'POST'
      });
      const data = await res.json();
      addResult(`  ${data.message}`);
      if (data.results) {
        data.results.forEach(r => {
          addResult(`  Lead #${r.index}: Service ${r.serviceId} → Providers [${r.assignedProviders.join(', ')}]`);
        });
      }
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach(e => {
          addResult(`  Error #${e.index}: ${e.error}`);
        });
      }
    } catch (err) {
      addResult(`[GENERATE LEADS] Error: ${err.message}`);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Test Tools</h1>
      <p className="text-gray-500 text-sm mb-6">Simulate webhook calls and test concurrency behavior.</p>

      <div className="mb-6">
        <h3 className="font-semibold mb-1">1. Reset Provider Quotas</h3>
        <p className="text-gray-500 text-sm mb-2">Simulates a payment gateway confirming subscription. Resets all provider quotas to 10.</p>
        <button onClick={handleResetQuota} disabled={loading === 'reset'} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          {loading === 'reset' ? 'Resetting...' : 'Reset Quotas (Webhook)'}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-1">2. Idempotency Test</h3>
        <p className="text-gray-500 text-sm mb-2">Calls the same webhook 5 times with the same eventId. Only the first call should have effect.</p>
        <button onClick={handleIdempotencyTest} disabled={loading === 'idempotency'} className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-yellow-700 disabled:opacity-50">
          {loading === 'idempotency' ? 'Testing...' : 'Test Idempotency (5 calls)'}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-1">3. Generate 10 Leads</h3>
        <p className="text-gray-500 text-sm mb-2">Creates 10 leads simultaneously to test concurrent allocation.</p>
        <button onClick={handleGenerateLeads} disabled={loading === 'generate'} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50">
          {loading === 'generate' ? 'Generating...' : 'Generate 10 Leads'}
        </button>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Results Log</h2>
      <div className="bg-gray-800 text-gray-200 p-4 rounded font-mono text-xs max-h-72 overflow-y-auto whitespace-pre-wrap">
        {results || 'No tests run yet. Click a button above to start.'}
      </div>
    </div>
  );
}
