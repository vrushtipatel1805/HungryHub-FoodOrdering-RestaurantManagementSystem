import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const USER_KEY = 'hungryhub_user';

const readStoredUser = () => {
  if (typeof window === 'undefined') return { role: 'customer', name: 'Guest' };
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null') || { role: 'customer', name: 'Guest' };
  } catch {
    return { role: 'customer', name: 'Guest' };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }, [user]);

  // Attempt to load profile if token exists but user role is guest
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('hungryhub_access_token');
      if (token && user.name === 'Guest') {
        try {
          const response = await api.get('/auth/profile/');
          if (response.data?.ok) {
            setUser(response.data.user);
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('hungryhub_access_token');
          localStorage.removeItem('hungryhub_refresh_token');
        }
      }
    };
    loadProfile();
  }, [user.name]);

  const login = async () => {
    setLoading(true);
    const email = 'admin@hungryhub.com';
    const password = 'AdminPass123';
    const result = await signin({ email, password });
    setLoading(false);
    return result;
  };

  const signup = async ({ full_name, email, dob, password, confirm_password }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup/', { full_name, email, dob, password, confirm_password });
      if (response.data?.ok) {
        const { user: userData, tokens } = response.data;
        localStorage.setItem('hungryhub_access_token', tokens.access);
        localStorage.setItem('hungryhub_refresh_token', tokens.refresh);
        
        const mappedUser = {
          id: userData.email,
          role: userData.role,
          name: userData.full_name,
          email: userData.email,
          dob: userData.dob
        };
        setUser(mappedUser);
        setLoading(false);
        return { ok: true, user: mappedUser, message: response.data.message || 'Account created successfully.' };
      }
      setLoading(false);
      return { ok: false, errors: response.data?.errors || { email: 'Registration failed.' } };
    } catch (error) {
      setLoading(false);
      const serverErrors = error.response?.data?.errors || { email: error.response?.data?.error || 'Registration failed.' };
      return { ok: false, errors: serverErrors };
    }
  };

  const signin = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signin/', { email, password });
      if (response.data?.ok) {
        const { user: userData, tokens } = response.data;
        localStorage.setItem('hungryhub_access_token', tokens.access);
        localStorage.setItem('hungryhub_refresh_token', tokens.refresh);
        
        const mappedUser = {
          id: userData.email,
          role: userData.role,
          name: userData.full_name,
          email: userData.email,
          dob: userData.dob
        };
        setUser(mappedUser);
        setLoading(false);
        return { ok: true, user: mappedUser, message: response.data.message || 'Login successful.' };
      }
      setLoading(false);
      return { ok: false, error: 'Login failed.' };
    } catch (error) {
      setLoading(false);
      return { ok: false, error: error.response?.data?.error || 'Invalid email or password.' };
    }
  };

  const findAccountByEmail = async (email) => {
    try {
      const response = await api.post('/auth/check-email/', { email });
      return response.data?.exists ? { email } : null;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refresh = localStorage.getItem('hungryhub_refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      console.warn("Logout request failed, cleaning local state anyway.", e);
    }
    localStorage.removeItem('hungryhub_access_token');
    localStorage.removeItem('hungryhub_refresh_token');
    const guestUser = { role: 'customer', name: 'Guest' };
    setUser(guestUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(guestUser));
    }
    setLoading(false);
    return { ok: true };
  };

  const value = useMemo(() => ({ user, loading, login, signup, signin, logout, findAccountByEmail }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
