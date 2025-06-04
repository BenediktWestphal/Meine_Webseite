const express = require('express');
const db = require('../db');
// No need for individual authenticateToken here, as the parent router (exhibitionRoutes) will apply it.

// Pass { mergeParams: true } to access :exhibitionId from the parent router
const router = express.Router({ mergeParams: true });

// POST /api/exhibitions/:exhibitionId/stations - Create a new station for an exhibition
router.post('/', async (req, res) => {
  const { exhibitionId } = req.params; // From parent router
  const { title, texts } = req.body; // texts is a JSON object e.g. {"DE": "German text", "EN": "English text"}
  const adminUserId = req.user.id; // From authenticateToken in parent router (exhibitionRoutes)

  if (!title || !texts || typeof texts !== 'object' || Object.keys(texts).length === 0) {
    return res.status(400).json({ message: 'Title and texts (as a non-empty JSON object) are required for the station.' });
  }
   for (const lang in texts) {
    if (typeof texts[lang] !== 'string') {
      return res.status(400).json({ message: `Text for language '${lang}' must be a string.`})
    }
  }


  try {
    // Verify the exhibition exists and belongs to the admin
    const exhibitionCheck = await db.query('SELECT id FROM Exhibitions WHERE id = $1 AND admin_user_id = $2', [exhibitionId, adminUserId]);
    if (exhibitionCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Exhibition not found or access denied.' });
    }

    const newStation = await db.query(
      'INSERT INTO Stations (exhibition_id, title, texts) VALUES ($1, $2, $3) RETURNING *',
      [exhibitionId, title, texts]
    );
    res.status(201).json(newStation.rows[0]);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ message: 'Server error while creating station.' });
  }
});

// GET /api/exhibitions/:exhibitionId/stations - Get all stations for an exhibition
router.get('/', async (req, res) => {
  const { exhibitionId } = req.params;
  const adminUserId = req.user.id;

  try {
    // Verify the exhibition exists and belongs to the admin
    const exhibitionCheck = await db.query('SELECT id FROM Exhibitions WHERE id = $1 AND admin_user_id = $2', [exhibitionId, adminUserId]);
    if (exhibitionCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Exhibition not found or access denied.' });
    }

    const stations = await db.query(
      'SELECT * FROM Stations WHERE exhibition_id = $1 ORDER BY created_at ASC', // Or by some other order, e.g., title
      [exhibitionId]
    );
    res.json(stations.rows);
  } catch (error) {
    console.error('Error fetching stations for exhibition:', error);
    res.status(500).json({ message: 'Server error while fetching stations.' });
  }
});

module.exports = router;
