require('dotenv').config();
const { fetchWikipediaDisease } = require('./src/services/externalDataService');

async function test() {
    try {
        console.log("--- TEST START ---");

        console.log("\n1. Testing Wikipedia 'rickets' with Enrichment...");
        const d1 = await fetchWikipediaDisease('rickets');

        if (d1) {
            console.log("Name:", d1.name);
            console.log("Description (truncated):", d1.description.substring(0, 50) + "...");
            console.log("Symptoms:", JSON.stringify(d1.symptoms, null, 2));
            console.log("Affected Systems:", JSON.stringify(d1.affectedSystems, null, 2));
            console.log("Treatments:", JSON.stringify(d1.treatment, null, 2));
            console.log("Affected Organs:", JSON.stringify(d1.affectedOrganIds, null, 2));
            console.log("Severity:", d1.severity);
        } else {
            console.log("Result: NULL");
        }

        console.log("--- TEST END ---");
    } catch (e) {
        console.error(e);
    }
}

test();
