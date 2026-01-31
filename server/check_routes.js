try {
    console.log('Checking authRoutes...');
    require('./src/routes/authRoutes');
    console.log('authRoutes ok');

    console.log('Checking diagnosisRoutes...');
    require('./src/routes/diagnosisRoutes');
    console.log('diagnosisRoutes ok');

    console.log('Checking adminRoutes...');
    require('./src/routes/adminRoutes');
    console.log('adminRoutes ok');

    console.log('Checking chatRoutes...');
    require('./src/routes/chatRoutes');
    console.log('chatRoutes ok');

    console.log('Checking recommendationRoutes...');
    require('./src/routes/recommendationRoutes');
    console.log('recommendationRoutes ok');
} catch (e) {
    console.error('Error loading route:', e);
}
