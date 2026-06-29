import { invokeBedrock } from "./bedrockService.js";

export const generateQuiz = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;
  
  if (combinedContent.length > MAX_CHARS) {
    const { summarizeLargeText } = await import("./bedrockService.js");
    processedContent = await summarizeLargeText(combinedContent);
  }

  const systemPrompt = `You are an expert educator creating a multiple choice quiz.

Return ONLY a JSON array (no wrapper object, no markdown):
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "correctAnswer": "Option A",
    "explanation": "Brief explanation."
  }
]

RULES:
- correctIndex is 0-based index of correct option in the options array
- correctAnswer is the EXACT text of the correct option
- Generate 10 questions
- Return ONLY the JSON array, nothing else`;

  try {
    const response = await invokeBedrock([
      { role: "user", content: `${systemPrompt}\n\nMaterial:\n${processedContent}` }
    ], { 
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let content = response.choices[0].message.content.trim();
    console.log("Quiz raw (first 300):", content.substring(0, 300));
    
    // Remove markdown
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try parsing as array first
    let questions = [];
    
    if (content.startsWith('[')) {
      questions = JSON.parse(content);
    } else {
      // Parse as object and extract array
      const parsed = JSON.parse(content);
      questions = parsed.questions || parsed.quiz || parsed.mcqs || 
                  Object.values(parsed).find(v => Array.isArray(v)) || [];
    }

    // If correctAnswer missing, derive from correctIndex
    questions = questions.map(q => {
      if (!q.correctAnswer && q.correctIndex !== undefined && q.options) {
        q.correctAnswer = q.options[q.correctIndex];
      }
      // If correctIndex missing, derive from correctAnswer
      if (q.correctIndex === undefined && q.correctAnswer && q.options) {
        q.correctIndex = q.options.findIndex(o => 
          o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        );
      }
      return q;
    });

    console.log(`✅ Quiz: ${questions.length} questions`);
    console.log(`Sample: "${questions[0]?.question?.substring(0,50)}" → correctAnswer: "${questions[0]?.correctAnswer}", correctIndex: ${questions[0]?.correctIndex}`);
    
    return questions;
  } catch (error) {
    console.error("Quiz generation error:", error.message);
    throw error;
  }
};