/**
 * Centralized environment configuration.
 * All env vars are read once here and exported as typed constants.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string || '/api',
  appName: import.meta.env.VITE_APP_NAME as string || 'AMRUT Peth Stall Booking Platform',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const;
