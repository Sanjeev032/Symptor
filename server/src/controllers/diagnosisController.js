const Disease = require('../models/Disease');
const DiagnosisHistory = require('../models/DiagnosisHistory');

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

        if (possibleDiseases.length > 0) {
            // Pick top result
            bestMatch = possibleDiseases[0];

            // Save to history if user is authenticated
            // Note: req.user is set by authMiddleware
            if (req.user) {
                const history = new DiagnosisHistory({
                    user: req.user.userId,
                    symptoms: symptoms,
                    diagnosis: bestMatch.name,
                    severity: bestMatch.severity,
                    affectedSystems: bestMatch.affectedSystems
                });
                await history.save();
            }

            res.json({
                diagnosis: bestMatch.name,
                severity: bestMatch.severity,
                affectedSystems: bestMatch.affectedSystems,
                affectedOrgans: bestMatch.affectedOrgans,
                details: bestMatch
            });
        } else {
            res.json({
                diagnosis: "Unknown Condition",
                severity: "Low",
                affectedSystems: [],
                affectedOrgans: [],
                message: "No matching conditions found for these symptoms."
            });
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
