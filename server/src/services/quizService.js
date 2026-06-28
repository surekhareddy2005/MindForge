import { invokeBedrock } from "./bedrockService.js";

export const generateQuiz = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;
  
  if (combinedContent.length > MAX_CHARS) {
    const { summarizeLargeText } = await import("./bedrockService.js");
    console.warn(`Quiz input too large (${combinedContent.length} chars). Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  const systemPrompt = `You are an expert educator. Generate 10-15 MCQs from the provided materials.

STRICT JSON FORMAT - Return ONLY this structure, nothing else:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option B text",
      "explanation": "Why this is correct."
    }
  ]
}

RULES:
- correctAnswer MUST be the EXACT same string as one of the options
- Return ONLY valid JSON, no markdown, no extra text
- Every question must have all 4 fields: question, options, correctAnswer, explanation`;

  try {
    const response = await invokeBedrock([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate 10-15 MCQs from this material:\n\n${processedContent}` }
    ], { 
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log("Quiz raw response (first 200 chars):", content.substring(0, 200));
    
    // Clean and parse JSON
    let cleanContent = content.trim();
    
    // Remove markdown code blocks if present
    const blockMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (blockMatch) cleanContent = blockMatch[1].trim();
    
    // Find JSON object
    const start = cleanContent.indexOf('{');
    const end = cleanContent.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleanContent = cleanContent.substring(start, end + 1);
    }
    
    const parsed = JSON.parse(cleanContent);
    
    // Handle both {questions: [...]} and direct array
    const questions = Array.isArray(parsed) ? parsed : 
                      (parsed.questions || parsed.Questions || Object.values(parsed)[0] || []);
    
    console.log(`Quiz parsed: ${questions.length} questions, sample correctAnswer: "${questions[0]?.correctAnswer}"`);
    
    // Validate
    questions.forEach((q, i) => {
      if (!q.correctAnswer) console.warn(`⚠️ Question ${i} missing correctAnswer:`, q.question?.substring(0, 50));
    });

    return questions;
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw error;
  }
};