const Disease = require('../models/Disease');

const createDisease = async (req, res) => {
    try {
        const newDisease = new Disease(req.body);
        const savedDisease = await newDisease.save();
        res.json(savedDisease);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllDiseases = async (req, res) => {
    try {
        const diseases = await Disease.find();
        res.json(diseases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateDisease = async (req, res) => {
    try {
        const updatedDisease = await Disease.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedDisease);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteDisease = async (req, res) => {
    try {
        await Disease.findByIdAndDelete(req.params.id);
        res.json({ message: 'Disease deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createDisease,
    getAllDiseases,
    updateDisease,
    deleteDisease
};
