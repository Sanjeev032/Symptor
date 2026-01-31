const Groq = require('groq-sdk');

// Initialize Groq Client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "dummy_key"
});

/**
 * reliableChatMessage - Wrapper for Groq Chat Completion
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Object} options - Optional config (temperature, etc.)
 */
const reliableChatMessage = async (messages, options = {}) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: options.temperature || 0.6,
            max_tokens: options.max_tokens || 1024,
            response_format: options.jsonMode ? { type: "json_object" } : undefined
        });

        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        console.error("AI Client Error:", error);
        throw error;
    }
};

module.exports = { reliableChatMessage };
