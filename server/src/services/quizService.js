import bedrock, { summarizeLargeText } from "./bedrockService.js";

const ai = bedrock;

export const generateQuiz = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;
  
  if (combinedContent.length > MAX_CHARS) {
    console.warn(`Quiz input too large (${combinedContent.length} chars). Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  try {
    const response = await ai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert educator. Generate 10-15 high-quality MCQs based on the provided materials.
          
          STRICT RULES:
          - Derive content EXCLUSIVELY from the provided text.
          - Return ONLY a valid JSON object with NO extra text.
          - Every question MUST have correctAnswer field with the EXACT text of the correct option.
          
          Return ONLY this JSON structure:
          {
            "questions": [
              {
                "question": "The question text?",
                "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
                "correctAnswer": "Option B text",
                "explanation": "Brief explanation why this is correct."
              }
            ]
          }
          
          CRITICAL: correctAnswer MUST be the EXACT same text as one of the options.`
        },
        {
          role: "user",
          content: `Generate 10-15 MCQs from this material:\n\n${processedContent}`
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
    
    const parsed = JSON.parse(cleanContent);
    const questions = parsed.questions || parsed;
    
    // Validate each question has correctAnswer
    questions.forEach((q, i) => {
      if (!q.correctAnswer) {
        console.warn(`Question ${i} missing correctAnswer:`, q.question);
      }
    });

    console.log("Quiz generated:", questions.length, "questions, sample correctAnswer:", questions[0]?.correctAnswer);
    
    return questions;
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw error;
  }
};