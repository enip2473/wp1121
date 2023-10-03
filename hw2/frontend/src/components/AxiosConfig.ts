import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
    baseURL: apiURL
});

export default instance;
