const Disease = require('../models/Disease');
const DiagnosisHistory = require('../models/DiagnosisHistory');
const Recommendation = require('../models/Recommendation');

// Extract all unique symptoms for the frontend dropdown
const getSymptoms = async (req, res) => {
    try {
        const diseases = await Disease.find({});
        const symptomsSet = new Set();
        diseases.forEach(d => {
            d.symptoms.forEach(s => symptomsSet.add(s));
        });
        const symptoms = Array.from(symptomsSet).sort();
        res.json(symptoms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Diagnosis Logic
const diagnose = async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ message: 'Please provide a list of symptoms' });
    }

    try {
        const diseases = await Disease.find({});

        let bestMatch = null;

        // Simple scoring algorithm: Count matching symptoms
        const scoredDiseases = diseases.map(disease => {
            const matches = disease.symptoms.filter(s => symptoms.includes(s));
            const score = matches.length;
            return {
                ...disease.toObject(),
                matchScore: score,
                matchedSymptoms: matches
            };
        });

        // Sort by score descending
        scoredDiseases.sort((a, b) => b.matchScore - a.matchScore);

        // Filter out those with 0 matches
        const possibleDiseases = scoredDiseases.filter(d => d.matchScore > 0);

        const { reliableChatMessage } = require('../utils/aiClient');

        // ...

        if (possibleDiseases.length > 0) {
            // Pick top result
            bestMatch = possibleDiseases[0];

            // Save to history if user is authenticated
            let historyData = {};

            // Save to history if user is authenticated
            if (req.user) {
                const history = new DiagnosisHistory({
                    user: req.user.userId,
                    symptoms: symptoms,
                    diagnosis: bestMatch.name,
                    severity: bestMatch.severity,
                    affectedSystems: bestMatch.affectedSystems
                });
                const savedHistory = await history.save();
                historyData = {
                    _id: savedHistory._id,
                    createdAt: savedHistory.createdAt
                };
            }

            // Fetch Recommendations (Yoga & Exercises)
            const recommendations = await Recommendation.find({
                symptoms: { $in: symptoms.map(s => new RegExp(s, 'i')) } // simple regex match
            });

            res.json({
                ...historyData,
                symptoms: symptoms,
                diagnosis: bestMatch.name,
                severity: bestMatch.severity,
                affectedSystems: bestMatch.affectedSystems,
                affectedOrgans: bestMatch.affectedOrgans,
                details: bestMatch,
                recommendations: recommendations,
                isAiPrediction: false
            });
        } else {
            console.log("DiagnosisController: No local match found. Asking Llama...");

            // Llama Fallback
            const prompt = `
                Patient Symptoms: ${symptoms.join(', ')}.
                
                Task: Diagnose the most likely medical condition.
                Output: JSON Object ONLY.
                Format: 
                {
                    "name": "Disease Name",
                    "severity": "Low" | "Medium" | "High" | "Critical",
                    "description": "Short description (max 2 sentences)",
                    "treatment": ["Step 1", "Step 2"],
                    "affectedSystems": ["System 1", "System 2"]
                }
                Disclaimer: You are AI. If unsafe, return severe "Consult Doctor".
            `;

            try {
                const aiResponseStr = await reliableChatMessage([
                    { role: "system", content: "You are a medical diagnosis AI. Output valid JSON only." },
                    { role: "user", content: prompt }
                ], { jsonMode: true });

                const aiResult = JSON.parse(aiResponseStr);

                // Save AI result to history too? Maybe with a flag.
                let historyData = {};

                // Save AI result
                if (req.user) {
                    const history = new DiagnosisHistory({
                        user: req.user.userId,
                        symptoms: symptoms,
                        diagnosis: aiResult.name + " (AI)",
                        severity: aiResult.severity,
                        affectedSystems: aiResult.affectedSystems
                    });
                    const savedHistory = await history.save();
                    historyData = {
                        _id: savedHistory._id,
                        createdAt: savedHistory.createdAt
                    };
                }

                res.json({
                    ...historyData,
                    symptoms: symptoms,
                    diagnosis: aiResult.name,
                    severity: aiResult.severity,
                    affectedSystems: aiResult.affectedSystems,
                    details: {
                        description: aiResult.description,
                        treatment: aiResult.treatment
                    },
                    recommendations: [], // AI could suggest these too in future
                    isAiPrediction: true,
                    message: "Diagnosis provided by Llama AI."
                });

            } catch (aiErr) {
                console.error("AI Diagnosis Failed:", aiErr);
                res.json({
                    diagnosis: "Unknown Condition",
                    severity: "Low",
                    affectedSystems: [],
                    affectedOrgans: [],
                    message: "No matching conditions found and AI analysis failed."
                });
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await DiagnosisHistory.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getSymptoms, diagnose, getHistory };
