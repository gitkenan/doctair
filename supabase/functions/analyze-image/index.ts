import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalysisResultType {
  description: string;
  diagnosis: string;
  extra_comments: string;
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Function started')
    const body = await req.json()
    console.log('Request body received')
    console.log('Request body keys:', Object.keys(body))
    console.log('Image type:', body.imageType)
    console.log('Image base64 length:', body.imageBase64 ? body.imageBase64.length : 0)
    const { imageBase64, imageType } = body

    // Validate inputs
    if (!imageBase64) {
      throw new Error('imageBase64 is required')
    }

    console.log('Creating Supabase client')
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get OpenAI API key from Edge Function secrets
    console.log('Getting OpenAI API key')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured in server environment')
    }
    console.log('Server API key found')

    // Ensure the imageBase64 is properly formatted as a data URL if it isn't already
    // If it's already a data URL (starts with data:image), use it as is
    // Otherwise, assume it's a raw base64 string and format it properly
    let formattedImageUrl = imageBase64
    if (!formattedImageUrl.startsWith('data:image')) {
      formattedImageUrl = `data:${imageType};base64,${imageBase64}`
    }
    
    console.log('Image URL formatted')

    // Define the structured output format for the OpenAI API
    const responseFormat = {
      type: "json_object",
      json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          diagnosis: { type: "string" },
          extra_comments: { type: "string" },
          timestamp: { type: "string" }
        },
        required: ["description", "diagnosis", "extra_comments", "timestamp"]
      }
    }

    console.log('Calling OpenAI API')
    // Make request to OpenAI API with the updated model and structured output
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: 'Analyze this MEDICAL IMAGE (provide factual observations), there is a disclaimer about medical compliance and this is only an AI analysis for assistance purposes.' 
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
          max_tokens: 1000,
          response_format: responseFormat
        }),
      })

      console.log('OpenAI API response status:', response.status)
      console.log('OpenAI API response headers:', Object.fromEntries([...response.headers.entries()]))
      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error response:', errorText)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      console.log('Parsing OpenAI API response')
      const data = await response.json()
      console.log('OpenAI API response received')
      
      // Parse the response to get the JSON structure
      let result: AnalysisResultType
      try {
        const content = data.choices[0].message.content
        console.log('Content received:', content)
        
        // Try to parse the content as JSON
        try {
          result = JSON.parse(content)
        } catch (parseError) {
          // If direct parsing fails, try to extract JSON from the text
          const jsonMatch = content.match(/({[\s\S]*})/)
          const jsonString = jsonMatch ? jsonMatch[0] : content
          result = JSON.parse(jsonString)
        }
        
        result.timestamp = new Date().toISOString()
        console.log('Successfully parsed result')
      } catch (error) {
        console.error('Error parsing result:', error)
        console.error('API response:', JSON.stringify(data))
        throw new Error('Failed to parse analysis results')
      }

      // Store the result in the database
      console.log('Storing result in database')
      const { data: historyEntry, error: dbError } = await supabaseClient
        .from('users_history')
        .insert({
          image_type: imageType,
          result,
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      console.log('Function completed successfully')
      return new Response(
        JSON.stringify({ result: historyEntry }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (openaiError) {
      console.error('OpenAI API call error:', openaiError)
      throw openaiError
    }
  } catch (error) {
    console.error('Error in analyze-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
