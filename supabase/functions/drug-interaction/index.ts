import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error("Valid query text is required.");
    }

    console.log('Processing drug query:', query);

    // For local development, use host.docker.internal instead of 127.0.0.1
    // This allows the Docker container to reach your local Python server
    const isLocal = Deno.env.get("DENO_DEPLOYMENT_ID") === undefined;
    const pythonApiUrl = isLocal 
      ? 'http://host.docker.internal:5000/interaction'
      : 'http://127.0.0.1:5000/interaction';

    console.log('Calling Python API at:', pythonApiUrl);

    const interactionResponse = await fetch(pythonApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query }),
    });

    if (!interactionResponse.ok) {
      const errorText = await interactionResponse.text();
      console.error('Python API Error:', errorText);
      throw new Error(`Python API Error (${interactionResponse.status}): ${errorText}`);
    }

    const data = await interactionResponse.json();
    console.log('Python API response:', data);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        debug: {
          denoDeploymentId: Deno.env.get("DENO_DEPLOYMENT_ID"),
          environment: Deno.env.get("DENO_DEPLOYMENT_ID") ? 'production' : 'local'
        }
      }),
      { 
        status: error.message.includes('Python API Error') ? 502 : 400,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});