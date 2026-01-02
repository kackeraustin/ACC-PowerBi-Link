import dotenv from 'dotenv';

dotenv.config();

export const config = {
  aps: {
    clientId: process.env.APS_CLIENT_ID || '',
    clientSecret: process.env.APS_CLIENT_SECRET || '',
    callbackUrl: process.env.APS_CALLBACK_URL || 'http://localhost:3000/oauth/callback',
    scope: 'data:read data:write account:read',
    authUrl: 'https://developer.api.autodesk.com/authentication/v2/authorize',
    tokenUrl: 'https://developer.api.autodesk.com/authentication/v2/token',
    baseUrl: 'https://developer.api.autodesk.com'
  },
  acc: {
    apiBaseUrl: 'https://developer.api.autodesk.com',
    issuesEndpoint: '/construction/issues/v2',
    costEndpoint: '/construction/cost/v1',
    assetsEndpoint: '/construction/assets/v2',
    formsEndpoint: '/construction/forms/v1',
    locationsEndpoint: '/construction/locations/v2',
    quantityTakeoffEndpoint: '/construction/quantitytakeoff/v1'
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export function validateConfig(): void {
  const required = ['APS_CLIENT_ID', 'APS_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
