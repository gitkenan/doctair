
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
    const { imageBase64, imageType } = await req.json()

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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `
      Analyze this medical image and provide detailed information in the following JSON structure:
      {
        "description": "Detailed description of what you see in the image",
        "diagnosis": "Potential diagnosis or normal findings",
        "extra_comments": "Additional insights, recommendations, or observations"
      }
      
      Ensure your response is ONLY valid JSON with these three fields.
      Be professional, thorough, and medically accurate.
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Parse the response to get the JSON structure
    let result: AnalysisResultType
    try {
      const content = data.choices[0].message.content
      const jsonMatch = content.match(/({[\s\S]*})/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      result = JSON.parse(jsonString)
      result.timestamp = new Date().toISOString()
    } catch (error) {
      throw new Error('Failed to parse analysis results')
    }

    // Store the result in the database
    const { data: historyEntry, error: dbError } = await supabaseClient
      .from('users_history')
      .insert({
        image_type: imageType,
        result,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ result: historyEntry }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
