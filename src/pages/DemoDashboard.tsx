import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import AnalysisResult from "@/components/AnalysisResult";
import Header from "@/components/Header";
import type { AnalysisResultType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DemoDashboard = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const analyzeDemoImage = async () => {
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
      // Call the Vercel serverless function to analyze the image
      const response = await fetch('/api/analyze-demo-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageBase64: imagePreview as string,
          imageType: selectedImage.type || "unknown"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze image: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
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
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">Sidra Demo</h1>
            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">DEMO</span>
          </div>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              Exit Demo
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Medical Image Analysis <span className="text-blue-600">Demo</span></h1>
        <p className="text-gray-600 mb-10 max-w-3xl">
          This demo allows you to try the AI-powered medical image analysis without creating an account.
          Upload a medical image to receive AI analysis and insights.
        </p>
        
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
                  onClick={analyzeDemoImage}
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
                      Analyze Image (Demo)
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

        <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-4xl mx-auto">
          <h3 className="font-semibold text-amber-800 mb-2">Demo Mode Limitations</h3>
          <p className="text-amber-800">
            In demo mode, your analysis history is not saved. Create an account to save your analyses and access them later.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200"
            onClick={() => navigate('/')}
          >
            Return to Sign Up
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DemoDashboard;
