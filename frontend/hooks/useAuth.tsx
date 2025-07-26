'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'GUEST' | 'HOTEL_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const setTokens = (tokens: AuthTokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.auth.login({ email, password });
      
      if (response.user && response.tokens) {
        setTokens(response.tokens);
        setUser(response.user);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.auth.register(userData);
      
      if (response.user && response.tokens) {
        setTokens(response.tokens);
        setUser(response.user);
        toast.success('Registration successful!');
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.auth.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await apiClient.users.updateProfile(data);
      if (response.user) {
        setUser(response.user);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.auth.getProfile();
      if (response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      console.error('Refresh user error:', error);
      if (error.status === 401) {
        clearTokens();
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/auth/login');
          return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          toast.error('You do not have permission to access this page');
          router.push('/dashboard');
          return;
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner w-8 h-8"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access
export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = () => hasRole(['ADMIN', 'SUPER_ADMIN']);
  const isHotelManager = () => hasRole('HOTEL_MANAGER');
  const isGuest = () => hasRole('GUEST');
  const isSuperAdmin = () => hasRole('SUPER_ADMIN');

  return {
    user,
    hasRole,
    isAdmin,
    isHotelManager,
    isGuest,
    isSuperAdmin,
  };
}