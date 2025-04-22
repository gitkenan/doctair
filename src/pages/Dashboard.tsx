import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";
import AnalysisResult from "@/components/AnalysisResult";
import HistoryList from "@/components/HistoryList";
import Header from "@/components/Header";
import type { AnalysisResultType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { analyzeImage as analyzeImageApi } from "@/utils/openai";
import { PlusCircle, UploadCloud } from "lucide-react";

const Dashboard = () => {
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

  const analyzeImage = async () => {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Medical Image Analysis</h1>
        <p className="text-gray-600 mb-10 max-w-3xl">Upload medical images to receive AI-powered analysis and insights.</p>
        
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-10 mx-auto">
            <TabsTrigger value="analyze" className="text-base">Analyze Image</TabsTrigger>
            <TabsTrigger value="history" className="text-base">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="space-y-10">
            <Card className="max-w-4xl mx-auto border-0 shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="bg-blue-600 text-white p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-4">Upload Medical Image</h2>
                  <p className="opacity-90 mb-6">Our AI can analyze X-rays, MRIs, CT scans, and other medical images.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center"><div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-3 font-bold text-sm">1</div> Select or drag an image file</li>
                    <li className="flex items-center"><div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-3 font-bold text-sm">2</div> Click analyze to process</li>
                    <li className="flex items-center"><div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-3 font-bold text-sm">3</div> Review the detailed results</li>
                  </ul>
                </div>
                <div className="p-8 bg-white">
                  <div className="h-full flex flex-col">
                    <div className="flex-grow">
                      <ImageUpload onImageUpload={handleImageUpload} imagePreview={imagePreview} />
                    </div>
                    <Button 
                      disabled={!selectedImage || isAnalyzing} 
                      onClick={analyzeImage}
                      className="w-full mt-6"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="mr-2 animate-spin">⏳</span>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-5 w-5" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            {analysisResult && (
              <Card className="max-w-4xl mx-auto border-0 shadow-lg overflow-hidden mt-8">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-generated analysis of your medical image</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <AnalysisResult result={analysisResult} imageUrl={imagePreview} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="max-w-4xl mx-auto border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Analysis History
                </CardTitle>
                <CardDescription className="text-blue-100">
                  View your previous medical image analyses and results.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
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
