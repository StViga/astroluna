import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, initialized, initializeAuth } = useAuth();

  // Initialize auth on app start
  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  // Determine layout type based on route
  const isAuthPage = location.pathname.startsWith('/auth') || 
                    location.pathname === '/login' || 
                    location.pathname === '/register' || 
                    location.pathname === '/forgot-password' || 
                    location.pathname === '/reset-password' ||
                    location.pathname === '/verify-email';

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isPublicPage = location.pathname === '/' || 
                      location.pathname.startsWith('/services') ||
                      location.pathname.startsWith('/pricing') ||
                      location.pathname.startsWith('/about') ||
                      location.pathname.startsWith('/contact');

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle authentication redirects
  useEffect(() => {
    if (initialized && isDashboard && !isAuthenticated) {
      navigate('/login');
    }
  }, [initialized, isDashboard, isAuthenticated, navigate]);

  // Show loading state during initialization
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading AstroLuna...</p>
        </div>
      </div>
    );
  }

  // Auth pages layout (login, register, etc.)
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex">
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md lg:max-w-2xl">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 lg:p-8 my-8">
              {children || <Outlet />}
            </div>
          </div>
        </div>
        
        {/* Right side with branding */}
        <div className="hidden xl:block relative w-0 flex-1">
          <div className="absolute inset-0 h-full w-full object-cover bg-gradient-aurora opacity-90"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h1 className="text-6xl font-bold mb-6">🌟</h1>
              <h2 className="text-4xl font-bold mb-4">AstroLuna</h2>
              <p className="text-xl opacity-90 mb-8">
                AI-Powered Astrology Platform
              </p>
              <div className="space-y-4 text-lg opacity-80">
                <div className="flex items-center justify-center">
                  <span className="mr-3">✨</span>
                  Personalized Natal Charts
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3">💫</span>
                  Compatibility Analysis
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3">🔮</span>
                  AI-Generated Insights
                </div>
              </div>
            </div>
          </div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    );
  }

  // Dashboard layout (authenticated users)
  if (isDashboard) {
    // Show loading while redirecting unauthenticated users
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Redirecting...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-cosmic-stars bg-cover bg-center bg-fixed relative">
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10">
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          
          <div className="flex">
            <Sidebar 
              open={sidebarOpen} 
              setOpen={setSidebarOpen} 
            />
            
            <main className="flex-1 lg:pl-72">
              <div className="py-6">
                {children || <Outlet />}
              </div>
            </main>
          </div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    );
  }

  // Public pages layout (homepage, services, etc.)
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {children || <Outlet />}
      </main>
      
      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

export default Layout;