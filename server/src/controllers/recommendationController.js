const Recommendation = require('../models/Recommendation');

// Get all recommendations (for admin)
const getAllRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find({}).sort({ createdAt: -1 });
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create new recommendation
const createRecommendation = async (req, res) => {
    try {
        const newRecommendation = new Recommendation(req.body);
        const saved = await newRecommendation.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update recommendation
const updateRecommendation = async (req, res) => {
    try {
        const updated = await Recommendation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete recommendation
const deleteRecommendation = async (req, res) => {
    try {
        await Recommendation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recommendation deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get recommendations by symptoms (Public/User)
const getRecommendationsForSymptoms = async (req, res) => {
    const { symptoms, severity } = req.body; // Expecting { symptoms: [], severity: 'Low'|'Medium'|'High' }

    if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({ message: 'Symptoms array is required' });
    }

    // Safety Rule: Suppress for High/Critical severity
    if (severity === 'High' || severity === 'Critical') {
        return res.json({
            recommendations: [],
            message: 'Based on the severity of your symptoms, we recommend consulting a healthcare professional before attempting any exercises.'
        });
    }

    try {
        // Find recommendations that match ANY of the symptoms
        // Using regex for partial matching (e.g. "back" matches "lower back pain")
        const regexSymptoms = symptoms.map(s => new RegExp(s, 'i'));

        const recommendations = await Recommendation.find({
            symptoms: { $in: regexSymptoms }
        });

        // Filter out duplicates if any (though regex search shouldn't return duplicates of same doc usually)
        // Also limit to image-based types just in case
        const validRecs = recommendations.filter(r => ['Yoga', 'Exercise', 'Stretch'].includes(r.type));

        res.json({ recommendations: validRecs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error fetching recommendations' });
    }
};

// Import Wellness Data (Admin)
const importWellnessData = async (req, res) => {
    const defaultData = [
        {
            name: "Child's Pose",
            type: "Yoga",
            symptoms: ["back pain", "stress", "fatigue"],
            duration: "1-3 mins",
            difficulty: "Beginner",
            description: "A gentle resting pose that stretches the hips, thighs, and ankles while reducing stress and fatigue.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Balasana.JPG",
            imageSource: "Wikimedia Commons",
            imageLicense: "CC BY-SA 3.0",
            safetyTips: ["Avoid if you have knee injuries."]
        },
        {
            name: "Cat-Cow Stretch",
            type: "Stretch",
            symptoms: ["back pain", "neck pain", "posture"],
            duration: "1-2 mins",
            difficulty: "Beginner",
            description: "Improves posture and balance, strengthens the neck and spine.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cat_Cow_Pose.jpg/640px-Cat_Cow_Pose.jpg",
            imageSource: "Wikimedia Commons (Placeholder)",
            imageLicense: "Public Domain",
            safetyTips: ["Move gently with your breath."]
        },
        {
            name: "Corpse Pose (Savasana)",
            type: "Yoga",
            symptoms: ["stress", "anxiety", "insomnia", "headache"],
            duration: "5-10 mins",
            difficulty: "Beginner",
            description: "Relaxes the whole body, releases stress, depression, fatigue, and tension.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Savasana.JPG",
            imageSource: "Wikimedia Commons",
            imageLicense: "CC BY-SA 3.0",
            safetyTips: ["Keep your body warm."]
        }
    ];

    try {
        let count = 0;
        for (const item of defaultData) {
            // Check if exists to avoid duplicates
            const exists = await Recommendation.findOne({ name: item.name });
            if (!exists) {
                await new Recommendation(item).save();
                count++;
            }
        }
        res.json({ message: `Successfully imported ${count} wellness items.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error importing data: ' + err.message });
    }
};


module.exports = {
    getAllRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    getRecommendationsForSymptoms,
    importWellnessData
};
