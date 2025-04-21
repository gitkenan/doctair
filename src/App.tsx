import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider, useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const queryClient = new QueryClient();

const App = () => (
  <SessionContextProvider supabaseClient={supabase}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SessionContextProvider>
);

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const location = useLocation();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // First check if we already have a session
      if (session) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // Check if we have an access token in the URL hash
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        // If we have tokens in the URL, set the session
        try {
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            setIsAuthenticated(true);
          } else {
            // Get the session another way
            const { data } = await supabase.auth.getSession();
            setIsAuthenticated(!!data.session);
          }
        } catch (error) {
          console.error('Error setting session:', error);
          setIsAuthenticated(false);
        }
      } else {
        // No tokens in URL, check if we have a session in storage
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [session, location.hash, supabase.auth]);

  if (isLoading) {
    // Show a loading indicator
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default App;
