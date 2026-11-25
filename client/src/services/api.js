import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = 'https://hospitals-production.up.railway.app/api/';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        console.log('Request data: ', config.data);

        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            toast.error(`Too many attempts. Please try again in ${retryAfter} seconds`);
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${API_BASE_URL}accounts/refresh_token/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = response.data.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    let loginPath = "/login";
                    try {
                        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
                        if (storedUser?.user_type === 'admin' || storedUser?.role === 'admin') {
                            loginPath = "/admin/login";
                        }
                    } catch (parseError) {
                        console.error('Failed to read the stored user during logout.', parseError);
                    }
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.replace(loginPath);
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;