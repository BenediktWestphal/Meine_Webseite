const express = require('express');
const db = require('../db');
const authenticateToken = require('../authMiddleware');

const router = express.Router();
router.use(authenticateToken); // Protect all station routes

// Helper function to check if admin owns the station's exhibition
async function checkStationOwnership(stationId, adminUserId) {
  const { rows } = await db.query(
    `SELECT s.id FROM Stations s
     JOIN Exhibitions e ON s.exhibition_id = e.id
     WHERE s.id = $1 AND e.admin_user_id = $2`,
    [stationId, adminUserId]
  );
  return rows.length > 0;
}

// GET /api/stations/:id - Get a specific station
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id;
  try {
    const stationResult = await db.query(
      `SELECT s.*, e.admin_user_id
       FROM Stations s
       JOIN Exhibitions e ON s.exhibition_id = e.id
       WHERE s.id = $1`,
      [id]
    );

    if (stationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Station not found.' });
    }
    if (stationResult.rows[0].admin_user_id !== adminUserId) {
        return res.status(403).json({ message: 'Access denied to this station.' });
    }
    // Remove admin_user_id from the returned station object if not needed by client for this specific call
    const { admin_user_id, ...stationData } = stationResult.rows[0];
    res.json(stationData);
  } catch (error) {
    console.error('Error fetching station:', error);
    res.status(500).json({ message: 'Server error while fetching station.' });
  }
});

// PUT /api/stations/:id - Update a station
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, texts } = req.body; // texts should be a JSON object like {"DE": "Text DE", "EN": "Text EN"}
  const adminUserId = req.user.id;

  if (!title || !texts || typeof texts !== 'object' || Object.keys(texts).length === 0) {
    return res.status(400).json({ message: 'Title and texts (as a non-empty JSON object) are required.' });
  }
  // Basic validation for texts structure (can be more sophisticated)
  for (const lang in texts) {
    if (typeof texts[lang] !== 'string') {
      return res.status(400).json({ message: `Text for language '${lang}' must be a string.`})
    }
  }

  try {
    if (!(await checkStationOwnership(id, adminUserId))) {
      return res.status(403).json({ message: 'Access denied or station not found for update.' });
    }

    const updatedStation = await db.query(
      'UPDATE Stations SET title = $1, texts = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, texts, id]
    );
    if (updatedStation.rows.length === 0) {
      // This case should ideally be caught by checkStationOwnership, but as a fallback:
      return res.status(404).json({ message: 'Station not found after update attempt.' });
    }
    res.json(updatedStation.rows[0]);
  } catch (error) {
    console.error('Error updating station:', error);
    if (error.code === '23505') { // unique_violation, if any unique constraints are added later
        return res.status(409).json({ message: 'Update failed due to a conflict (e.g., unique constraint).', detail: error.detail });
    }
    res.status(500).json({ message: 'Server error while updating station.' });
  }
});

// DELETE /api/stations/:id - Delete a station
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id;
  try {
    if (!(await checkStationOwnership(id, adminUserId))) {
      return res.status(403).json({ message: 'Access denied or station not found for deletion.' });
    }
    const deleteOp = await db.query('DELETE FROM Stations WHERE id = $1 RETURNING *', [id]);
    if (deleteOp.rowCount === 0) {
      // Should be caught by checkStationOwnership
      return res.status(404).json({ message: 'Station not found for deletion (already deleted or wrong ID).' });
    }
    res.status(200).json({ message: 'Station deleted successfully.', station: deleteOp.rows[0] });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Server error while deleting station.' });
  }
});

module.exports = router;
