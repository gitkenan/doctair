
import type { AnalysisResultType } from "@/types";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const analyzeImage = async (
  imageBase64: string,
  imageType: string
): Promise<AnalysisResultType> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64, imageType }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  const { result } = await response.json();
  return result;
};
