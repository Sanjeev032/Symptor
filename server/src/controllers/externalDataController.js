const { fetchWikipediaDisease, fetchWgerExercise } = require('../services/externalDataService');

const importDiseaseData = async (req, res) => {
    try {
        const { term } = req.body;
        if (!term) return res.status(400).json({ message: 'Search term is required' });

        const data = await fetchWikipediaDisease(term);

        if (!data) {
            return res.status(404).json({ message: 'No data found for this term' });
        }

        res.json(data);
    } catch (error) {
        console.error('Import Disease Error:', error);
        res.status(500).json({ message: 'External API Error' });
    }
};

const importExerciseData = async (req, res) => {
    try {
        const { term } = req.body;
        if (!term) return res.status(400).json({ message: 'Search term is required' });

        const data = await fetchWgerExercise(term);

        if (!data) {
            const wikiData = await fetchWikipediaDisease(term);
            if (wikiData) {
                return res.json({
                    name: wikiData.name,
                    type: 'Yoga',
                    description: wikiData.description,
                    difficulty: 'Beginner',
                    imageUrl: '',
                });
            }
            return res.status(404).json({ message: 'No data found for this term' });
        }

        res.json(data);
    } catch (error) {
        console.error('Import Exercise Error:', error);
        res.status(500).json({ message: 'External API Error' });
    }
};

module.exports = { importDiseaseData, importExerciseData };
