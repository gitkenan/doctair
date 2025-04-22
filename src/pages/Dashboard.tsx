import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyInput from "@/components/ApiKeyInput";
import ImageUpload from "@/components/ImageUpload";
import AnalysisResult from "@/components/AnalysisResult";
import HistoryList from "@/components/HistoryList";
import Header from "@/components/Header";
import type { AnalysisResultType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { analyzeImage as analyzeImageApi } from "@/utils/openai";

const Dashboard = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset any previous analysis
    setAnalysisResult(null);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    // Store in localStorage for convenience
    if (key) {
      localStorage.setItem("openai_api_key", key);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  };

  const analyzeImage = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "Image Required",
        description: "Please upload a medical image to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Call the Supabase Edge Function to analyze the image
      const result = await analyzeImageApi(
        imagePreview as string,
        selectedImage.type || "unknown"
      );
      
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Image has been successfully analyzed.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your image. Please try again.",
        variant: "destructive"
      });
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Medical Image Analysis</h1>
        
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="analyze">Analyze Image</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>OpenAI API Key</CardTitle>
                  <CardDescription>
                    Enter your OpenAI API key to enable image analysis. Your key is used only for processing and is not permanently stored.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upload Medical Image</CardTitle>
                  <CardDescription>
                    Upload an X-ray, MRI, CT scan, or other medical image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload onImageUpload={handleImageUpload} imagePreview={imagePreview} />
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center">
              <Button 
                disabled={!apiKey || !selectedImage || isAnalyzing} 
                onClick={analyzeImage}
                className="w-full max-w-md"
                size="lg"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </Button>
            </div>
            
            {analysisResult && (
              <AnalysisResult result={analysisResult} imageUrl={imagePreview} />
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>
                  View your previous medical image analyses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
