const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// DOCTOR: Create prescription for a patient
// =====================================================
router.post('/', authenticate, authorize('doctor'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { patient_id, appointment_id, diagnosis, notes, follow_up_date, medicines = [], exercises = [] } = req.body;

    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    const [result] = await conn.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, diagnosis, notes, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, req.user.id, appointment_id || null, diagnosis || null, notes || null, follow_up_date || null]
    );
    const prescriptionId = result.insertId;

    // Insert medicines
    for (const med of medicines) {
      await conn.query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration_days, instructions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [prescriptionId, med.medicine_name, med.dosage, med.frequency, med.duration_days || null, med.instructions || null]
      );
    }

    // Insert exercises
    for (const ex of exercises) {
      await conn.query(
        `INSERT INTO exercise_prescriptions (prescription_id, exercise_name, duration_minutes, frequency, instructions)
         VALUES (?, ?, ?, ?, ?)`,
        [prescriptionId, ex.exercise_name, ex.duration_minutes || null, ex.frequency, ex.instructions || null]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'Prescription created', prescription_id: prescriptionId });
  } catch (error) {
    await conn.rollback();
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to create prescription', error: error.message });
  } finally {
    conn.release();
  }
});

// =====================================================
// GET PRESCRIPTIONS (for patient or doctor)
// =====================================================
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;
    let prescriptions;

    if (userType === 'patient') {
      const [rows] = await db.query(
        `SELECT p.*, u.full_name as doctor_name, dp.specialization
         FROM prescriptions p
         JOIN users u ON p.doctor_id = u.id
         LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
         WHERE p.patient_id = ?
         ORDER BY p.prescribed_date DESC`,
        [userId]
      );
      prescriptions = rows;
    } else if (userType === 'doctor') {
      const [rows] = await db.query(
        `SELECT p.*, u.full_name as patient_name, u.unique_id as patient_unique_id
         FROM prescriptions p
         JOIN users u ON p.patient_id = u.id
         WHERE p.doctor_id = ?
         ORDER BY p.prescribed_date DESC`,
        [userId]
      );
      prescriptions = rows;
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get medicines and exercises for each
    for (let p of prescriptions) {
      const [meds] = await db.query('SELECT * FROM prescription_items WHERE prescription_id = ?', [p.id]);
      const [exes] = await db.query('SELECT * FROM exercise_prescriptions WHERE prescription_id = ?', [p.id]);
      p.medicines = meds;
      p.exercises = exes;
    }

    res.json({ success: true, prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions' });
  }
});

// =====================================================
// LOG MEDICATION TAKEN
// =====================================================
router.post('/log-medication', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { prescription_item_id, status = 'taken', notes } = req.body;
    await db.query(
      'INSERT INTO medication_logs (patient_id, prescription_item_id, status, notes) VALUES (?, ?, ?, ?)',
      [req.user.id, prescription_item_id, status, notes || null]
    );
    res.json({ success: true, message: 'Medication logged' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log medication' });
  }
});

// =====================================================
// GET MEDICATION LOGS
// =====================================================
router.get('/medication-logs/:patientId?', authenticate, async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    // Verify access
    if (req.user.user_type === 'patient' && req.user.id != patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const [logs] = await db.query(
      `SELECT ml.*, pi.medicine_name, pi.dosage, pi.frequency
       FROM medication_logs ml
       JOIN prescription_items pi ON ml.prescription_item_id = pi.id
       WHERE ml.patient_id = ?
       ORDER BY ml.taken_at DESC LIMIT 100`,
      [patientId]
    );
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

module.exports = router;
