const LOCAL_API_URL = 'http://localhost:4000';
const PRODUCTION_API_URL = 'https://quickservices.onrender.com';

export const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return LOCAL_API_URL;
    }

    return PRODUCTION_API_URL;
  }

  return process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;
};
