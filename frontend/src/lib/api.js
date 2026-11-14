import axios from "axios";
import { API } from "./apiBase";

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;
