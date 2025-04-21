
export interface AnalysisResultType {
  description: string;
  diagnosis: string;
  extra_comments: string;
  timestamp: string;
}

export interface UserHistoryItem {
  id: string;
  userId: string;
  imageUrl?: string;
  imageType: string;
  result: AnalysisResultType;
  createdAt: string;
}
