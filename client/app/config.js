const API_URL = 
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default API_URL;