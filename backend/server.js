require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/authRoutes');
const exhibitionRoutes = require('./routes/exhibitionRoutes');
const stationRoutes = require('./routes/stationRoutes'); // Import station routes

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Mount the authentication routes
app.use('/api/admin', authRoutes);

// Mount the exhibition routes
app.use('/api/exhibitions', exhibitionRoutes); // This will also handle /api/exhibitions/:exhibitionId/stations

// Mount the station-specific routes (for GET by id, PUT, DELETE)
app.use('/api/stations', stationRoutes);


// Simple route for testing
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
