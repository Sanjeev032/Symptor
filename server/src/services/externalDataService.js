// Native fetch is used (Node 18+)
// const fetch = require('node-fetch'); // Removed to avoid ESM/CJS conflicts
const { reliableChatMessage } = require('../utils/aiClient');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 3600 * 1000;

const getCached = (key) => {
    if (cache.has(key)) {
        const { data, timestamp } = cache.get(key);
        if (Date.now() - timestamp < CACHE_TTL) return data;
        cache.delete(key);
    }
    return null;
};

const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Helper: Title Case (Capitalize first letter of each word)
const toTitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

// Headers are critical for Wikipedia API
const HEADERS = {
    'User-Agent': 'SymptorHealthApp/1.0 (educational project; contact@symptor.ai)',
    'Accept': 'application/json'
};

// Valid Organ IDs from client/src/data/bodySystems.js
const VALID_ORGAN_IDS = [
    // Skeletal
    'skull', 'spine', 'ribs', 'pelvis', 'l_arm_upper', 'r_arm_upper', 'l_leg_upper', 'r_leg_upper',
    // Digestive
    'esophagus', 'stomach', 'liver', 'intestines', 'colon',
    // Respiratory
    'trachea', 'l_lung', 'r_lung',
    // Circulatory
    'heart', 'aorta',
    // Muscular
    'pecs', 'abs', 'quads',
    // Nervous
    'brain', 'spinal_cord',
    // Integumentary
    'skin'
];

/**
 * Fetch high-quality images from Wikimedia Commons
 * @param {string} query - Search term
 * @param {string} context - 'disease' or 'exercise' to refine search
 */
const fetchWikimediaImages = async (query, context = '') => {
    try {
        // Refine query based on context to get better results
        let searchQuery = query;
        if (context === 'exercise' && !query.toLowerCase().includes('yoga') && !query.toLowerCase().includes('exercise')) {
            searchQuery += ' exercise';
        } else if (context === 'disease') {
            searchQuery += ' medical diagram'; // Prefer diagrams for diseases
        }

        const params = new URLSearchParams({
            action: 'query',
            generator: 'search',
            gsrsearch: searchQuery,
            gsrnamespace: '6', // File namespace
            gsrlimit: '3',
            prop: 'imageinfo',
            iiprop: 'url|extmetadata',
            format: 'json',
            origin: '*'
        });

        const url = `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
        console.log(`Fetching Wikimedia: ${url}`);

        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return null;

        const data = await res.json();
        if (!data.query || !data.query.pages) return null;

        // Process pages to find the best image
        const pages = Object.values(data.query.pages);

        // Sort by relevance (usually index order) or size/quality if needed
        const bestPage = pages.find(p => {
            const ext = p.imageinfo?.[0]?.extmetadata;
            // Filter out non-relevant formats if possible, or extremely small icons
            return p.imageinfo && p.imageinfo[0].url;
        });

        if (bestPage) {
            const info = bestPage.imageinfo[0];
            const meta = info.extmetadata;

            return {
                imageUrl: info.url,
                imageSource: 'Wikimedia Commons',
                imageLicense: meta.UsageTerms ? meta.UsageTerms.value : 'Public Domain',
                attribution: meta.Artist ? meta.Artist.value.replace(/<[^>]*>?/gm, '') : 'Unknown Author'
            };
        }
        return null;

    } catch (err) {
        console.error('Wikimedia Fetch Error:', err);
        return null;
    }
};

const fetchWikipediaDisease = async (term) => {
    let wikiTerm = toTitleCase(term.trim());
    const cacheKey = `wiki_disease_${wikiTerm}_enriched_v3`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTerm)}`;
        console.log(`Fetching Wiki: ${url}`);

        let response = await fetch(url, { headers: HEADERS });

        if (response.status === 404) {
            console.log("Title Case 404, retrying with raw term...");
            response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term.trim())}`, { headers: HEADERS });
        }

        if (!response.ok) return null;

        const data = await response.json();
        if (data.type === 'disambiguation') return null;

        // Fetch Image separately from Wikimedia if not good in summary
        let imageData = null;
        if (data.thumbnail) {
            imageData = {
                imageUrl: data.thumbnail.source,
                imageSource: 'Wikipedia',
                imageLicense: 'Check Source'
            };
        } else {
            imageData = await fetchWikimediaImages(wikiTerm, 'disease');
        }

        // Base Data
        const normalized = {
            name: data.title,
            description: data.extract,
            symptoms: [],
            affectedSystems: [],
            treatment: [],
            affectedOrganIds: [],
            source: 'Wikipedia',
            imageUrl: imageData ? imageData.imageUrl : '',
            imageSource: imageData ? imageData.imageSource : '',
            imageLicense: imageData ? imageData.imageLicense : ''
        };

        // --- AI ENRICHMENT ---
        try {
            console.log(`Enriching ${data.title} with AI...`);
            const prompt = `
                Analyze the following medical condition description and extract structured data as JSON.
                
                Description: "${data.extract}"
                
                Valid Organ IDs: ${JSON.stringify(VALID_ORGAN_IDS)}
                
                Return ONLY a JSON object with these keys:
                - symptoms: array of strings (e.g. ["Fever", "Cough"])
                - affectedSystems: array of strings (e.g. ["Respiratory System"])
                - treatment: array of strings (e.g. ["Antibiotics", "Rest"])
                - severity: "Low", "Medium", or "High" (infer from context)
                - affectedOrganIds: array of strings from the Valid Organ IDs list above. Map the condition to the most relevant 3D organs. (e.g. "Heart Attack" -> ["heart"], "Pneumonia" -> ["l_lung", "r_lung"]).
                
                If information is missing, infer reasonable generalities.
            `;

            const messages = [{ role: 'user', content: prompt }];

            const aiResponseStr = await reliableChatMessage(messages, { jsonMode: true });
            const aiData = JSON.parse(aiResponseStr);

            if (aiData) {
                normalized.symptoms = aiData.symptoms || [];
                normalized.affectedSystems = aiData.affectedSystems || [];
                normalized.treatment = aiData.treatment || [];
                normalized.severity = aiData.severity || 'Medium';

                // Validate Organ IDs
                if (aiData.affectedOrganIds && Array.isArray(aiData.affectedOrganIds)) {
                    normalized.affectedOrganIds = aiData.affectedOrganIds.filter(id => VALID_ORGAN_IDS.includes(id));
                }
            }
        } catch (aiError) {
            console.error("AI Enrichment Failed:", aiError);
        }
        // ---------------------

        setCache(cacheKey, normalized);
        return normalized;
    } catch (error) {
        console.error('Wikipedia API Error:', error);
        return null;
    }
};

const fetchWgerExercise = async (term) => {
    const cleanTerm = term.trim();
    const cacheKey = `wger_exercise_${cleanTerm}_enriched_v3`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        // Wger API Search
        const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(cleanTerm)}`;
        const searchRes = await fetch(url, { headers: HEADERS });

        let exercise = null;
        let wikimediaImage = await fetchWikimediaImages(cleanTerm, 'exercise');

        if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.suggestions && searchData.suggestions.length > 0) {
                const bestMatch = searchData.suggestions[0].data;
                exercise = {
                    name: bestMatch.name,
                    type: cleanTerm.toLowerCase().includes('yoga') ? 'Yoga' : 'Exercise',
                    description: `Imported from Wger: ${bestMatch.name}`,
                    difficulty: 'Beginner',
                    imageUrl: wikimediaImage ? wikimediaImage.imageUrl : '',
                    imageSource: wikimediaImage ? wikimediaImage.imageSource : 'Wger Search',
                    imageLicense: wikimediaImage ? wikimediaImage.imageLicense : '',
                    symptoms: [] // Default empty
                };
            }
        }

        // Wikipedia Enrichment (Fallback logic)
        try {
            const wikiTerm = toTitleCase(cleanTerm);
            const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTerm)}`;
            const wikiRes = await fetch(wikiUrl, { headers: HEADERS });

            let wikiData = null;
            if (wikiRes.ok) {
                wikiData = await wikiRes.json();
            } else if (wikiRes.status === 404) {
                const wikiResRaw = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTerm)}`, { headers: HEADERS });
                if (wikiResRaw.ok) wikiData = await wikiResRaw.json();
            }

            if (wikiData && wikiData.type !== 'disambiguation') {
                if (!exercise) {
                    exercise = {
                        name: wikiData.title,
                        type: 'Exercise',
                        difficulty: 'Beginner',
                        imageUrl: '',
                        imageSource: 'Wikipedia',
                        imageLicense: '',
                        symptoms: []
                    };
                }

                // If we didn't find a Wikimedia image yet, try Wiki thumbnail
                if (!exercise.imageUrl && wikiData.thumbnail) {
                    exercise.imageUrl = wikiData.thumbnail.source;
                    exercise.imageSource = 'Wikimedia Commons';
                    exercise.imageLicense = 'Public Domain/CC';
                } else if (!exercise.imageUrl) {
                    // Try Wikimedia one last time with strict title if first attempt failed
                    const retryImage = await fetchWikimediaImages(wikiData.title, 'exercise');
                    if (retryImage) {
                        exercise.imageUrl = retryImage.imageUrl;
                        exercise.imageSource = retryImage.imageSource;
                        exercise.imageLicense = retryImage.imageLicense;
                    }
                }

                // Use Wiki description if it's better or if Wger description is just the name
                if (wikiData.extract && (!exercise.description || exercise.description.length < 50)) {
                    exercise.description = wikiData.extract;
                }

                if (cleanTerm.toLowerCase().includes('yoga') || (wikiData.extract && wikiData.extract.toLowerCase().includes('yoga'))) {
                    exercise.type = 'Yoga';
                }
            }
        } catch (err) {
            console.log("Wiki Image Enrichment failed:", err);
        }

        // If still no exercise found, but we did find a wikimedia image strings, construct basic object
        if (!exercise && wikimediaImage) {
            exercise = {
                name: toTitleCase(cleanTerm),
                type: cleanTerm.toLowerCase().includes('yoga') ? 'Yoga' : 'Exercise',
                description: "Auto-generated from search results.",
                difficulty: 'Beginner',
                imageUrl: wikimediaImage.imageUrl,
                imageSource: wikimediaImage.imageSource,
                imageLicense: wikimediaImage.imageLicense,
                symptoms: []
            };
        }


        // --- AI ENRICHMENT FOR EXERCISE SYMPTOMS ---
        if (exercise) {
            try {
                // Determine description source
                const descToAnalyze = exercise.description || exercise.name;

                console.log(`Enriching Exercise ${exercise.name} with AI...`);
                const prompt = `
                    Analyze the following exercise/yoga description and extract a list of "symptoms" or "conditions" that this exercise is beneficial for.
                    
                    Exercise Name: "${exercise.name}"
                    Description: "${descToAnalyze}"
                    
                    Return ONLY a JSON object with this key:
                    - symptoms: array of strings (e.g. ["Back Pain", "Stress", "Stiff Neck", "Anxiety"])
                    
                    Infer valid medical or wellness reasons to recommend this exercise.
                `;

                const messages = [{ role: 'user', content: prompt }];
                const aiResponseStr = await reliableChatMessage(messages, { jsonMode: true });
                const aiData = JSON.parse(aiResponseStr);

                if (aiData && aiData.symptoms) {
                    exercise.symptoms = aiData.symptoms;
                }
            } catch (aiError) {
                console.error("AI Exercise Enrichment Failed:", aiError);
            }
        }
        // ------------------------------------------

        if (exercise) {
            setCache(cacheKey, exercise);
            return exercise;
        }

        return null;
    } catch (error) {
        console.error('Wger/Wiki API Error:', error);
        return null;
    }
};

module.exports = { fetchWikipediaDisease, fetchWgerExercise };
