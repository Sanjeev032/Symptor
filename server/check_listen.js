const express = require('express');
const app = express();
console.log('Attempting to listen on port 5000');
const server = app.listen(5000, () => {
    console.log('Listening on 5000 successfully');
    server.close(() => process.exit(0));
});

server.on('error', (err) => {
    console.error('Listen failed:', err.message);
    process.exit(1);
});
