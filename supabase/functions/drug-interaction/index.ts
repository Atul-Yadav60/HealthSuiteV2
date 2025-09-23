import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { combinations } from "https://deno.land/x/combinatorics@1.0.1/mod.ts";

// Define the structure of the AI model's response
interface NerEntity {
  entity_group: string;
  score: number;
  word: string;
  start: number;
  end: number;
}

// Helper function to call the Hugging Face Inference API
async function extractDrugsWithNer(text: string, modelId: string, hfToken: string): Promise<string[]> {
  console.log(`Extracting drugs from text: "${text}" using model: ${modelId}`);
  
  const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: text })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Hugging Face API Error:", errorBody);
    throw new Error(`Hugging Face API failed with status ${response.status}: ${errorBody}`);
  }

  const entities: NerEntity[] = await response.json();
  console.log("Raw NER entities:", entities);
  
  const drugs = entities
    .filter(ent => ent.entity_group === 'DRUG')
    .map(ent => ent.word.toLowerCase().trim());
    
  const uniqueDrugs = [...new Set(drugs)];
  console.log("Extracted unique drugs:", uniqueDrugs);
  
  return uniqueDrugs;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    })
  }

  try {
    console.log("=== Drug Interaction Function Started ===");
    
    // Parse request body
    const body = await req.json();
    console.log("Request body:", body);
    
    const { query } = body;
    if (!query) {
      throw new Error("Query text is required.");
    }

    // Check environment variables
    const hfModelId = Deno.env.get('HF_MODEL_ID');
    const hfToken = Deno.env.get('HF_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log("Environment check:", {
      hfModelId: hfModelId ? "✓ Set" : "✗ Missing",
      hfToken: hfToken ? "✓ Set" : "✗ Missing",
      supabaseUrl: supabaseUrl ? "✓ Set" : "✗ Missing",
      supabaseServiceKey: supabaseServiceKey ? "✓ Set" : "✗ Missing",
    });

    if (!hfModelId || !hfToken) {
      throw new Error("Hugging Face credentials (HF_MODEL_ID, HF_ACCESS_TOKEN) are not configured.");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not configured.");
    }

    // 1. Extract drug names using your hosted AI model
    let drugs: string[];
    try {
      drugs = await extractDrugsWithNer(query, hfModelId, hfToken);
    } catch (error) {
      console.error("Drug extraction failed:", error);
      throw new Error(`Drug extraction failed: ${error.message}`);
    }

    if (drugs.length < 2) {
      console.log("Insufficient drugs found for interaction check:", drugs);
      return new Response(JSON.stringify({ 
        detected_drugs: drugs,
        interactions: [{ message: "At least two drugs must be identified to check for interactions." }]
      }), { 
        headers: { 
          "Content-Type": "application/json", 
          'Access-Control-Allow-Origin': '*' 
        },
        status: 200 
      });
    }

    // 2. Create a Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Generate all unique pairs of drugs
    const drugPairs = combinations(drugs, 2);
    console.log("Drug pairs to check:", drugPairs);
    
    const interactions = [];

    // 4. For each pair, query your drug_interaction table
    for (const pair of drugPairs) {
      const [drugA, drugB] = pair;
      console.log(`Checking interaction between: ${drugA} and ${drugB}`);
      
      try {
        // Simplified query approach
        const { data, error } = await supabaseAdmin
          .from('drug_interaction')
          .select('*')
          .or(`DrugName_A.eq.${drugA},DrugName_B.eq.${drugA}`)
          .or(`DrugName_A.eq.${drugB},DrugName_B.eq.${drugB}`)
          .limit(10); // Get more results to filter manually

        if (error) {
          console.error("Database query error:", error);
          throw error;
        }

        // Filter results manually for exact pairs
        const exactMatch = data?.find(row => 
          (row.DrugName_A === drugA && row.DrugName_B === drugB) ||
          (row.DrugName_A === drugB && row.DrugName_B === drugA)
        );

        if (exactMatch) {
          console.log(`Found interaction: ${drugA} + ${drugB}`);
          interactions.push(exactMatch);
        } else {
          console.log(`No interaction found: ${drugA} + ${drugB}`);
          interactions.push({
            DrugName_A: drugA,
            DrugName_B: drugB,
            Interaction_Details: `No known interaction found between ${drugA} and ${drugB}.`,
          });
        }
      } catch (dbError) {
        console.error(`Database error for pair ${drugA}+${drugB}:`, dbError);
        interactions.push({
          DrugName_A: drugA,
          DrugName_B: drugB,
          Interaction_Details: `Error checking interaction: ${dbError.message}`,
        });
      }
    }

    // 5. Return the results
    const responsePayload = {
      query,
      detected_drugs: drugs,
      interactions,
    };

    console.log("=== Function completed successfully ===");
    console.log("Response payload:", responsePayload);

    return new Response(JSON.stringify(responsePayload), {
      headers: { 
        "Content-Type": "application/json", 
        'Access-Control-Allow-Origin': '*' 
      },
      status: 200,
    });

  } catch (error) {
    console.error("=== Function Error ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        'Access-Control-Allow-Origin': '*' 
      },
    });
  }
})