import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResultType } from "@/types";
import Markdown from 'markdown-to-jsx';

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
            <Markdown 
              options={{
                overrides: {
                  p: { props: { className: 'mb-4' } },
                  h1: { props: { className: 'text-2xl font-bold mb-4' } },
                  h2: { props: { className: 'text-xl font-bold mb-3' } },
                  h3: { props: { className: 'text-lg font-bold mb-2' } },
                  ul: { props: { className: 'list-disc pl-5 mb-4' } },
                  ol: { props: { className: 'list-decimal pl-5 mb-4' } },
                  li: { props: { className: 'mb-1' } },
                  a: { props: { className: 'text-blue-600 hover:underline', target: '_blank', rel: 'noopener noreferrer' } },
                  blockquote: { props: { className: 'border-l-4 border-gray-300 pl-4 italic my-4' } },
                  code: { props: { className: 'bg-gray-100 rounded px-1 py-0.5' } },
                  pre: { props: { className: 'bg-gray-100 rounded p-3 overflow-auto my-4' } },
                }
              }}
              className="prose prose-sm max-w-none text-gray-700"
            >
              {result.content}
            </Markdown>
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
