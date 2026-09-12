import axios from 'axios';

const API_URL = 'https://kingmart-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const token = parsed.accessToken || parsed.token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.error('Error parsing stored user:', err);
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;

      try {
        const stored = localStorage.getItem('user');

        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed.refreshToken) {
            const { data } = await axios.post(
              `${API_URL}/auth/refresh`,
              {
                refreshToken: parsed.refreshToken,
              }
            );

            if (data.accessToken) {
              parsed.accessToken = data.accessToken;
              localStorage.setItem('user', JSON.stringify(parsed));

              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

              return api(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;