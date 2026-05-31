const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// GET ALL DOCTORS (browsable list)
// =====================================================
router.get('/doctors', async (req, res) => {
  try {
    const { specialization, city, search } = req.query;
    let query = `
      SELECT u.id, u.unique_id, u.full_name, u.email, u.phone, u.profile_image,
             dp.qualification, dp.specialization, dp.experience_years,
             dp.clinic_name, dp.clinic_address, dp.city, dp.state, dp.consultation_fee,
             dp.available_days, dp.available_from, dp.available_to,
             dp.bio, dp.rating, dp.total_reviews
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.user_type = 'doctor' AND u.is_active = TRUE`;
    const params = [];

    if (specialization) {
      query += ' AND dp.specialization LIKE ?';
      params.push(`%${specialization}%`);
    }
    if (city) {
      query += ' AND dp.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (search) {
      query += ' AND (u.full_name LIKE ? OR dp.specialization LIKE ? OR dp.clinic_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY dp.rating DESC, dp.experience_years DESC';

    const [doctors] = await db.query(query, params);
    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
});

// =====================================================
// BOOK APPOINTMENT
// =====================================================
router.post('/book', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason, symptoms_summary } = req.body;

    console.log('[BOOK] Incoming:', { doctor_id, appointment_date, appointment_time, patient_id: req.user.id });

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'Doctor, date and time are required' });
    }

    // Normalize time format to HH:MM:SS
    let timeNormalized = appointment_time;
    if (typeof timeNormalized === 'string' && timeNormalized.length === 5) {
      timeNormalized = timeNormalized + ':00';
    }

    // Check if doctor exists
    const [doctor] = await db.query("SELECT id FROM users WHERE id = ? AND user_type = 'doctor'", [doctor_id]);
    if (doctor.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check for existing appointment at the same time
    const [conflict] = await db.query(
      "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status NOT IN ('cancelled')",
      [doctor_id, appointment_date, timeNormalized]
    );
    if (conflict.length > 0) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked. Please choose another time.' });
    }

    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, symptoms_summary, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, doctor_id, appointment_date, timeNormalized, reason || null, symptoms_summary || null]
    );

    console.log('[BOOK] Success, id:', result.insertId);
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment_id: result.insertId,
    });
  } catch (error) {
    console.error('[BOOK] Error:', error.code, error.sqlMessage || error.message);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || 'Booking failed',
      code: error.code,
    });
  }
});

// =====================================================
// GET PATIENT'S APPOINTMENTS
// =====================================================
router.get('/my-appointments', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;
    let query;

    if (userType === 'patient') {
      query = `
        SELECT a.*, u.full_name as doctor_name, u.unique_id as doctor_unique_id,
               dp.specialization, dp.clinic_name, dp.clinic_address, dp.consultation_fee, u.phone as doctor_phone
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    } else if (userType === 'doctor') {
      query = `
        SELECT a.*, u.full_name as patient_name, u.unique_id as patient_unique_id, u.phone as patient_phone,
               pp.gender, pp.blood_group, pp.allergies, pp.chronic_conditions,
               TIMESTAMPDIFF(YEAR, pp.date_of_birth, CURDATE()) as patient_age
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        LEFT JOIN patient_profiles pp ON u.id = pp.user_id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [appointments] = await db.query(query, [userId]);
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

// =====================================================
// UPDATE APPOINTMENT STATUS (doctor)
// =====================================================
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userType = req.user.user_type;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Get appointment to verify ownership
    const [appt] = await db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (appt.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify permissions
    if (userType === 'patient' && appt[0].patient_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (userType === 'doctor' && appt[0].doctor_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    // Patient can only cancel
    if (userType === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
    }

    await db.query(
      'UPDATE appointments SET status = ?, notes = COALESCE(?, notes) WHERE id = ?',
      [status, notes || null, appointmentId]
    );

    res.json({ success: true, message: 'Appointment updated' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
});

module.exports = router;
