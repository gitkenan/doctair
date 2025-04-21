
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Check localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey && !apiKey) {
      onApiKeyChange(storedKey);
    }
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type={showApiKey ? "text" : "password"}
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowApiKey(!showApiKey)}
        >
          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Your API key is stored locally in your browser and is only used for processing your requests.
      </p>
    </div>
  );
};

export default ApiKeyInput;
