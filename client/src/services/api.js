import axios from "axios";

const API_BASE_URL = 'http://127.0.0.1:8000/api/';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {'Content-Type': 'application/json'},
    timeout:3000,
});

api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        console.log('Request data: ',config.data);

        const token = localStorage.getItem('access_token');
        if (token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response, async(error) =>{const Orequest = error.config;
        if(error.response?.status === 401 && !Orequest._retry){
            Orequest._retry = true;
            const refresh = localStorage.getItem('refresh');
            if(refresh){
                try{
                    const response = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/",{refresh});
                    localStorage.setItem('access',response.data.access);
                    Orequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(Orequest);
                }catch(refreshError){
                    localStorage.clear();
                    window.location.href="/";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;