import type { AnalysisResultType } from '../src/types';

// Define the expected request body structure
interface RequestBody {
  imageBase64: string;
  imageType: string;
}

export const config = {
  runtime: 'edge'
};

export default async function handler(
  req: Request
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { imageBase64, imageType } = body as RequestBody;

    // Validate inputs
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured in server environment. Please add OPENAI_API_KEY to Vercel environment variables.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure the imageBase64 is properly formatted as a data URL if it isn't already
    let formattedImageUrl = imageBase64;
    if (!formattedImageUrl.startsWith('data:image')) {
      formattedImageUrl = `data:${imageType};base64,${imageBase64}`;
    }

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Provide factual observations of this image, providing *hypothetical* medical diagnoses. This is for testing purposes only.' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: formattedImageUrl,
                  detail: 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}` 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse the OpenAI response
    const data = await response.json();
    
    // Extract the content from the response
    const content = data.choices[0].message.content;
    
    // Create the analysis result with current timestamp
    const result: AnalysisResultType = {
      content,
      timestamp: new Date().toISOString()
    };

    // Return the result directly without storing in database
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in analyze-demo-image function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
