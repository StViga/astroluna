import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '@/types/auth';
import AuthService from '@/services/authMock';
import { TokenManager } from '@/services/api';
import { toast } from 'react-hot-toast';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (data: { email: string; language?: string }) => Promise<void>;
  resetPassword: (data: { token: string; password: string }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => Promise<void>;
  checkAuthStatus: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: false,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.login(credentials);
          
          // Set tokens
          TokenManager.setTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            expires_in: response.expires_in,
          });
          
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Welcome back!');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null 
          });
          throw error;
        }
      },

      // Register action
      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.register(data);
          
          // Set tokens
          TokenManager.setTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            expires_in: response.expires_in,
          });
          
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Account created successfully!');
          
          // Show verification reminder if not verified
          if (!response.user.is_verified) {
            setTimeout(() => {
              toast('Please check your email to verify your account.', {
                icon: '📧',
                duration: 5000,
              });
            }, 2000);
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed',
            isAuthenticated: false,
            user: null 
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.logout();
        } catch (error) {
          console.warn('Server logout failed:', error);
        } finally {
          // Clear tokens and state regardless of server response
          TokenManager.clearTokens();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Logged out successfully');
        }
      },

      // Logout from all devices
      logoutAll: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.logoutAll();
          TokenManager.clearTokens();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Logged out from all devices');
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Update profile
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await AuthService.updateProfile(data);
          
          set({ 
            user: updatedUser, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Profile updated successfully');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Profile update failed' 
          });
          throw error;
        }
      },

      // Change password
      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.changePassword(data);
          
          set({ isLoading: false, error: null });
          toast.success('Password changed successfully');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Password change failed' 
          });
          throw error;
        }
      },

      // Verify email
      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await AuthService.verifyEmail(token);
          
          set({ 
            user: { ...get().user, ...user, is_verified: true },
            isLoading: false,
            error: null 
          });
          
          toast.success('Email verified successfully! 🎉');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Email verification failed' 
          });
          throw error;
        }
      },

      // Resend verification email
      resendVerification: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.resendVerification(email);
          
          set({ isLoading: false, error: null });
          toast.success('Verification email sent! Check your inbox.');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to send verification email' 
          });
          throw error;
        }
      },

      // Forgot password
      forgotPassword: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.forgotPassword(data);
          
          set({ isLoading: false, error: null });
          toast.success('Password reset link sent to your email');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to send reset email' 
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.resetPassword(data);
          
          set({ isLoading: false, error: null });
          toast.success('Password reset successfully! You can now log in.');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Password reset failed' 
          });
          throw error;
        }
      },

      // Delete account
      deleteAccount: async (password) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.deleteAccount(password);
          
          TokenManager.clearTokens();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Account deleted successfully');
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Account deletion failed' 
          });
          throw error;
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ user, isAuthenticated: true }),

      // Initialize auth on app start
      initializeAuth: async () => {
        if (get().initialized) return;
        
        set({ isLoading: true });
        
        try {
          // Check if we have valid tokens
          if (TokenManager.hasValidToken()) {
            // Fetch current user profile
            const user = await AuthService.getProfile();
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              initialized: true,
              error: null 
            });
          } else {
            // Clear any invalid tokens
            TokenManager.clearTokens();
            
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              initialized: true,
              error: null 
            });
          }
        } catch (error) {
          console.warn('Auth initialization failed:', error);
          
          // Clear tokens on error
          TokenManager.clearTokens();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            initialized: true,
            error: null 
          });
        }
      },

      // Check auth status
      checkAuthStatus: () => {
        const state = get();
        return state.isAuthenticated && TokenManager.hasValidToken();
      },
    }),
    {
      name: 'astroluna-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user data, not loading states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        // This function is called when store is rehydrated
        return (state, error) => {
          if (error) {
            console.error('Auth store rehydration failed:', error);
          } else if (state) {
            // Verify tokens are still valid after rehydration
            if (state.isAuthenticated && !TokenManager.hasValidToken()) {
              // Tokens are invalid, clear auth state
              state.user = null;
              state.isAuthenticated = false;
            }
          }
        };
      },
    }
  )
);

// Utility hook for auth status
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    needsVerification: store.user ? !store.user.is_verified : false,
    hasValidSession: store.checkAuthStatus(),
  };
};