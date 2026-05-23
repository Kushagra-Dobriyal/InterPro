export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Prowider — Lead Distribution System</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Welcome</h2>
        <p className="text-gray-600 mb-4">
          This is a mini lead distribution system. Customers can submit service enquiries, which are automatically assigned to providers based on business rules.
        </p>
        <p className="font-semibold mb-2">Available Pages:</p>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li><a href="/request-service" className="text-blue-600 hover:underline">Request Service</a> — Submit a new service enquiry</li>
          <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a> — View provider assignments and quotas</li>
          <li><a href="/test-tools" className="text-blue-600 hover:underline">Test Tools</a> — Webhook simulation and concurrency testing</li>
        </ul>
      </div>
    </div>
  );
}
