// API Configuration
export const API_CONFIG = {
  BASE_URL: (() => {
    const url = import.meta.env.VITE_API_BASE_URL;
    if (!url && import.meta.env.PROD) {
      console.error('⚠️ VITE_API_BASE_URL is not set in production!');
      // You might want to throw an error here in production
      // throw new Error('API Base URL is not configured');
    }
    return url || 'http://localhost:8080/api';
  })(),
  TIMEOUT: 10000, // 10 seconds
};

// Debug logging
console.log('🔧 API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  ENV: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/')
    ? API_CONFIG.BASE_URL.slice(0, -1)
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
}; 