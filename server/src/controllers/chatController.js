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
        const lowerMessage = message.trim().toLowerCase();

        // Load all diseases (Optimization: Cache this)
        const allDiseases = await Disease.find();

        // CHECK IF ANSWER IS "YES" OR "NO" to a previous question
        if (session.context.lastQuestionType === 'symptom_check' && session.context.pendingSymptom) {
            const pending = session.context.pendingSymptom;

            if (['yes', 'yeah', 'yep', 'sure', 'i do'].includes(lowerMessage)) {
                // User confirmed the symptom
                if (!session.context.confirmedSymptoms.includes(pending)) {
                    session.context.confirmedSymptoms.push(pending);
                }
            } else if (['no', 'nope', 'nah', 'not really'].includes(lowerMessage)) {
                // User denied the symptom - logic could be to exclude it or just not add it
                // For now, we just don't add it.
            } else {
                // Ambiguous response, treat as new input but keep context if it looks like a symptom description
                // For this simple version, we'll strip 'yes/no' logic if it doesn't match and proceed to extraction
            }

            // Clear pending context after processing
            session.context.lastQuestionType = 'general';
            session.context.pendingSymptom = null;
        }

        // Logic: Standard Symptom Extraction
        // Find matched symptoms in the message
        const foundSymptoms = [];
        allDiseases.forEach(d => {
            d.symptoms.forEach(s => {
                const symptomTokens = tokenize(s);
                // Check if symptom phrase appears in tokens
                // Simple partial matching: if all words of the symptom are present
                if (symptomTokens.every(t => tokens.includes(t))) {
                    foundSymptoms.push(s);
                }
            });
        });

        // Update Context with new found symptoms
        const newSymptoms = [...new Set([...session.context.confirmedSymptoms, ...foundSymptoms])];
        session.context.confirmedSymptoms = newSymptoms;

        // Check for Greeting if no symptoms found and no context
        if (newSymptoms.length === 0 && (tokens.includes('hello') || tokens.includes('hi'))) {
            botResponse = "Hello! I'm here to help with your medical questions. Describe your symptoms, and I can give you some information.";
            session.context.lastQuestionType = 'greeting';
        }
        else if (newSymptoms.length > 0) {
            // We have symptoms. Match diseases.
            // Find diseases that share ANY of the confirmed symptoms
            let matchedDiseases = allDiseases.filter(d =>
                newSymptoms.some(s => d.symptoms.includes(s))
            );

            // Sort diseases by how many symptoms overlap
            matchedDiseases.sort((a, b) => {
                const aCount = a.symptoms.filter(s => newSymptoms.includes(s)).length;
                const bCount = b.symptoms.filter(s => newSymptoms.includes(s)).length;
                return bCount - aCount;
            });

            // Filter out diseases that have 0 matches (redundant but safe)
            const topMatches = matchedDiseases.filter(d => {
                const matchCount = d.symptoms.filter(s => newSymptoms.includes(s)).length;
                return matchCount > 0;
            });

            if (topMatches.length === 0) {
                botResponse = "I understood those symptoms, but I couldn't find a matching record in my database. Please consult a doctor.";
            } else {
                // Logic:
                // 1. If we have a very strong match (e.g. all symptoms of the disease are present), diagnose.
                // 2. Else, ask a follow-up question from the top match.

                const topDisease = topMatches[0];
                const matchCount = topDisease.symptoms.filter(s => newSymptoms.includes(s)).length;
                const totalSymptoms = topDisease.symptoms.length;

                // Threshold: If we matched > 70% of symptoms or if it has few symptoms and we matched most
                const isStrongMatch = (matchCount / totalSymptoms) >= 0.7 || (matchCount >= 2 && totalSymptoms <= 3);

                if (isStrongMatch || foundSymptoms.length === 0 /* processing yes/no with no new symptoms */) {
                    // Check for remaining symptoms to ask about, just in case, but if strong enough, just show info
                    // Actually, let's ask one more check if we are not 100% sure? 
                    // For simplicity: If >75% match, show result. Else ask missing.

                    const missingSymptoms = topDisease.symptoms.filter(s => !newSymptoms.includes(s));

                    if (missingSymptoms.length > 0 && (matchCount / totalSymptoms) < 0.8) {
                        // Ask follow up
                        const nextSymptom = missingSymptoms[0];
                        botResponse = `Do you also experience **${nextSymptom}**?`;
                        session.context.lastQuestionType = 'symptom_check';
                        session.context.pendingSymptom = nextSymptom;
                    } else {
                        // Diagnosis
                        let safetyWarning = "";
                        if (['High', 'Critical'].includes(topDisease.severity)) {
                            safetyWarning = "\n\n**⚠️ URGENT WARNING:** This condition can be serious. Please seek immediate medical attention.";
                        }

                        botResponse = `Based on your symptoms, this looks like **${topDisease.name}**.\n${topDisease.description}\n\n**Common Treatment:** ${topDisease.treatment.join(', ')}.${safetyWarning}`;

                        // Reset context after diagnosis? User might want to ask more. 
                        // Check persistence requirement: "adapts based on user history". 
                        // We keep the history but maybe clear the 'current session' active state if we wanted to start fresh.
                        // For now, we keep accumulating symptoms until user says 'clear' or similar? 
                        // Or maybe we don't clear, ensuring the chatbot "remembers".
                    }
                } else {
                    // Weak match, ask follow up
                    const missingSymptoms = topDisease.symptoms.filter(s => !newSymptoms.includes(s));
                    if (missingSymptoms.length > 0) {
                        const nextSymptom = missingSymptoms[0];
                        botResponse = `Do you also experience **${nextSymptom}**?`;
                        session.context.lastQuestionType = 'symptom_check';
                        session.context.pendingSymptom = nextSymptom;
                    } else {
                        // All matched? Then it's the diagnosis (covered by strong match block usually)
                        botResponse = `This matches **${topDisease.name}**.\n${topDisease.description}`;
                    }
                }
            }
        }
        else {
            botResponse = "I didn't recognize any specific symptoms in your message. Can you describe what you're feeling? (e.g., 'headache', 'fever', 'stomach pain')";
            session.context.lastQuestionType = 'general';
        }

        // Add Disclaimer if medical info is given and not already added
        if (!botResponse.includes("Hello!") && !botResponse.includes("I didn't recognize") && !botResponse.includes("Do you also experience")) {
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
