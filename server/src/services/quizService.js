import bedrock, { summarizeLargeText } from "./bedrockService.js";

const ai = bedrock;

export const generateQuiz = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;
  
  if (combinedContent.length > MAX_CHARS) {
    console.warn(`Quiz input too large (${combinedContent.length} chars). Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  const prompt = `
    You are an expert educator. Your task is to generate 10-15 high-quality Multiple Choice Questions (MCQs) based on the provided material.
    
    The material contains MULTIPLE SOURCES (e.g., transcripts and supplementary files). 
    CRITICAL: You MUST ensure that questions cover topics from BOTH the transcripts and the supplementary files.
    
    Requirements for each question:
    1. A clear, challenging question.
    2. Exactly 4 options.
    3. Identify the correct answer.
    4. Provide a brief explanation for why it is correct.
    
    Material:
    ${processedContent}
    
    Return the response as a STRICT JSON object with the following structure:
    {
      "questions": [
        {
          "question": "The question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option B",
          "explanation": "Brief explanation..."
        }
      ]
    }
    
    Rules:
    - **STRICT GROUNDING**: Derive content EXCLUSIVELY from the provided materials.
    - **BALANCED SOURCE USAGE**: Ensure a fair distribution of questions across all provided source files.
    - **NO EXTERNAL KNOWLEDGE**: Do NOT include information or options not present in the materials.
  `;

  try {
    const response = await ai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert educator. Generate 10-15 high-quality MCQs based on the provided materials.
          
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
    console.error("Quiz generation error:", error);
    throw error;
  }
};
