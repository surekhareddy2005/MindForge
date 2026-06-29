import { invokeBedrock } from "../services/bedrockService.js";

export const evaluateInterviewAnswer = async (req, res) => {
  try {
    const { question, userAnswer, idealAnswer, topic } = req.body;

    const skipPhrases = ["i don't know", "i dont know", "i do not know", "no", "i can't", "i cannot", "i have no idea", "not sure", "don't know", "no idea", "pass", "skip"];
    const lower = userAnswer.trim().toLowerCase();
    const isSkipped = skipPhrases.some(p => lower === p || lower.startsWith(p + ' ') || lower.startsWith(p + '.'));

    if (isSkipped) {
      return res.json({
        score: 0, status: 'skipped',
        good: '', missing: 'No answer provided.',
        modelAnswer: idealAnswer,
        feedback: "No answer given.",
        offTopic: false
      });
    }

    const prompt = `You are an expert technical interviewer evaluating a student's answer.

Topic: "${topic}"
Question: "${question}"
Student's Answer: "${userAnswer}"
Ideal Answer: "${idealAnswer}"

Evaluate strictly and return ONLY this JSON:
{
  "score": <number 1-10>,
  "offTopic": <true if answer is unrelated to the topic "${topic}", false otherwise>,
  "good": "<what was good about the answer, empty string if nothing>",
  "missing": "<key points that were missing or incorrect>",
  "feedback": "<one line overall feedback>",
  "modelAnswer": "<precise and correct model answer based on the ideal answer>"
}

Scoring guide:
- 9-10: Excellent, covers all key points precisely
- 7-8: Good, covers most points
- 5-6: Partial, misses important points  
- 3-4: Poor, mostly incorrect
- 1-2: Very poor or completely wrong
- 0: No real answer given

If offTopic is true, cap the score at 3.
Return ONLY valid JSON, nothing else.`;

    const response = await invokeBedrock([
      { role: "user", content: prompt }
    ], { temperature: 0.1, response_format: { type: "json_object" } });

    let content = response.choices[0].message.content.trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1) content = content.substring(start, end + 1);

    const result = JSON.parse(content);
    result.status = 'answered';
    result.modelAnswer = result.modelAnswer || idealAnswer;

    res.json(result);
  } catch (error) {
    console.error("Interview eval error:", error);
    res.status(500).json({ error: error.message });
  }
};