const ChatSession = require('../models/ChatSession');
const Disease = require('../models/Disease');

// Helper to sanitize and tokenize input
const tokenize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

// Disclaimer to append to medical responses
const DISCLAIMER = "\n\n(Note: I am an AI assistant, not a doctor. This is for informational purposes only. Please consult a medical professional for advice.)";

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // 1. Get or Create Session
        let session = await ChatSession.findOne({ userId });
        if (!session) {
            session = new ChatSession({ userId, messages: [], context: { potentialDiseases: [], confirmedSymptoms: [] } });
        }

        // 2. Add User Message
        session.messages.push({ sender: 'user', text: message });

        // 3. Analyze Input & Generate Response
        let botResponse = "";
        const tokens = tokenize(message);

        // Load all diseases for comparison (Optimization: Cache this in memory in a real app)
        const allDiseases = await Disease.find();

        // Check for Greeting
        if (tokens.includes('hello') || tokens.includes('hi')) {
            botResponse = "Hello! I'm here to help with your medical questions. Describe your symptoms, and I can give you some information.";
        }
        // Logic: Symptom Matching
        else {
            // Find matched symptoms in the message
            const foundSymptoms = [];
            allDiseases.forEach(d => {
                d.symptoms.forEach(s => {
                    const symptomTokens = tokenize(s);
                    // Simple check: if all parts of the symptom phrase are in the message
                    if (symptomTokens.every(t => tokens.includes(t))) {
                        foundSymptoms.push(s);
                    }
                });
            });

            // Update Context
            const newSymptoms = [...new Set([...session.context.confirmedSymptoms, ...foundSymptoms])];
            session.context.confirmedSymptoms = newSymptoms;

            // Find matching diseases based on confirmed symptoms
            let matchedDiseases = allDiseases.filter(d =>
                newSymptoms.some(s => d.symptoms.includes(s))
            );

            // Refine: if we have confirmed symptoms, try to find diseases that have ALL or MOST of them
            // For now, simpler logic: finding diseases that contain at least one confirmed symptom

            if (foundSymptoms.length > 0 || newSymptoms.length > 0) {
                // We have some context

                // Sort diseases by match count
                matchedDiseases.sort((a, b) => {
                    const aCount = a.symptoms.filter(s => newSymptoms.includes(s)).length;
                    const bCount = b.symptoms.filter(s => newSymptoms.includes(s)).length;
                    return bCount - aCount;
                });

                const topMatches = matchedDiseases.filter(d => {
                    const matchCount = d.symptoms.filter(s => newSymptoms.includes(s)).length;
                    return matchCount > 0;
                });

                if (topMatches.length === 0) {
                    botResponse = "I understood those symptoms, but I couldn't find a matching record in my database. Please consult a doctor.";
                } else if (topMatches.length === 1 && topMatches[0].symptoms.every(s => newSymptoms.includes(s))) {
                    // Exact match found (all symptoms matched)
                    const d = topMatches[0];
                    botResponse = `Based on your symptoms, this looks like **${d.name}**.\n${d.description}\n\n**Common Treatment:** ${d.treatment.join(', ')}.`;
                } else {
                    // Multiple possibilities or partial match -> Ask follow-up
                    // Find a symptom from the top match that hasn't been confirmed yet
                    const topDisease = topMatches[0];
                    const nextSymptom = topDisease.symptoms.find(s => !newSymptoms.includes(s));

                    if (nextSymptom) {
                        botResponse = `Do you also experience **${nextSymptom}**?`;
                    } else {
                        // All symptoms of the top disease are confirmed
                        botResponse = `This strongly suggests **${topDisease.name}**.\n${topDisease.description}\n\n**Treatment:** ${topDisease.treatment.join(', ')}.`;
                    }
                }
            } else {
                botResponse = "I didn't recognize any specific symptoms in your message. Can you describe what you're feeling? (e.g., 'headache', 'fever', 'stomach pain')";
            }
        }

        // Add Disclaimer if medical info is given
        if (!botResponse.includes("Hello!") && !botResponse.includes("I didn't recognize")) {
            botResponse += DISCLAIMER;
        }

        session.messages.push({ sender: 'bot', text: botResponse });
        session.updatedAt = Date.now();
        await session.save();

        res.json(session);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const session = await ChatSession.findOne({ userId });
        res.json(session ? session.messages : []);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { sendMessage, getHistory };
