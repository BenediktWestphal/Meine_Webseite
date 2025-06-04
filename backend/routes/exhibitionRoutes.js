const express = require('express');
const db = require('../db'); // Database connection module
const authenticateToken = require('../authMiddleware'); // JWT authentication middleware
const qrcode = require('qrcode'); // Added for QR Code generation

const router = express.Router();
const exhibitionStationRoutes = require("./exhibitionStationRoutes"); // Added for nested station routes

// Apply JWT authentication middleware to all routes in this file
router.use(authenticateToken);

// POST /api/exhibitions - Create a new exhibition
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  const adminUserId = req.user.id; // Extracted from JWT by authenticateToken middleware

  if (!title) {
    return res.status(400).json({ message: 'Title is required for the exhibition.' });
  }

  try {
    const newExhibition = await db.query(
      'INSERT INTO Exhibitions (admin_user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [adminUserId, title, description || null]
    );
    res.status(201).json(newExhibition.rows[0]);
  } catch (error) {
    console.error('Error creating exhibition:', error);
    res.status(500).json({ message: 'Server error while creating exhibition.' });
  }
});

// GET /api/exhibitions - Get all exhibitions for the logged-in admin
router.get('/', async (req, res) => {
  const adminUserId = req.user.id;
  try {
    const exhibitions = await db.query(
      'SELECT * FROM Exhibitions WHERE admin_user_id = $1 ORDER BY created_at DESC',
      [adminUserId]
    );
    res.json(exhibitions.rows);
  } catch (error) {
    console.error('Error fetching exhibitions:', error);
    res.status(500).json({ message: 'Server error while fetching exhibitions.' });
  }
});

// GET /api/exhibitions/:id - Get a specific exhibition
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id;
  try {
    const exhibition = await db.query(
      'SELECT * FROM Exhibitions WHERE id = $1 AND admin_user_id = $2',
      [id, adminUserId]
    );
    if (exhibition.rows.length === 0) {
      return res.status(404).json({ message: 'Exhibition not found or access denied.' });
    }
    res.json(exhibition.rows[0]);
  } catch (error) {
    console.error('Error fetching exhibition:', error);
    res.status(500).json({ message: 'Server error while fetching exhibition.' });
  }
});

// PUT /api/exhibitions/:id - Update an exhibition
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const adminUserId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: 'Title cannot be empty.' });
  }

  try {
    const updatedExhibition = await db.query(
      'UPDATE Exhibitions SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND admin_user_id = $4 RETURNING *',
      [title, description || null, id, adminUserId]
    );
    if (updatedExhibition.rows.length === 0) {
      return res.status(404).json({ message: 'Exhibition not found or access denied for update.' });
    }
    res.json(updatedExhibition.rows[0]);
  } catch (error) {
    console.error('Error updating exhibition:', error);
    res.status(500).json({ message: 'Server error while updating exhibition.' });
  }
});

// DELETE /api/exhibitions/:id - Delete an exhibition
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id;
  try {
    // Consider consequences: deleting an exhibition will also delete its stations due to ON DELETE CASCADE.
    const deleteOp = await db.query(
      'DELETE FROM Exhibitions WHERE id = $1 AND admin_user_id = $2 RETURNING *',
      [id, adminUserId]
    );
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Exhibition not found or access denied for deletion.' });
    }
    res.status(200).json({ message: 'Exhibition deleted successfully.', exhibition: deleteOp.rows[0] });
  } catch (error) { // Corrected the typo here from "error)_" to "error"
    console.error('Error deleting exhibition:', error);
    res.status(500).json({ message: 'Server error while deleting exhibition.' });
  }
});

// GET /api/exhibitions/:id/qrcode - Generate QR code for an exhibition's visitor page
router.get('/:id/qrcode', async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.id; // From authenticateToken

  try {
    // First, verify the exhibition exists and belongs to the admin
    const exhibition = await db.query(
      'SELECT id, title FROM Exhibitions WHERE id = $1 AND admin_user_id = $2',
      [id, adminUserId]
    );

    if (exhibition.rows.length === 0) {
      return res.status(404).json({ message: 'Exhibition not found or access denied.' });
    }

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'; // Default if not set
    const visitorUrl = `${frontendBaseUrl}/visitor/exhibition/${id}`;

    // Generate QR code as a Data URL
    qrcode.toDataURL(visitorUrl, { errorCorrectionLevel: 'H' }, (err, dataUrl) => {
      if (err) {
        console.error('QR Code Generation Error:', err);
        return res.status(500).json({ message: 'Failed to generate QR code.' });
      }
      res.json({
        message: 'QR code generated successfully.',
        exhibitionId: id,
        exhibitionTitle: exhibition.rows[0].title,
        visitorUrl: visitorUrl,
        qrCodeDataUrl: dataUrl
      });
    });
  } catch (error) {
    console.error('Error generating QR code for exhibition:', error);
    res.status(500).json({ message: 'Server error while generating QR code.' });
  }
});

// Mount routes for stations specific to an exhibition
// These routes will be prefixed with /api/exhibitions/:exhibitionId/stations
router.use("/:exhibitionId/stations", exhibitionStationRoutes);

module.exports = router;
