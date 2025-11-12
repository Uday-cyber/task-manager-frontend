import API from './api.js';

export const registerUser = (username, email, password) => {
    API.post('/users/register', {username, email, password});
}

export const loginUser = async (email, password) => {
    const { data } = await API.post('/users/login', { email, password });
    localStorage.setItem('token', data.token);

    return data;
}

export const getAllUsers = () => API.get('/users/')