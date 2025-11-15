import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');

    if(token){
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

API.interceptors.response.use(
    res => res,
    async (error) => {
        const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API.defaults.baseURL}/users/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem("token", data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return API(originalRequest);
      } catch (refreshError) {
        // console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);   
      }
    }

    return Promise.reject(error);
    }
)

export default API;