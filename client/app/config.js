const API_URL = 
  typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : 'http://168.144.68.231:5000';

export default API_URL;
