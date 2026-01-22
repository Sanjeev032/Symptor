const ChatSession = require('../models/ChatSession');
const { reliableChatMessage } = require('../utils/aiClient');

// Groq initialized inutils/aiClient.js

const DISCLAIMER = "\n\n(Note: I am an AI assistant, not a doctor. This is for informational purposes only. Please consult a medical professional for advice.)";

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;
        console.log("ChatController: Processing message for user:", userId);

        // 1. Get or Create Session
        let session = await ChatSession.findOne({ userId });
        if (!session) {
            console.log("ChatController: Creating NEW session for user", userId);
            session = new ChatSession({ userId, messages: [] });
        }

        // 2. Add User Message
        session.messages.push({ sender: 'user', text: message });

        // 3. Prepare Chat History for AI
        // Limit history to last 10 messages to save context window and tokens
        const history = session.messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        // System Prompt
        const systemMessage = {
            role: "system",
            content: `You are Symptor, a medical interviewer AI.
            
            CORE RULE: YOU MUST ASK FOLLOW-UP QUESTIONS.
            
            When a user mentions a symptom:
            1. DO NOT DIAGNOSE IMMEDIATELY.
            2. You MUST ask 2-3 clarification questions (e.g., duration, severity, other symptoms).
            3. Only after the user answers your questions can you provide insights.
            
            Disclaimer: You are an AI, not a doctor. Advise emergency care for serious symptoms.`
        };

        const messages = [systemMessage, ...history];

        console.log("ChatController: Sending request to Groq...");

        // 4. Call Groq API (via Shared Utility)
        const botResponseContent = await reliableChatMessage(messages);

        const botResponse = botResponseContent || "I apologize, but I am having trouble processing your request right now.";

        // 5. Save Response
        session.messages.push({ sender: 'bot', text: botResponse });
        session.updatedAt = Date.now();
        await session.save();

        console.log("ChatController: Response received and saved.");
        res.json(session);

    } catch (err) {
        console.error("ChatController Error:", err);
        res.status(500).json({ message: 'Server Error during AI processing' });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const session = await ChatSession.findOne({ userId });
        res.json(session ? session.messages : []);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { sendMessage, getHistory };
