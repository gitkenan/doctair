import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MicroscopeIcon, BrainCircuit, History } from "lucide-react";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're coming back from an auth redirect
  useEffect(() => {
    const handleAuthRedirect = async () => {
      setIsLoading(true);
      // Check if we have hash parameters from an auth redirect
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      // If we detect access_token in the URL, redirect to dashboard
      if (accessToken) {
        navigate('/dashboard');
      }
      setIsLoading(false);
    };

    handleAuthRedirect();
  }, [navigate]);

  const handleGetStarted = async () => {
    setIsLoading(true);
    if (session) {
      // If already logged in, navigate to dashboard
      navigate('/dashboard');
    } else {
      // Handle login - replace this with actual Supabase auth
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
          Medical Image <span className="text-blue-600">AI Analysis</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
          Upload medical images and get instant AI-powered insights, diagnoses, and descriptions
          using advanced vision models.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Get Started'}
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/demo/dashboard')}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto mt-2 sm:mt-0"
          >
            Try Demo
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto mt-2 sm:mt-0"
            disabled={isLoading}
          >
            Learn More
          </Button>
        </div>
        
        {showAuthMessage && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-lg mx-auto">
            <p className="text-amber-800">
              Please connect your project to Supabase to enable authentication and database functionality.
              Look for the green Supabase button at the top right of the Lovable interface.
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">How It Works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <MicroscopeIcon className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Upload Medical Images</h3>
            <p className="text-gray-600 text-sm md:text-base">
              Securely upload X-rays, MRIs, CT scans, and other medical images for analysis.
            </p>
          </div>
          
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <BrainCircuit className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600 text-sm md:text-base">
              Get comprehensive descriptions, potential diagnoses, and expert insights powered by advanced AI models.
            </p>
          </div>
          
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 text-center sm:col-span-2 md:col-span-1 mx-auto sm:mx-0 max-w-sm sm:max-w-none">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <History className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Track Analysis History</h3>
            <p className="text-gray-600 text-sm md:text-base">
              Keep a record of all your previous analyses for reference and comparison over time.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 bg-gray-50 rounded-xl my-8 md:my-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Open Source & Secure</h2>
        <div className="max-w-3xl mx-auto">
          <ul className="space-y-6">
            <li className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                1
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-semibold">Connect with your Google account</h3>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Simple and secure authentication to keep your analysis history private.</p>
              </div>
            </li>
            
            <li className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                2
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-semibold">Upload a medical image</h3>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Support for X-rays, MRIs, CT scans, ultrasounds, and more.</p>
              </div>
            </li>
            
            <li className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                3
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-semibold">Receive structured analysis</h3>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Get detailed descriptions, potential diagnoses, and additional insights.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold">Medical AI Insight Viewer</h3>
              <p className="text-gray-400 mt-2">Open-source medical image analysis</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Use</a>
              <a href="https://github.com" className="text-gray-400 hover:text-white">GitHub</a>
            </div>
          </div>
          <div className="mt-6 md:mt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>Disclaimer: This tool is not a substitute for professional medical advice, diagnosis, or treatment.</p>
            <p className="mt-2"> {new Date().getFullYear()} Medical AI Insight Viewer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
