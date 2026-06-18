import axios from "axios";

const API_BASE_URL = 'https://hospitals-production.up.railway.app/api/';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 2000, 
});

api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        console.log('Request data: ', config.data);

        const token = localStorage.getItem('access');
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
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${API_BASE_URL}auth/token/refresh/`,
                        { refresh: refreshToken }
                    );
                    
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access', newAccessToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;