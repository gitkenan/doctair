export interface AnalysisResultType {
  content: string;
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
