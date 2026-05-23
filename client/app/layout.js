import './globals.css';

export const metadata = {
  title: 'Prowider - Lead Distribution System',
  description: 'Mini Lead Distribution System for service enquiries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg mr-auto">Prowider</span>
          <a href="/" className="text-blue-600 hover:underline font-medium">Home</a>
          <a href="/request-service" className="text-blue-600 hover:underline font-medium">Request Service</a>
          <a href="/dashboard" className="text-blue-600 hover:underline font-medium">Dashboard</a>
          <a href="/test-tools" className="text-blue-600 hover:underline font-medium">Test Tools</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
