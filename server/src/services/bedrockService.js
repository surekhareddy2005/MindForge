import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chunkText, estimateTokens } from "../utils/textUtils.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Global timestamp to track the last request and enforce pacing
let lastRequestTime = 0;
const MIN_REQUEST_GAP = 2000; // 2 seconds between any two AI requests

export const invokeBedrock = async (messages, options = {}) => {
  const model = options.modelId || DEFAULT_MODEL;
  
  // Enforce pacing to avoid flooding the provider
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_GAP) {
    const delay = MIN_REQUEST_GAP - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();

  try {
    let retries = 0;
    const maxRetries = 3; 
    let chatCompletion;

    while (retries <= maxRetries) {
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          model: model,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 4096,
          response_format: options.response_format
        });
        break;
      } catch (error) {
        const isRateLimit = error.status === 429 || error.message?.includes('Rate limit') || error.message?.includes('429') || error.code === 'rate_limit_exceeded';
        if (isRateLimit) {
          // Immediately throw to fallback to Gemini instantly
          throw error;
        }
        if (retries < maxRetries) {
          retries++;
          const waitTime = Math.pow(2, retries) * 1500; 
          console.warn(`[invokeBedrock] Transient error hit. Retrying in ${waitTime}ms... (Attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          lastRequestTime = Date.now(); 
        } else {
          throw error;
        }
      }
    }

    const content = chatCompletion.choices[0]?.message?.content || "";

    return {
      choices: [{ message: { content } }]
    };
  } catch (error) {
    const errorMsg = error.message || error.error?.message || "Unknown Groq error";
    const isRateLimit = error.code === 'rate_limit_exceeded' || error.status === 429 || errorMsg.includes('Rate limit');
    
    console.warn(`[invokeBedrock] ${isRateLimit ? 'RATE LIMIT' : 'ERROR'} detected: ${errorMsg}. Switching to Gemini fallback...`);
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const geminiModel = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: options.response_format?.type === 'json_object' ? 'application/json' : 'text/plain',
            temperature: options.temperature || 0.7
          }
        });
        
        const combinedPrompt = messages.map(m => `${m.role.toUpperCase()}:\n${m.content}`).join("\n\n");
        const result = await geminiModel.generateContent(combinedPrompt);
        const geminiContent = result.response.text();
        
        console.log(`[invokeBedrock] ✅ Gemini fallback successful.`);

        return {
          choices: [
            {
              message: {
                content: geminiContent
              }
            }
          ]
        };
      } catch (geminiError) {
        console.error("Gemini fallback also failed:", geminiError);
        throw error; // throw original groq error if fallback fails
      }
    }
    
    console.error("Groq error and no Gemini API key found:", error);
    throw error;
  }
};

/**
 * Summarizes large text by breaking it into chunks and summarizing each chunk.
 */
export const summarizeLargeText = async (text) => {
  const chunks = chunkText(text, 12000, 500);
  console.log(`Summarizing large text: ${chunks.length} chunks...`);
  
  const summaries = [];
  for (const chunk of chunks) {
    const summaryPrompt = `
      Summarize the following educational content concisely, retaining all key technical terms, definitions, and important examples. 
      Focus on extracting the core educational value.
      
      Content:
      ${chunk}
    `;
    
    const response = await invokeBedrock([
      { role: "user", content: summaryPrompt }
    ], { temperature: 0.3, max_tokens: 1000 });
    
    summaries.push(response.choices[0].message.content);
  }
  
  return summaries.join("\n\n---\n\n");
};

export const generateLectureContent = async (combinedContent) => {
  // Safe limit for Groq's 8000 TPM tier (approx 6k tokens)
  const MAX_CHARS = 24000; 
  
  let processedContent = combinedContent;
  if (combinedContent.length > MAX_CHARS) {
    console.warn(`Input too large (${combinedContent.length} chars). Performing summarization pass...`);
    processedContent = await summarizeLargeText(combinedContent);
    console.log(`Summarized content length: ${processedContent.length} chars.`);
  }

  const prompt = `
You are an AI educational assistant that converts multiple lecture-related materials (transcripts, supplementary notes, PDFs) into a single, comprehensive structured study guide.

From the provided materials below, identify ALL topics discussed and generate structured notes for each topic.

CRITICAL CONSTRAINTS:
1. BALANCED COVERAGE: You will be provided with multiple sources (e.g., a primary transcript and supplementary files). You MUST ensure that your output incorporates key information from EVERY source provided. Do not ignore the supplementary files.
2. STRICT GROUNDING: You MUST derive ALL content EXCLUSIVELY from the provided materials. Do NOT add any external knowledge.
3. Every sentence in your output must be grounded in what is actually present in the provided sources.

The output will be used to generate a professional study guide PDF.

Return STRICT JSON only.

Structure:
{
 "lecture_title": "Consolidated Study Guide",
 "topics": [
  {
   "title": "",
   "introduction": "",
   "why_matters": "",
   "sections": [
     {
       "title": "",
       "description": "",
       "code": ""
     }
   ],
   "examples": [
     {
       "title": "",
       "description": "",
       "code": ""
     }
   ],
   "key_points": [],
   "summary": ""
  }
 ]
}

Rules:
1. Detect MULTIPLE topics if present across any of the materials.
2. TRANSCRIPT & FILE INTEGRATION: Seamlessly blend information from the main lecture and the supplementary files.
3. NOISE REDUCTION: Ignore filler words and unrelated banter. Focus on core educational concepts.
4. ABSOLUTE CODE SEPARATION: Any programming syntax MUST go into the "code" field.
5. Ensure the JSON format is valid and clean. Escape all newlines and double quotes.

Source Materials:
${processedContent}
`;

  try {
    const response = await invokeBedrock([
      { role: "user", content: prompt }
    ], { 
      temperature: 0.4,
      modelId: DEFAULT_MODEL,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not find JSON object in AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Groq processing error:", error);
    throw new Error("AI processing failed");
  }
};

export default {
  chat: {
    completions: {
      create: async ({ messages, model, temperature, response_format }) => {
        return invokeBedrock(messages, { temperature, response_format, modelId: model });
      }
    }
  }
};
