// Environment test utility
export const testEnvironmentConfig = () => {
  console.log('🌍 Environment Test:');
  console.log('Mode:', import.meta.env.MODE);
  console.log('Dev:', import.meta.env.DEV);
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Node Env:', import.meta.env.NODE_ENV);
  
  return {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    nodeEnv: import.meta.env.NODE_ENV
  };
}; 