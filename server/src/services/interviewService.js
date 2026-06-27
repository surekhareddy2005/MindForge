import bedrock, { summarizeLargeText } from "./bedrockService.js";

const ai = bedrock;

export const generateInterviewQuestions = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;
  
  if (combinedContent.length > MAX_CHARS) {
    console.warn(`Interview input too large (${combinedContent.length} chars). Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  const transcriptLength = processedContent.length;
  // Dynamic count: min 10, max based on length
  const targetCount = Math.max(10, Math.min(25, Math.floor(transcriptLength / 1000)));

  const prompt = `
    You are an expert technical interviewer. Your task is to generate at least ${targetCount} high-quality interview questions based on the provided material.
    
    The material contains MULTIPLE SOURCES (e.g., transcripts and supplementary files). 
    CRITICAL: You MUST ensure that you pull questions from ALL provided sources, especially the technical details in supplementary files.
    
    Requirements:
    1. A challenging, technical question.
    2. A detailed "ideal answer" based ONLY on the provided sources.
    
    Material:
    ${processedContent}
    
    Return the response as a STRICT JSON object with the following structure:
    {
      "questions": [
        {
          "question": "Question text?",
          "answer": "Detailed answer..."
        }
      ]
    }
    
    Rules:
    - **STRICT GROUNDING**: Derive content EXCLUSIVELY from the provided materials.
    - **BALANCED SOURCE USAGE**: Ensure that information from all source files is represented in the questions.
    - **NO EXTERNAL KNOWLEDGE**: Do NOT include questions or answers not grounded in the provided text.
    - Minimum ${targetCount} questions.
  `;

  try {
    const response = await ai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer. Generate at least ${targetCount} high-quality interview questions based on the provided materials.
          
          STRICT GROUNDING & SOURCE RULES:
          - The input contains multiple sources. You MUST include questions from the supplementary files, not just the transcript.
          - Derive content EXCLUSIVELY from the provided text.
          - Return ONLY a valid JSON object.`
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
    
    return JSON.parse(cleanContent).questions;
  } catch (error) {
    console.error("Interview generation error:", error);
    throw error;
  }
};
