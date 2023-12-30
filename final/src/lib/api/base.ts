import axios from 'axios';

const BACKEND_URL = '/';

const api = axios.create({
	baseURL: BACKEND_URL,
});

export default api;
