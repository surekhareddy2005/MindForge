import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const extractTopics = async (transcript) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `
    Analyze the following lecture transcript and extract a list of 3-5 main topics discussed.
    Return ONLY a JSON array of strings.
    
    Transcript:
    ${transcript}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx === -1) return [];
    return JSON.parse(text.substring(startIdx, endIdx + 1));
  } catch (error) {
    console.error("Topic extraction error:", error);
    return ["General Discussion"];
  }
};

export const generateDetailedContent = async (transcript, topics) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an Elite Senior Software Engineer and Distinguished Educator. Your task is to transform raw lecture transcripts into world-class, professional study guides.

Lecture Transcript:
${transcript}

Extracted Topics:
${JSON.stringify(topics)}

CONTENT GENERATION STRATEGY:
1. **Primary Source**: Use the "Lecture Transcript" and any provided "Reference Files" to extract specific context, unique insights, and the flow.
2. **Strict Adherence**: You MUST derive ALL content, explanations, examples, and summaries EXCLUSIVELY from the provided transcript and reference files. Do NOT add any external knowledge or background theory not explicitly mentioned in the provided materials.
3. **Accuracy over Elaboration**: If the materials only mention a topic briefly, reflect only what was actually said. Do not elaborate or invent details.

Rules for CODE SNIPPETS:
- persona: Write code as a Senior Developer at a top-tier tech company.
- quality: Use modern, best-practice syntax (ES6+). Every line should be functional and meaningful.
- comments: Add concise, helpful comments inside the code explaining complex logic.
- formatting: Strict indentation (2 or 4 spaces). No squashed lines. 
- completeness: Provide FULL, functional logic. No placeholders.

Rules for MATTER (Text):
- Highly descriptive. Use metaphors and clear analogies to explain difficult parts.
- Ensure the tone is professional yet encouraging for students.

Structure:
{
  "topics": [
    {
      "title": "Topic Name",
      "introduction": "Introductory text...",
      "why_matters": "Real-world significance...",
      "sections": [{"title": "Subtopic", "description": "Full explanation...", "code": "ULTRA-CLEAN CODE SNIPPET"}],
      "examples": [{"title": "Practice Example", "description": "Context...", "code": "COMPLETE CODE BLOCK"}],
      "key_points": ["Key takeaway 1", "Key takeaway 2"],
      "summary": "Concise summary"
    }
  ]
}

Return ONLY valid JSON. Escape all special characters. Do not include markdown blocks.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Robust JSON extraction: look for the first '{' and last '}'
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error("No JSON found in Gemini response:", text);
      return null;
    }
    
    const cleanJson = text.substring(startIdx, endIdx + 1).trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini processing error:", error);
    return null; // Fallback to original content
  }
};
