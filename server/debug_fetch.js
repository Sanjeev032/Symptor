const fetch = require('node-fetch');

async function test() {
    console.log("Debug: Starting...");
    const term = "Rickets";
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;

    console.log(`Debug: Fetching ${url}`);
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'SymptorHealthApp/1.0 (test)' }
        });
        console.log(`Debug: Status ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Debug: Title = ${data.title}`);
        } else {
            console.log("Debug: Response not OK");
            const txt = await res.text();
            console.log(txt.substring(0, 100)); // Print error
        }
    } catch (e) {
        console.error("Debug: Fetch Failed", e);
    }
}

test();
