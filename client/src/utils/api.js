```javascript
import axios from 'axios';

const API_URL = 'https://kingmart-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const user = localStorage.getItem('kingsmart_user');
        if (user) {
          const parsed = JSON.parse(user);
          const token = parsed.accessToken || parsed.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (err) {
        console.error('Failed to parse user storage in API interceptor', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept unauthorized requests and try to refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const user = localStorage.getItem('kingsmart_user');

          if (user) {
            const parsed = JSON.parse(user);

            if (parsed.refreshToken) {
              console.log('Access token expired. Refreshing token...');

              const { data } = await axios.post(
                `${API_URL}/auth/refresh`,
                {
                  refreshToken: parsed.refreshToken
                }
              );

              const token = data.accessToken || data.token;

              if (token) {
                parsed.accessToken = token;
                parsed.token = token;

                localStorage.setItem(
                  'kingsmart_user',
                  JSON.stringify(parsed)
                );

                originalRequest.headers.Authorization = `Bearer ${token}`;

                return api(originalRequest);
              }
            }
          }
        }
      } catch (refreshErr) {
        console.error(
          'Token refresh cycle failed. Forcing logout...',
          refreshErr
        );

        if (typeof window !== 'undefined') {
          localStorage.removeItem('kingsmart_user');
          window.location.href = '/login?expired=true';
        }
      }
    }

    const errorMessage =
      error.response &&
      error.response.data &&
      error.response.data.message
        ? error.response.data.message
        : error.message || 'An unexpected API error occurred.';

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
```
