import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import type { Hotel } from '@/types';

// Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api' 
      : '/api');
      
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }

      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
      }

      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await instance.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
            
            // Update tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }

      // Handle other errors
      const apiError: ApiError = {
        message: error.response?.data?.error || error.message || 'An unexpected error occurred',
        status: error.response?.status || 500,
        code: error.response?.data?.code,
        details: error.response?.data?.details,
      };

      // Show error toast for client-side errors
      if (typeof window !== 'undefined' && error.response?.status >= 400) {
        toast.error(apiError.message);
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Create API instance
export const api = createApiInstance();

// API methods
export const apiClient = {
  // Generic methods
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.get(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.post(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.put(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.patch(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.delete(url, config).then((res) => res.data),

  // Auth methods
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),

    register: (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => apiClient.post('/auth/register', userData),

    logout: (refreshToken?: string) =>
      apiClient.post('/auth/logout', { refreshToken }),

    refreshToken: (refreshToken: string) =>
      apiClient.post('/auth/refresh', { refreshToken }),

    getProfile: () => apiClient.get('/auth/me'),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.post('/auth/change-password', data),
  },

  // Hotels methods
  hotels: {
    getAll: (params?: any) => apiClient.get<Hotel[]>('/hotels', { params }),
    getById: (id: string) => apiClient.get(`/hotels/${id}`),
    create: (data: any) => apiClient.post('/hotels', data),
    update: (id: string, data: any) => apiClient.put(`/hotels/${id}`, data),
    delete: (id: string) => apiClient.delete(`/hotels/${id}`),
    getManaged: () => apiClient.get('/hotels/manage/list'),
    approve: (id: string) => apiClient.patch(`/hotels/${id}/approve`),
    getAnalytics: (id: string) => apiClient.get(`/hotels/${id}/analytics`),
  },

  // Rooms methods
  rooms: {
    getByHotel: (hotelId: string) => apiClient.get(`/rooms/hotel/${hotelId}`),
    getById: (id: string) => apiClient.get(`/rooms/${id}`),
    create: (data: any) => apiClient.post('/rooms', data),
    update: (id: string, data: any) => apiClient.put(`/rooms/${id}`, data),
    delete: (id: string) => apiClient.delete(`/rooms/${id}`),
    createRatePlan: (roomId: string, data: any) => apiClient.post(`/rooms/${roomId}/rate-plans`, data),
    getRatePlans: (roomId: string) => apiClient.get(`/rooms/${roomId}/rate-plans`),
    updateRatePlan: (id: string, data: any) => apiClient.put(`/rooms/rate-plans/${id}`, data),
    deleteRatePlan: (id: string) => apiClient.delete(`/rooms/rate-plans/${id}`),
  },

  // Bookings methods
  bookings: {
    getMy: (params?: any) => apiClient.get('/bookings/my-bookings', { params }),
    getById: (id: string) => apiClient.get(`/bookings/${id}`),
    create: (data: any) => apiClient.post('/bookings', data),
    update: (id: string, data: any) => apiClient.put(`/bookings/${id}`, data),
    cancel: (id: string, reason?: string) => apiClient.post(`/bookings/${id}/cancel`, { reason }),
    getManaged: (params?: any) => apiClient.get('/bookings/manage/list', { params }),
    updateStatus: (id: string, status: string) => apiClient.patch(`/bookings/${id}/status`, { status }),
  },

  // Availability methods
  availability: {
    check: (params: any) => apiClient.get('/availability/check', { params }),
    getCalendar: (roomId: string, params?: any) => apiClient.get(`/availability/calendar/${roomId}`, { params }),
    update: (data: any) => apiClient.put('/availability', data),
    bulkUpdate: (data: any) => apiClient.put('/availability/bulk', data),
    block: (data: any) => apiClient.post('/availability/block', data),
    getStats: (hotelId: string) => apiClient.get(`/availability/stats/${hotelId}`),
  },

  // Reviews methods
  reviews: {
    getByHotel: (hotelId: string, params?: any) => apiClient.get(`/reviews/hotel/${hotelId}`, { params }),
    create: (data: any) => apiClient.post('/reviews', data),
    update: (id: string, data: any) => apiClient.put(`/reviews/${id}`, data),
    delete: (id: string) => apiClient.delete(`/reviews/${id}`),
    approve: (id: string) => apiClient.patch(`/reviews/${id}/approve`),
  },

  // Users methods
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data: any) => apiClient.put('/users/profile', data),
    getAll: (params?: any) => apiClient.get('/users', { params }),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    updateRole: (id: string, role: string) => apiClient.patch(`/users/${id}/role`, { role }),
    updateStatus: (id: string, isActive: boolean) => apiClient.patch(`/users/${id}/status`, { isActive }),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
    getStats: () => apiClient.get('/users/stats/overview'),
    assignHotel: (userId: string, hotelId: string) => apiClient.post(`/users/${userId}/assign-hotel/${hotelId}`),
  },

  // Content methods
  content: {
    getAll: (params?: any) => apiClient.get('/content', { params }),
    getBySlug: (slug: string) => apiClient.get(`/content/${slug}`),
    create: (data: any) => apiClient.post('/content', data),
    update: (id: string, data: any) => apiClient.put(`/content/${id}`, data),
    delete: (id: string) => apiClient.delete(`/content/${id}`),
  },

  // Promotions methods
  promotions: {
    getAll: (params?: any) => apiClient.get('/promotions', { params }),
    validate: (data: any) => apiClient.post('/promotions/validate', data),
    create: (data: any) => apiClient.post('/promotions', data),
    update: (id: string, data: any) => apiClient.put(`/promotions/${id}`, data),
    delete: (id: string) => apiClient.delete(`/promotions/${id}`),
  },

  // Payments methods
  payments: {
    createIntent: (bookingId: string) => apiClient.post('/payments/create-intent', { bookingId }),
    confirm: (paymentIntentId: string) => apiClient.post('/payments/confirm', { paymentIntentId }),
    getHistory: () => apiClient.get('/payments/history'),
  },
};

export default apiClient;