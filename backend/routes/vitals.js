const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// VITALS - Add vital signs
// =====================================================
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { heart_rate, bp_systolic, bp_diastolic, oxygen_level, blood_sugar, temperature, sleep_hours, steps, notes, source } = req.body;
    
    await db.query(
      `INSERT INTO vitals (patient_id, heart_rate, bp_systolic, bp_diastolic, oxygen_level, blood_sugar, temperature, sleep_hours, steps, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, heart_rate || null, bp_systolic || null, bp_diastolic || null, oxygen_level || null,
       blood_sugar || null, temperature || null, sleep_hours || null, steps || null, notes || null, source || 'manual']
    );

    res.status(201).json({ success: true, message: 'Vitals recorded' });
  } catch (error) {
    console.error('Add vitals error:', error);
    res.status(500).json({ success: false, message: 'Failed to record vitals' });
  }
});

// =====================================================
// GET VITALS (for patient or doctor accessing patient)
// =====================================================
router.get('/:patientId?', authenticate, async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    
    if (req.user.user_type === 'patient' && req.user.id != patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { limit = 30 } = req.query;
    const [vitals] = await db.query(
      'SELECT * FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT ?',
      [patientId, parseInt(limit)]
    );

    // Compute averages
    const valid = vitals.filter(v => v.heart_rate || v.bp_systolic);
    const stats = {
      total_records: vitals.length,
      avg_heart_rate: valid.length ? Math.round(valid.filter(v => v.heart_rate).reduce((s, v) => s + v.heart_rate, 0) / valid.filter(v => v.heart_rate).length) || null : null,
      avg_bp_systolic: valid.length ? Math.round(valid.filter(v => v.bp_systolic).reduce((s, v) => s + v.bp_systolic, 0) / valid.filter(v => v.bp_systolic).length) || null : null,
    };

    res.json({ success: true, vitals, stats });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vitals' });
  }
});

module.exports = router;
