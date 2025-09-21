import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import {
  HuggingFaceInferenceEmbeddings,
  HuggingFaceInference,
} from "@langchain/community/embeddings/hf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { pull } from "langchain/hub";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { DynamicTool } from "@langchain/core/tools";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PromptTemplate } from "@langchain/core/prompts";

// The 'req' parameter is now correctly typed as 'Request'
serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    // 1. Initialize Supabase and AI clients with Hugging Face
    const supabaseClient = createClient(
      // Deno global object is recognized now
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: Deno.env.get("HUGGINGFACE_API_KEY")!,
    });
    const llm = new HuggingFaceInference({
      apiKey: Deno.env.get("HUGGINGFACE_API_KEY")!,
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      temperature: 0.1,
    });

    // 2. Define the Tools for the Agent

    // TOOL 1: Internet Search (Free Tier)
    const searchTool = new SerpAPI(Deno.env.get("SERPAPI_API_KEY")!);
    searchTool.description =
      "A search engine. Useful for when you need to answer general medical or health-related questions. Input should be a search query.";

    // TOOL 2: Personal Health Report Retriever
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: "reports",
      queryName: "match_documents",
    });
    const retriever = vectorStore.asRetriever();

    const retrievalPrompt = PromptTemplate.fromTemplate(
      `Answer the user's question based only on the following context:\n\n{context}\n\nQuestion: {input}`
    );
    const documentChain = await createStuffDocumentsChain({
      llm,
      prompt: retrievalPrompt,
    });
    const retrievalChain = await createRetrievalChain({
      retriever,
      combineDocsChain: documentChain,
    });

    const personalReportTool = new DynamicTool({
      name: "health_report_retriever",
      description:
        "Searches and returns information from the user's personal health reports. Use this for any questions about their past scans, results, or medical history.",
      func: async (input: string) =>
        (await retrievalChain.invoke({ input })).answer,
    });

    const tools = [searchTool, personalReportTool];

    // 3. Create the Agent using a ReAct prompt suitable for open-source models
    const agentPrompt = await pull("hwchase17/react-chat");
    const agent = await createReactAgent({ llm, tools, prompt: agentPrompt });
    const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

    // 4. Invoke the agent
    const result = await agentExecutor.invoke({ input: query });

    return new Response(JSON.stringify({ response: result.output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in Agent function:", error);
    // Safer error handling by checking the error type
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
