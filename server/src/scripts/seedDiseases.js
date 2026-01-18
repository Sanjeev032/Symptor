const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Disease = require('../models/Disease');
const connectDB = require('../config/db');

dotenv.config();

const diseases = [
    // Digestive
    {
        name: "Gastritis",
        symptoms: ["stomach pain", "nausea", "bloating", "vomiting"],
        severity: "Medium",
        affectedSystems: ["digestive"],
        affectedOrgans: ["stomach"],
        description: "Inflammation of the lining of the stomach.",
        treatment: ["Antacids", "Avoid spicy food", "Antibiotics (if H. pylori)"]
    },
    {
        name: "Gastroenteritis",
        symptoms: ["diarrhea", "vomiting", "fever", "stomach cramps"],
        severity: "Medium",
        affectedSystems: ["digestive"],
        affectedOrgans: ["stomach", "intestines", "colon"],
        description: "Inflammation of the stomach and intestines, typically resulting from bacterial toxins or viral infection.",
        treatment: ["Hydration", "Rest", "Bland diet"]
    },
    // Respiratory
    {
        name: "Pneumonia",
        symptoms: ["cough", "fever", "shortness of breath", "chest pain"],
        severity: "High",
        affectedSystems: ["respiratory"],
        affectedOrgans: ["l_lung", "r_lung"],
        description: "Infection that inflames air sacs in one or both lungs, which may fill with fluid.",
        treatment: ["Antibiotics", "Cough medicine", "Fever reducers"]
    },
    {
        name: "Bronchitis",
        symptoms: ["cough", "mucus", "fatigue", "shortness of breath"],
        severity: "Low",
        affectedSystems: ["respiratory"],
        affectedOrgans: ["l_lung", "r_lung", "trachea"],
        description: "Inflammation of the lining of bronchial tubes, which carry air to and from the lungs.",
        treatment: ["Rest", "Fluids", "Humidifier"]
    },
    // Circulatory
    {
        name: "Myocardial Infarction",
        symptoms: ["chest pain", "shortness of breath", "pain in arm", "nausea"],
        severity: "Critical",
        affectedSystems: ["circulatory"],
        affectedOrgans: ["heart"],
        description: "A blockage of blood flow to the heart muscle (Heart Attack).",
        treatment: ["Emergency surgery", "Clot-busting drugs", "Aspirin"]
    },
    // Nervous
    {
        name: "Migraine",
        symptoms: ["headache", "nausea", "sensitivity to light", "visual disturbances"],
        severity: "Medium",
        affectedSystems: ["nervous"],
        affectedOrgans: ["brain"],
        description: "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.",
        treatment: ["Pain relievers", "Dark room", "Caffeine"]
    },
    {
        name: "Meningitis",
        symptoms: ["headache", "stiff neck", "fever", "sensitivity to light"],
        severity: "Critical",
        affectedSystems: ["nervous"],
        affectedOrgans: ["brain", "spinal_cord"],
        description: "Inflammation of brain and spinal cord membranes, typically caused by an infection.",
        treatment: ["Immediate antibiotics", "Corticosteroids", "Hospitalization"]
    },
    // Integumentary
    {
        name: "Dermatitis",
        symptoms: ["rash", "itchy skin", "redness", "dry skin"],
        severity: "Low",
        affectedSystems: ["integumentary"],
        affectedOrgans: ["skin"],
        description: "Inflammation of the skin causing redness, swelling, and itchiness.",
        treatment: ["Moisturizers", "Corticosteroid creams", "Antihistamines"]
    }
];

const seedDiseases = async () => {
    try {
        await connectDB();
        await Disease.deleteMany(); // Clear existing
        await Disease.insertMany(diseases);
        console.log('Diseases seeded successfully');
        process.exit();
    } catch (err) {
        console.error('Error seeding diseases:', err);
        process.exit(1);
    }
};

seedDiseases();
