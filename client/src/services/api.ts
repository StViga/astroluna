import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, AuthTokens } from '@/types/auth';
import { toast } from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'astroluna_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'astroluna_refresh_token';
  private static readonly TOKEN_EXPIRES_KEY = 'astroluna_token_expires';

  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    
    const expiresAt = Date.now() + (tokens.expires_in * 1000);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expiresAt) return true;
    
    return Date.now() > parseInt(expiresAt);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  static hasValidToken(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired();
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    
    if (token && !TokenManager.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Add client info
    config.headers['X-Client-Version'] = (import.meta.env && import.meta.env.VITE_APP_VERSION) || '1.0.0';
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Attempt to refresh token
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });
        
        if (refreshResponse.data.success) {
          const newTokens: AuthTokens = {
            access_token: refreshResponse.data.access_token,
            refresh_token: refreshToken, // Keep existing refresh token
            expires_in: refreshResponse.data.expires_in,
          };
          
          TokenManager.setTokens(newTokens);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        TokenManager.clearTokens();
        
        // Redirect to login or dispatch logout action
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }
    
    // Handle API errors
    const errorData = error.response.data as ApiResponse;
    
    // Don't show toast for expected errors (4xx that are handled by components)
    const shouldShowToast = error.response.status >= 500 || 
      (error.response.status === 429); // Rate limiting
    
    if (shouldShowToast && errorData?.error) {
      toast.error(errorData.error);
    }
    
    return Promise.reject(error);
  }
);

// Utility function to generate request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generic API methods
class ApiService {
  // GET request
  static async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  static async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  static async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  static async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH request
  static async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File upload
  static async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download file
  static async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    try {
      const response = await api.get(url, {
        ...config,
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle errors consistently
  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiResponse;
      
      if (errorData?.error) {
        return new Error(errorData.error);
      }
      
      if (error.response?.status) {
        switch (error.response.status) {
          case 400:
            return new Error('Bad request. Please check your input.');
          case 401:
            return new Error('Unauthorized. Please log in again.');
          case 403:
            return new Error('Access denied.');
          case 404:
            return new Error('Resource not found.');
          case 429:
            return new Error('Too many requests. Please try again later.');
          case 500:
            return new Error('Internal server error. Please try again.');
          default:
            return new Error(`Request failed with status ${error.response.status}`);
        }
      }
      
      return new Error(error.message || 'Network error occurred');
    }
    
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Abort controller for cancelling requests
  static createAbortController(): AbortController {
    return new AbortController();
  }
}

// Export token manager for use in auth stores
export { TokenManager };

// Export configured axios instance for advanced usage
export { api };

// Export main API service
export default ApiService;