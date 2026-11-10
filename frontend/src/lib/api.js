import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL || window.location.origin}/api`,
  withCredentials: true,
});

export default api;
