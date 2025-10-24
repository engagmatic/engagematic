/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Admin {
  id: string;
  username: string;
  role: 'super_admin' | 'admin';
  email?: string;
  lastLogin?: string;
}

interface AdminContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}`;

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if admin is already logged in (verify token)
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/admin/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('adminToken');
          setAdmin(null);
        }
      } catch (error) {
        console.error('Admin verification error:', error);
        localStorage.removeItem('adminToken');
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again in 15 minutes.');
        } else if (response.status === 423) {
          const lockTime = Math.ceil((new Date(data.lockUntil).getTime() - Date.now()) / 60000);
          throw new Error(`Account locked. Try again in ${lockTime} minutes.`);
        } else if (response.status === 401) {
          const attemptsRemaining = data.attemptsRemaining || 0;
          throw new Error(`Invalid credentials. ${attemptsRemaining} attempts remaining.`);
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }

      // Success - store token and admin data
      localStorage.setItem('adminToken', data.token);
      setAdmin(data.admin);
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    navigate('/admin/login');
  };

  const value = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    error
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

