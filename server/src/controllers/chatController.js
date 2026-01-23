const ChatSession = require('../models/ChatSession');
const DiagnosisHistory = require('../models/DiagnosisHistory');
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

        // 3.5 Fetch User Medical Context
        const recentDiagnoses = await DiagnosisHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('diagnosis symptoms severity createdAt');

        let medicalContext = "";
        if (recentDiagnoses.length > 0) {
            medicalContext = "USER'S RECENT MEDICAL HISTORY (Use this for context if relevant):\n";
            recentDiagnoses.forEach(d => {
                medicalContext += `- Diagnosis: ${d.diagnosis} (Severity: ${d.severity})\n  Symptoms: ${d.symptoms.join(', ')}\n  Date: ${d.createdAt.toDateString()}\n`;
            });
        }

        // System Prompt
        // SYSTEM: Safety Guardrails (Regex)
        const SAFETY_REGEX = /\b(suicide|kill myself|crushing chest|severe pain|unbearable|stroke|heart attack|paralysis|numbness|10\/10|emergency)\b/i;
        if (SAFETY_REGEX.test(message)) {
            const safetyResponse = "⚠️ **IMPORTANT SAFETY ALERT** ⚠️\n\nYour description suggests a potential medical emergency. As an AI wellness assistant, I cannot evaluate these symptoms safely.\n\n**Please call emergency services (911) or visit the nearest Emergency Room immediately.**";

            session.messages.push({ sender: 'bot', text: safetyResponse });
            await session.save();
            return res.json(session);
        }

        // System Prompt: Wellness Assistant Persona
        const systemMessage = {
            role: "system",
            content: `You are Symptor, a **Wellness Guidance Assistant**. You are NOT a doctor and cannot diagnose conditions.
            
            CORE INSTRUCTIONS:
            1. **ONE QUESTION RULE**: You must ask **ONLY ONE** short, simple question at a time. Do NOT ask multiple questions or lists. Wait for the user's answer.
            2. **FLOW**: Follow this sequence for symptoms: Location -> Duration -> Severity (1-10) -> Triggers.
            3. **TONE**: Use calm, non-clinical language. Say "discomfort" instead of "symptom". Be supportive.
            4. **SAFETY**: If symptoms are severe (high pain, difficulty breathing, sudden onset), STOP asking questions and tell the user to see a doctor immediately.
            5. **RESET**: If the user says "hi", "hello", or changes the topic, ignore the previous medical context and start fresh warmly.
            
            ${medicalContext}
            
            DISCLAIMER: Provide general wellness information only. Always end with: "Please consult a healthcare professional for advice."`
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
