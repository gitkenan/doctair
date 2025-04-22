
import { Button } from "@/components/ui/button";
import { MicroscopeIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
            <MicroscopeIcon className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">Doctair</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-1">
              <LogOut className="h-4 w-4 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
