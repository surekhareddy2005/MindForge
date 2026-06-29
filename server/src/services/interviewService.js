import { invokeBedrock } from "./bedrockService.js";

export const generateInterviewQuestions = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;

  if (combinedContent.length > MAX_CHARS) {
    const { summarizeLargeText } = await import("./bedrockService.js");
    console.warn(`Interview input too large (${combinedContent.length} chars). Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  const systemPrompt = `You are an expert technical interviewer. Generate exactly 10 famous and important interview questions based on the provided material.

Return ONLY a JSON array (no wrapper object, no markdown):
[
  {
    "question": "Interview question here?",
    "answer": "Precise and detailed model answer here."
  }
]

RULES:
- Generate exactly 10 questions
- Questions must be famous, commonly asked interview questions related to the topic
- Answers must be precise, correct and detailed
- Return ONLY the JSON array, nothing else, no markdown backticks`;

  try {
    const response = await invokeBedrock([
      { role: "user", content: `${systemPrompt}\n\nMaterial:\n${processedContent}` }
    ], {
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let content = response.choices[0].message.content.trim();
    console.log("Interview raw (first 300):", content.substring(0, 300));

    // Remove markdown
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let questions = [];

    if (content.startsWith('[')) {
      questions = JSON.parse(content);
    } else {
      const parsed = JSON.parse(content);
      questions = parsed.questions || parsed.interview || parsed.interviewQuestions ||
                  Object.values(parsed).find(v => Array.isArray(v)) || [];
    }

    // Validate each question has both fields
    questions = questions.filter(q => q.question && q.answer);

    console.log(`✅ Interview: ${questions.length} questions generated`);
    console.log(`Sample: "${questions[0]?.question?.substring(0, 60)}"`);

    return questions;
  } catch (error) {
    console.error("Interview generation error:", error.message);
    throw error;
  }
};