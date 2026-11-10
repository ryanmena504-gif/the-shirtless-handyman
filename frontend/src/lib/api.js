import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL || "https://design-reveal.preview.emergentagent.com"}/api`,
  withCredentials: true,
});

export default api;
