const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// GET ALL SYMPTOMS (grouped by category)
// =====================================================
router.get('/symptoms', async (req, res) => {
  try {
    const [symptoms] = await db.query('SELECT id, name, category, description FROM symptoms ORDER BY category, name');
    
    // Group by category
    const grouped = symptoms.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});

    res.json({ success: true, symptoms, grouped });
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch symptoms' });
  }
});

// =====================================================
// GET ALL DISEASES
// =====================================================
router.get('/diseases', async (req, res) => {
  try {
    const [diseases] = await db.query('SELECT * FROM diseases ORDER BY name');
    res.json({ success: true, diseases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diseases' });
  }
});

// =====================================================
// DISEASE PREDICTION ENDPOINT
// Uses weighted matching algorithm
// =====================================================
router.post('/predict', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { symptom_ids, severity = {}, vitals = {} } = req.body;
    const patientId = req.user.id;

    if (!Array.isArray(symptom_ids) || symptom_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one symptom' });
    }

    // Get all disease-symptom mappings for selected symptoms
    const placeholders = symptom_ids.map(() => '?').join(',');
    const [matchedRows] = await db.query(
      `SELECT ds.disease_id, ds.symptom_id, ds.weight, d.name as disease_name, 
              d.description, d.severity, d.recommended_specialization, 
              d.precautions, d.treatment_overview, s.name as symptom_name
       FROM disease_symptoms ds
       JOIN diseases d ON ds.disease_id = d.id
       JOIN symptoms s ON ds.symptom_id = s.id
       WHERE ds.symptom_id IN (${placeholders})`,
      symptom_ids
    );

    // Get total weights per disease
    const [totalWeights] = await db.query(
      `SELECT disease_id, SUM(weight) as total_weight, COUNT(*) as total_symptoms
       FROM disease_symptoms GROUP BY disease_id`
    );
    const totalWeightMap = {};
    totalWeights.forEach(r => { totalWeightMap[r.disease_id] = r; });

    // Aggregate matches per disease
    const diseaseScores = {};
    matchedRows.forEach(row => {
      if (!diseaseScores[row.disease_id]) {
        diseaseScores[row.disease_id] = {
          disease_id: row.disease_id,
          disease_name: row.disease_name,
          description: row.description,
          severity: row.severity,
          recommended_specialization: row.recommended_specialization,
          precautions: row.precautions,
          treatment_overview: row.treatment_overview,
          matched_symptoms: [],
          matched_weight: 0,
        };
      }
      // Apply severity multiplier (1-3 from user)
      const userSeverity = severity[row.symptom_id] || 2;
      const severityMultiplier = userSeverity / 2; // 0.5x for mild (1), 1x for moderate (2), 1.5x for severe (3)
      diseaseScores[row.disease_id].matched_weight += parseFloat(row.weight) * severityMultiplier;
      diseaseScores[row.disease_id].matched_symptoms.push(row.symptom_name);
    });

    // Calculate probability for each disease
    const predictions = Object.values(diseaseScores).map(d => {
      const total = totalWeightMap[d.disease_id];
      const totalWeight = total ? parseFloat(total.total_weight) : 1;
      // Probability = (matched weight / total weight) * 100, capped at 95%
      const probability = Math.min(95, (d.matched_weight / totalWeight) * 100);
      return {
        ...d,
        probability: parseFloat(probability.toFixed(2)),
        matched_count: d.matched_symptoms.length,
        total_disease_symptoms: total ? total.total_symptoms : 0,
      };
    });

    // Sort by probability descending and take top 4
    predictions.sort((a, b) => b.probability - a.probability);
    const top4 = predictions.slice(0, 4);

    // Vitals-based warnings
    const warnings = [];
    if (vitals.heart_rate) {
      const hr = parseInt(vitals.heart_rate);
      if (hr > 100) warnings.push({ type: 'high', vital: 'Heart Rate', message: `Elevated heart rate (${hr} bpm). Normal: 60-100 bpm.` });
      if (hr < 60) warnings.push({ type: 'low', vital: 'Heart Rate', message: `Low heart rate (${hr} bpm). Consider consulting a doctor.` });
    }
    if (vitals.bp_systolic && vitals.bp_diastolic) {
      const sys = parseInt(vitals.bp_systolic), dia = parseInt(vitals.bp_diastolic);
      if (sys >= 140 || dia >= 90) warnings.push({ type: 'high', vital: 'Blood Pressure', message: `High BP (${sys}/${dia}). Consult a doctor.` });
      else if (sys < 90 || dia < 60) warnings.push({ type: 'low', vital: 'Blood Pressure', message: `Low BP (${sys}/${dia}).` });
    }
    if (vitals.oxygen_level) {
      const ox = parseFloat(vitals.oxygen_level);
      if (ox < 95) warnings.push({ type: 'low', vital: 'Oxygen Level', message: `Low SpO2 (${ox}%). Seek immediate attention if below 92%.` });
    }
    if (vitals.blood_sugar) {
      const bs = parseFloat(vitals.blood_sugar);
      if (bs > 200) warnings.push({ type: 'high', vital: 'Blood Sugar', message: `High blood sugar (${bs} mg/dL). Consult an endocrinologist.` });
      else if (bs < 70) warnings.push({ type: 'low', vital: 'Blood Sugar', message: `Low blood sugar (${bs} mg/dL). Have something sweet immediately.` });
    }
    if (vitals.temperature) {
      const t = parseFloat(vitals.temperature);
      if (t >= 100.4) warnings.push({ type: 'high', vital: 'Temperature', message: `Fever detected (${t}°F).` });
    }

    // Save to history
    await db.query(
      `INSERT INTO symptom_checks (patient_id, symptoms_data, vitals_data, predictions, top_disease, top_probability)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        JSON.stringify({ symptom_ids, severity }),
        JSON.stringify(vitals),
        JSON.stringify(top4),
        top4[0]?.disease_name || null,
        top4[0]?.probability || 0,
      ]
    );

    res.json({
      success: true,
      predictions: top4,
      warnings,
      total_matched: predictions.length,
    });
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ success: false, message: 'Prediction failed', error: error.message });
  }
});

// =====================================================
// GET PREDICTION HISTORY for a patient
// =====================================================
router.get('/history', authenticate, authorize('patient'), async (req, res) => {
  try {
    const [history] = await db.query(
      'SELECT id, top_disease, top_probability, predictions, vitals_data, checked_at FROM symptom_checks WHERE patient_id = ? ORDER BY checked_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// =====================================================
// GET DOCTORS BY SPECIALIZATION
// =====================================================
router.get('/doctors/:specialization', async (req, res) => {
  try {
    const { specialization } = req.params;
    const [doctors] = await db.query(
      `SELECT u.id, u.unique_id, u.full_name, u.email, u.phone, 
              dp.qualification, dp.specialization, dp.experience_years,
              dp.clinic_name, dp.clinic_address, dp.city, dp.consultation_fee,
              dp.available_days, dp.available_from, dp.available_to,
              dp.bio, dp.rating, dp.total_reviews
       FROM users u
       JOIN doctor_profiles dp ON u.id = dp.user_id
       WHERE u.user_type = 'doctor' AND u.is_active = TRUE
         AND (dp.specialization LIKE ? OR dp.specialization LIKE ?)
       ORDER BY dp.rating DESC, dp.experience_years DESC`,
      [`%${specialization}%`, '%General%']
    );
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
});

module.exports = router;
