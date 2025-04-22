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
    <Card className="w-full shadow-md border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white font-bold">Analysis Results</CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs font-medium px-3 py-1">
            {formattedDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {imageUrl && (
            <div className="p-6 border-r border-gray-100">
              <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">Analyzed Image</h3>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-inner">
                <img 
                  src={imageUrl} 
                  alt="Analyzed medical image" 
                  className="w-full h-auto max-h-72 object-contain rounded mx-auto"
                />
              </div>
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">Analysis</h3>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <Markdown 
                options={{
                  overrides: {
                    p: { props: { className: 'mb-4 leading-relaxed' } },
                    h1: { props: { className: 'text-2xl font-bold mb-4 text-gray-800' } },
                    h2: { props: { className: 'text-xl font-bold mb-3 text-gray-800' } },
                    h3: { props: { className: 'text-lg font-bold mb-2 text-gray-800' } },
                    ul: { props: { className: 'list-disc pl-5 mb-4 space-y-2' } },
                    ol: { props: { className: 'list-decimal pl-5 mb-4 space-y-2' } },
                    li: { props: { className: 'mb-1' } },
                    a: { props: { className: 'text-blue-600 hover:underline', target: '_blank', rel: 'noopener noreferrer' } },
                    blockquote: { props: { className: 'border-l-4 border-blue-200 pl-4 italic my-4 text-gray-600' } },
                    code: { props: { className: 'bg-gray-100 rounded px-1 py-0.5' } },
                    pre: { props: { className: 'bg-gray-100 rounded p-3 overflow-auto my-4' } },
                    strong: { props: { className: 'font-bold text-blue-700' } },
                  }
                }}
                className="prose prose-sm max-w-none text-gray-700"
              >
                {result.content}
              </Markdown>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <p className="text-xs text-gray-500 italic text-center">
            Disclaimer: This AI-generated analysis is not a substitute for professional medical advice, 
            diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResult;
