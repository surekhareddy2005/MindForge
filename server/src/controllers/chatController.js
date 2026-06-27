import bedrock from "../services/bedrockService.js";
import Chat from "../models/Chat.js";
import Upload from "../models/Upload.js";
import Session from "../models/Session.js";

const ai = bedrock;

const CHAT_MODEL = "llama-3.3-70b-versatile";

/**
 * Summarize first message into a short title
 */
const summarizeTopic = async (message) => {
  try {
    const response = await ai.chat.completions.create({
      messages: [
        { role: "system", content: "Summarize the user's question into a 4 to 6 word title. Return ONLY the title text, nothing else. No quotes." },
        { role: "user", content: message }
      ],
      model: CHAT_MODEL,
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content?.trim() || "New Discussion";
  } catch (err) {
    console.error("Summarization failed:", err);
    return "New Discussion";
  }
};

/**
 * Handle a new chat message
 */
export const handleChat = async (req, res) => {
  const { sessionId, message, chatId } = req.body;
  const studentId = req.user._id;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "Session ID and message are required" });
  }

  // Daily Credits System Check
  const todayStr = new Date().toISOString().split('T')[0];
  let user = req.user;
  
  if (user.lastCreditResetDate !== todayStr) {
    user.chatCredits = 50;
    user.lastCreditResetDate = todayStr;
  }

  if (user.chatCredits <= 0) {
    return res.status(403).json({ 
      error: "Access Denied: You have exhausted your 50 daily chat credits. Please try again tomorrow!" 
    });
  }

  try {
    // Decrement credit immediately for this query
    user.chatCredits -= 1;
    await user.save();

    // 1. Get the session and transcript context
    const session = await Session.findById(sessionId).populate("moduleId");
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const moduleTitle = session.moduleId?.title || "General Module";

    const upload = await Upload.findOne({ sessionId });
    // Truncate transcript to stay within token limits for Mixtral
    let transcript = upload?.transcript || "No transcript available.";
    if (transcript.length > 10000) {
      transcript = transcript.substring(0, 10000) + "... [Truncated]";
    }

    // 2. Fetch or Create chat thread
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      // Auto-summarize topic for new threads
      const topic = await summarizeTopic(message);
      chat = new Chat({ 
        studentId, 
        sessionId, 
        topic,
        messages: [] 
      });
    }

    if (!chat) {
      return res.status(404).json({ error: "Chat thread not found" });
    }

    const systemPrompt = `
You are the MindForge AI, an expert educational tutor. 
Your primary goal is to help the student master the content in the provided lecture.

CRITICAL INSTRUCTION:
When answering, you MUST strictly prioritize and rely on the actual provided lecture audio and transcript text below as your primary source of truth. Do NOT rely on or generate generalized explanations based solely on the session name or module title ("${session.title}" / "${moduleTitle}"). Ground all explanations, key terms, and summaries directly in the specific concepts, context, and examples spoken in the audio transcript.

STRICT GUARDRAILS:
1. EDUCATIONAL TOPICS ONLY: You may answer any education, academic, or study-related questions. You should prioritize using the provided course material and transcript, but you are completely free to explain broader educational concepts to help the student learn.
2. NO NON-EDUCATIONAL TOPICS: If a student asks about movies, celebrities, sports, pop culture, or anything strictly non-educational, you MUST politely decline. 
3. Example Refusal: "I am an educational assistant focused on your coursework. I cannot answer questions about [Topic]. Let's get back to discussing our lecture topic or any other academic topics you need help with!"
4. Be concise, professional, and always encouraging.

SOURCE MATERIAL (TRANSCRIPT):
"""
${transcript}
"""
    `;

    const history = chat.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    // 4. Get AI Response from Bedrock
    let aiResponse;
    try {
      const chatCompletion = await ai.chat.completions.create({
        messages,
        model: CHAT_MODEL,
        temperature: 0.5,
      });
      aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (aiError) {
      console.error("Bedrock API Error:", aiError);
      aiResponse = "I'm having trouble processing that right now. Please try again in a moment.";
    }

    // 5. Save messages to database
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: aiResponse });
    await chat.save();

    res.json({
      chatId: chat._id,
      text: aiResponse,
      history: chat.messages,
      topic: chat.topic,
      creditsLeft: user.chatCredits
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
};

/**
 * Get all chat threads for a session
 */
export const getChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user._id;

  try {
    const chats = await Chat.find({ studentId, sessionId }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

/**
 * Clear all history for this session
 */
export const clearChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user._id;

  try {
    await Chat.deleteMany({ studentId, sessionId });
    res.json({ success: true, message: "All history for this session cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear history" });
  }
};

/**
 * Delete a single chat thread
 */
export const deleteChatThread = async (req, res) => {
  const { chatId } = req.params;
  const studentId = req.user._id;

  try {
    const chat = await Chat.findOneAndDelete({ _id: chatId, studentId });
    if (!chat) {
      return res.status(404).json({ error: "Chat thread not found or not authorized to delete" });
    }
    res.json({ success: true, message: "Chat thread deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete chat thread" });
  }
};

/**
 * Get current daily credits
 */
export const getCredits = async (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  let user = req.user;
  
  if (user.lastCreditResetDate !== todayStr) {
    user.chatCredits = 50;
    user.lastCreditResetDate = todayStr;
    await user.save();
  }
  
  res.json({ creditsLeft: user.chatCredits });
};
