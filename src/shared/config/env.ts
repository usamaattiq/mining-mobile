const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('[env] EXPO_PUBLIC_API_URL is not set — falling back to http://localhost:4000/api');
}

export const env = {
  API_URL: apiUrl ?? 'http://localhost:4000/api',
};
