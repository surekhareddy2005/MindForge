import { invokeBedrock } from "./bedrockService.js";

export const generateInterviewQuestions = async (combinedContent) => {
  const MAX_CHARS = 24000;
  let processedContent = combinedContent;

  if (combinedContent.length > MAX_CHARS) {
    const { summarizeLargeText } = await import("./bedrockService.js");
    console.warn(`Interview input too large. Summarizing...`);
    processedContent = await summarizeLargeText(combinedContent);
  }

  try {
    const response = await invokeBedrock([
      {
        role: "user",
        content: `You are an expert technical interviewer. Generate exactly 10 famous interview questions based on this material.

Return ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "answer": "Detailed model answer here."
    }
  ]
}

Do NOT include any text before or after the JSON.
Do NOT use markdown code blocks.

Material:
${processedContent}`
      }
    ], {
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let content = response.choices[0].message.content.trim();
    console.log("Interview raw response (first 500 chars):", content.substring(0, 500));

    // Strip markdown if present
    content = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    content = content.replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

    // Find JSON boundaries
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      content = content.substring(start, end + 1);
    }

    console.log("Cleaned content (first 300):", content.substring(0, 300));

    const parsed = JSON.parse(content);
    console.log("Parsed keys:", Object.keys(parsed));

    // Try all possible keys
    let questions = parsed.questions || parsed.Questions || 
                    parsed.interview || parsed.interviewQuestions ||
                    parsed.items || parsed.data ||
                    Object.values(parsed).find(v => Array.isArray(v)) || [];

    console.log("Questions array length:", questions.length);

    if (questions.length === 0) {
      console.error("No questions found in parsed object:", JSON.stringify(parsed).substring(0, 300));
      throw new Error("No questions found in AI response");
    }

    // Map and validate
    questions = questions
      .filter(q => q && (q.question || q.Question))
      .map(q => ({
        question: q.question || q.Question || "",
        answer: q.answer || q.Answer || q.idealAnswer || q.ideal_answer || q.response || ""
      }));

    console.log(`✅ Interview: ${questions.length} questions ready`);
    return questions;

  } catch (error) {
    console.error("Interview generation error:", error.message);
    throw error;
  }
};