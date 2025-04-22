import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResultType } from "@/types";

interface AnalysisResultProps {
  result: AnalysisResultType;
  imageUrl: string | null;
}

const AnalysisResult = ({ result, imageUrl }: AnalysisResultProps) => {
  const formattedDate = new Date(result.timestamp).toLocaleString();
  
  return (
    <Card className="w-full">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <div className="flex justify-between items-center">
          <CardTitle>Analysis Results</CardTitle>
          <Badge variant="outline" className="text-xs">
            {formattedDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {imageUrl && (
            <div className="p-6 border-r border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Analyzed Image</h3>
              <div className="bg-gray-50 rounded-lg p-2">
                <img 
                  src={imageUrl} 
                  alt="Analyzed medical image" 
                  className="w-full h-auto max-h-72 object-contain rounded"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Analysis</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{result.content}</p>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 italic">
            Disclaimer: This AI-generated analysis is not a substitute for professional medical advice, 
            diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResult;
