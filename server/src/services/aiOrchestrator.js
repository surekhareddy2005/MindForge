import { generateLectureContent as bedrockExtract } from "./bedrockService.js";
import { generateDetailedContent as geminiExpand } from "./geminiService.js";
import { runCriticPass } from "./criticService.js";

export const orchestrateAIContent = async (transcript) => {
  console.log("Stage 1: Processing with Bedrock (Fast Analysis)...");
  
  // Step 1: Use Bedrock (Claude 3.5 Sonnet) to structure the transcript and find topics
  const initialContent = await bedrockExtract(transcript);
  
  let finalContent = initialContent;

  // Step 2: Use Gemini to expand on those topics
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("Stage 2: Enhancing with Gemini 1.5 Pro (High-Quality Content)...");
      const enhancedContent = await geminiExpand(transcript, initialContent.topics);
      
      if (enhancedContent && enhancedContent.topics) {
        finalContent = {
          ...initialContent,
          topics: enhancedContent.topics
        };
      }
    } catch (error) {
      console.error("Orchestrator Error (Gemini Phase):", error);
    }
  }

  // Step 3: Run The Critic Pass
  try {
    const polishedContent = await runCriticPass(finalContent);
    return polishedContent;
  } catch (error) {
    console.error("Orchestrator Error (Critic Phase):", error);
    return finalContent;
  }
};
