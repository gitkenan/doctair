
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import type { AnalysisResultType } from "@/types";

const HistoryList = () => {
  // In production with Supabase, this would fetch from the database
  // For now, we'll show a message about connecting to Supabase
  
  return (
    <div className="space-y-4">
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect to Supabase</h3>
        <p className="text-gray-600 mb-4">
          To enable history functionality, please connect your project to Supabase using the green button 
          in the top-right corner of the Lovable interface.
        </p>
        <p className="text-sm text-gray-500">
          Once connected, your analysis history will be securely stored and displayed here.
        </p>
      </div>
      
      {/* Mock history items for design preview - these would come from Supabase in production */}
      <div className="opacity-50 pointer-events-none">
        <p className="text-sm text-gray-500 mb-2">Preview of history functionality:</p>
        
        <div className="space-y-4">
          <HistoryItem 
            result={{
              description: "Chest X-ray showing clear lung fields with no evidence of consolidation.",
              diagnosis: "Normal chest X-ray with no acute findings.",
              extra_comments: "No follow-up needed at this time.",
              timestamp: new Date().toISOString()
            }}
            imageType="Chest X-ray"
          />
          
          <HistoryItem 
            result={{
              description: "Brain MRI showing normal brain parenchyma without evidence of mass, hemorrhage, or infarct.",
              diagnosis: "Normal brain MRI.",
              extra_comments: "Recommend clinical correlation with patient symptoms.",
              timestamp: new Date(Date.now() - 86400000).toISOString()
            }}
            imageType="Brain MRI"
          />
        </div>
      </div>
    </div>
  );
};

interface HistoryItemProps {
  result: AnalysisResultType;
  imageType: string;
}

const HistoryItem = ({ result, imageType }: HistoryItemProps) => {
  const date = new Date(result.timestamp);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{imageType}</h3>
            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{result.diagnosis}</p>
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {formattedTime}
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {imageType}
          </Badge>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryList;
