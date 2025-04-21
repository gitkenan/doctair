
// This file will contain the OpenAI API utility functions
// When we integrate Supabase, we would move this logic to an Edge Function for security

import type { AnalysisResultType } from "@/types";

/**
 * Analyzes a medical image using OpenAI's vision model
 * Note: In production, this would be a Supabase Edge Function to keep the API key secure
 */
export const analyzeImage = async (
  imageBase64: string,
  apiKey: string
): Promise<AnalysisResultType> => {
  try {
    // Structure the prompt for the AI to return the correct JSON format
    const prompt = `
      Analyze this medical image and provide detailed information in the following JSON structure:
      {
        "description": "Detailed description of what you see in the image",
        "diagnosis": "Potential diagnosis or normal findings",
        "extra_comments": "Additional insights, recommendations, or observations"
      }
      
      Ensure your response is ONLY valid JSON with these three fields.
      Be professional, thorough, and medically accurate.
    `;

    // In a production app, this would be a Supabase Edge Function call
    // For now, we're just setting up the structure
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response to get the JSON structure
    // The AI model should return a JSON string that we need to parse
    let result: AnalysisResultType;
    
    try {
      // Try to parse the JSON from the response text
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/({[\s\S]*})/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      result = JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new Error("Failed to parse analysis results");
    }
    
    // Add timestamp
    result.timestamp = new Date().toISOString();
    
    return result;
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};
