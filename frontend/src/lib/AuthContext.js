import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminAuth, setAdminAuth] = useState(false);
  const [contractorAuth, setContractorAuth] = useState(false);
  const [contractorInfo, setContractorInfo] = useState(null);

  const loginAdmin = useCallback(async (password) => {
    await axios.post(`${API}/admin/login`, { password }, { withCredentials: true });
    setAdminAuth(true);
  }, []);

  const logoutAdmin = useCallback(async () => {
    try { await axios.post(`${API}/auth/logout`, {}, { withCredentials: true }); } catch {}
    setAdminAuth(false);
  }, []);

  const loginContractor = useCallback(async (email, password) => {
    const res = await axios.post(`${API}/contractors/login`, { email, password }, { withCredentials: true });
    setContractorAuth(true);
    setContractorInfo(res.data.contractor);
    return res.data;
  }, []);

  const registerContractor = useCallback(async (data) => {
    const res = await axios.post(`${API}/contractors/register`, data, { withCredentials: true });
    setContractorAuth(true);
    setContractorInfo(res.data.contractor);
    return res.data;
  }, []);

  const logoutContractor = useCallback(async () => {
    try { await axios.post(`${API}/auth/logout`, {}, { withCredentials: true }); } catch {}
    setContractorAuth(false);
    setContractorInfo(null);
  }, []);

  // Check auth status on mount by hitting a protected endpoint
  const checkContractorAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/contractors/me`, { withCredentials: true });
      setContractorAuth(true);
      setContractorInfo(res.data);
      return true;
    } catch {
      setContractorAuth(false);
      setContractorInfo(null);
      return false;
    }
  }, []);

  const checkAdminAuth = useCallback(async () => {
    try {
      await axios.get(`${API}/admin/stats`, { withCredentials: true });
      setAdminAuth(true);
      return true;
    } catch {
      setAdminAuth(false);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      adminAuth, contractorAuth, contractorInfo,
      loginAdmin, logoutAdmin, checkAdminAuth,
      loginContractor, registerContractor, logoutContractor, checkContractorAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
