const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Disease = require('../models/Disease');

// Load env vars
dotenv.config({ path: '../../.env' }); // Adjusted path to root server .env

const diseases = [
    {
        name: "Migraine",
        symptoms: ["headache", "nausea", "sensitivity to light", "dizzy"],
        description: "A neurological condition characterized by intense, debilitating headaches.",
        treatment: ["Pain relievers", "Rest in a dark room", "Hydration"],
        severity: "Medium",
        affectedSystems: ["Nervous"],
        affectedOrgans: ["Brain"]
    },
    {
        name: "Gastroenteritis",
        symptoms: ["stomach pain", "nausea", "vomiting", "diarrhea", "belly pain"],
        description: "Inflammation of the stomach and intestines, typically resulting from bacterial toxins or viral infection.",
        treatment: ["Hydration", "Rest", "Bland diet"],
        severity: "Medium",
        affectedSystems: ["Digestive"],
        affectedOrgans: ["Stomach", "Intestines"]
    },
    {
        name: "Common Cold",
        symptoms: ["runny nose", "sore throat", "cough", "congestion", "sneezing"],
        description: "A common viral infection of the nose and throat.",
        treatment: ["Rest", "Fluids", "Over-the-counter medicines"],
        severity: "Low",
        affectedSystems: ["Respiratory"],
        affectedOrgans: ["Lungs"] // Simplified
    },
    {
        name: "Heart Attack",
        symptoms: ["chest pain", "shortness of breath", "arm pain", "sweating", "nausea"],
        description: "A blockage of blood flow to the heart muscle.",
        treatment: ["Emergency medical help", "Aspirin", "CPR if unconscious"],
        severity: "Critical",
        affectedSystems: ["Cardiovascular"],
        affectedOrgans: ["Heart"]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medical_auth_app');
        console.log('MongoDB Connected for Seeding');

        await Disease.deleteMany({}); // Clear existing
        console.log('Cleared existing diseases');

        await Disease.insertMany(diseases);
        console.log('Diseases Seeded Successfully');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
