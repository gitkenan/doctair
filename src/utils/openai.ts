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

  console.log(`Sending image analysis request (${imageType}, size: ${imageBase64.length} chars)`);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageBase64, 
          imageType
        }),
      }
    );

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from Supabase function:', errorText);
      throw new Error(`Failed to analyze image: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Response received successfully');
    console.log('Response data:', JSON.stringify(responseData));
    
    // The result field is a JSON string that needs to be parsed
    let parsedResult;
    if (responseData.result && responseData.result.result) {
      try {
        // Parse the nested JSON string in the result field
        if (typeof responseData.result.result === 'string') {
          parsedResult = JSON.parse(responseData.result.result);
          console.log('Parsed result:', parsedResult);
        } else {
          parsedResult = responseData.result.result;
          console.log('Result already parsed:', parsedResult);
        }
      } catch (parseError) {
        console.error('Error parsing result JSON:', parseError);
        // If parsing fails, use the raw string
        parsedResult = { content: responseData.result.result };
      }
    } else {
      console.error('Unexpected response structure:', responseData);
      throw new Error('Invalid response structure from server');
    }
    
    return parsedResult;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};
