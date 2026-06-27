import bedrock, { summarizeLargeText } from "./bedrockService.js";

const ai = bedrock;

export const generateFlashcards = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;
  
  if (combinedContent.length > MAX_CHARS) {
    console.warn(`Flashcard input too large (${combinedContent.length} chars). Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  const prompt = `
    You are an expert educational content creator. Your task is to generate 8-12 highly effective flashcards based on the provided material.
    
    The material contains MULTIPLE SOURCES (e.g., lecture transcripts and supplementary files). 
    CRITICAL: You MUST distribute the flashcards across ALL provided sources. Ensure that concepts from the supplementary files are represented.
    
    Requirements for each flashcard:
    1. Topic: A clear, concise title for the concept (the "question" side).
    2. Description: A concise explanation in EXACTLY 3-4 sentences. No bullet points, no lists — just flowing prose that is easy to read at a glance.
    
    Material:
    ${processedContent}
    
    Return the response as a STRICT JSON object with the following structure:
    {
      "flashcards": [
        {
          "topic": "Concept Name",
          "description": "3-4 sentence explanation..."
        }
      ]
    }
    
    Rules:
    - **STRICT GROUNDING**: Derive content EXCLUSIVELY from the provided materials.
    - **BALANCED SOURCE USAGE**: Do not just focus on the first part of the text. Scan all sources for important concepts.
    - **NO EXTERNAL KNOWLEDGE**: Do NOT include information not present in the sources.
    - **CONCISE ANSWERS**: Each description MUST be exactly 3-4 sentences. No more, no less.
  `;

  try {
    const response = await ai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert educational content creator. Generate 8-12 flashcards based on the provided materials. 
          
          STRICT GROUNDING & SOURCE RULES:
          - The input contains multiple sources. You MUST include information from the supplementary files, not just the transcript.
          - Derive content EXCLUSIVELY from the provided text.
          - Return ONLY a valid JSON object.
          - Each "description" field MUST be exactly 3-4 sentences of flowing prose. No bullet points, no lists.
          
          JSON Structure:
          {
            "flashcards": [
              {
                "topic": "Concept Name",
                "description": "3-4 sentence explanation only."
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Materials:\n${processedContent}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    let cleanContent = content;
    
    const blockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (blockMatch) {
      cleanContent = blockMatch[1];
    } else {
      const start = content.indexOf('{');
      if (start !== -1) {
        let brackets = 0;
        for (let i = start; i < content.length; i++) {
          if (content[i] === '{') brackets++;
          else if (content[i] === '}') brackets--;
          
          if (brackets === 0) {
            cleanContent = content.substring(start, i + 1);
            break;
          }
        }
      }
    }
    
    return JSON.parse(cleanContent).flashcards;
  } catch (error) {
    console.error("Flashcard generation error:", error);
    throw error;
  }
};
