async function test() {
    try {
        console.log("Testing Global Fetch...");
        if (typeof fetch !== 'undefined') {
            console.log("Global fetch is available!");
            const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
            console.log("Status:", res.status);
        } else {
            console.log("Global fetch is NOT available.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
