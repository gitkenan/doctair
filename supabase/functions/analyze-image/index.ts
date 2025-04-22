import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalysisResultType {
  content: string;
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
    console.log('Available environment variables:', Object.keys(Deno.env.toObject()))
    console.log('SUPABASE_URL available:', !!Deno.env.get('SUPABASE_URL'))
    console.log('SUPABASE_ANON_KEY available:', !!Deno.env.get('SUPABASE_ANON_KEY'))
    console.log('OPENAI_API_KEY available:', !!Deno.env.get('OPENAI_API_KEY'))
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.log('⚠️ Using TEST_MODE with fallback key for debugging')
      // This is just for debugging - remove after confirming the function works
      const fallbackKey = 'TEST_MODE_ACTIVE' // Not a real key, just for error path testing
      if (!fallbackKey) {
        throw new Error('OpenAI API key not configured in server environment. Please add OPENAI_API_KEY to Edge Function secrets.')
      }
      console.log('Using fallback key for testing')
      return new Response(
        JSON.stringify({ error: 'TEST MODE: OpenAI API key not found, but continuing for debugging' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
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

    console.log('Calling OpenAI API')
    // Make request to OpenAI API with a simple text response
    try {
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
      
      // Parse the response to get the text content
      let result: AnalysisResultType
      try {
        const content = data.choices[0].message.content
        console.log('Content received:', content)
        
        result = {
          content,
          timestamp: new Date().toISOString()
        }
        console.log('Successfully parsed result')
      } catch (error) {
        console.error('Error parsing result:', error)
        console.error('API response:', JSON.stringify(data))
        throw new Error('Failed to parse analysis results')
      }

      // Store the result in the database
      console.log('Storing result in database')
      
      // Get the user ID from the JWT token
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('User ID:', user.id)
      
      const { data: historyEntry, error: dbError } = await supabaseClient
        .from('users_history')
        .insert({
          user_id: user.id,
          image_type: imageType,
          result,
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      console.log('Database entry:', JSON.stringify(historyEntry))
      console.log('Result structure being returned:', JSON.stringify({ result: historyEntry }))
      
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
