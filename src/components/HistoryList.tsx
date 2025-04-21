import { useEffect, useState } from "react";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import type { UserHistoryItem } from "@/types";

const HistoryList = () => {
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('users_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistory(data);
      }
    };

    fetchHistory();
  }, [supabase]);

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
          <p className="text-gray-600">
            Your analysis history will appear here once you analyze your first image.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <HistoryItem key={item.id} {...item} />
          ))}
        </div>
      )}
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
