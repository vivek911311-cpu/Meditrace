const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// PATIENT: Create a medicine request
// =====================================================
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { shop_id, medicine_name, inventory_id, quantity, notes } = req.body;
    if (!shop_id || !medicine_name) {
      return res.status(400).json({ success: false, message: 'Shop and medicine name are required' });
    }
    const [result] = await db.query(
      `INSERT INTO medicine_requests (patient_id, shop_id, medicine_name, inventory_id, quantity, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, shop_id, medicine_name, inventory_id || null, quantity || 1, notes || null]
    );
    res.status(201).json({ success: true, message: 'Request sent to pharmacy', id: result.insertId });
  } catch (error) {
    console.error('Create medicine request error:', error);
    res.status(500).json({ success: false, message: 'Failed to send request', error: error.message });
  }
});

// =====================================================
// GET medicine requests (patient sees own, pharmacy sees theirs)
// =====================================================
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.user_type === 'patient') {
      query = `
        SELECT mr.*, u.full_name as shop_name, mp.shop_name as shop_display_name,
               mp.city, mp.address, u.phone as shop_phone
        FROM medicine_requests mr
        JOIN users u ON mr.shop_id = u.id
        LEFT JOIN medical_profiles mp ON u.id = mp.user_id
        WHERE mr.patient_id = ?
        ORDER BY mr.created_at DESC`;
      params = [req.user.id];
    } else if (req.user.user_type === 'medical') {
      query = `
        SELECT mr.*, u.full_name as patient_name, u.unique_id as patient_unique_id,
               u.phone as patient_phone
        FROM medicine_requests mr
        JOIN users u ON mr.patient_id = u.id
        WHERE mr.shop_id = ?
        ORDER BY 
          CASE mr.status 
            WHEN 'pending' THEN 1 
            WHEN 'accepted' THEN 2 
            WHEN 'ready' THEN 3 
            WHEN 'completed' THEN 4 
            ELSE 5 
          END,
          mr.created_at DESC`;
      params = [req.user.id];
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const [requests] = await db.query(query, params);
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get medicine requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
});

// =====================================================
// MEDICAL SHOP: Update request status
// =====================================================
router.put('/:id/status', authenticate, authorize('medical'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pharmacy_notes } = req.body;
    const validStatuses = ['pending', 'accepted', 'ready', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    // Verify ownership
    const [rows] = await db.query('SELECT shop_id FROM medicine_requests WHERE id = ?', [id]);
    if (rows.length === 0 || rows[0].shop_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await db.query(
      'UPDATE medicine_requests SET status = ?, pharmacy_notes = COALESCE(?, pharmacy_notes) WHERE id = ?',
      [status, pharmacy_notes || null, id]
    );
    res.json({ success: true, message: 'Request updated' });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ success: false, message: 'Failed to update request' });
  }
});

// =====================================================
// PATIENT: Cancel their own pending request
// =====================================================
router.delete('/:id', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT patient_id, status FROM medicine_requests WHERE id = ?', [id]);
    if (rows.length === 0 || rows[0].patient_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending requests' });
    }
    await db.query('DELETE FROM medicine_requests WHERE id = ?', [id]);
    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel' });
  }
});

module.exports = router;
