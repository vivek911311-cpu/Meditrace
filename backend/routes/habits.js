const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET ALL HABITS
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM healthy_habits';
    const params = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY category, title';
    const [habits] = await db.query(query, params);
    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch habits' });
  }
});

// LOG HABIT COMPLETION
router.post('/log', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { habit_id, custom_habit_name, completed = true, duration_minutes, notes } = req.body;
    await db.query(
      `INSERT INTO habit_logs (patient_id, habit_id, custom_habit_name, completed, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, habit_id || null, custom_habit_name || null, completed, duration_minutes || null, notes || null]
    );
    res.json({ success: true, message: 'Habit logged' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log habit' });
  }
});

// GET MY HABIT LOGS
router.get('/my-logs', authenticate, authorize('patient'), async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT hl.*, hh.title as habit_title, hh.category
       FROM habit_logs hl
       LEFT JOIN healthy_habits hh ON hl.habit_id = hh.id
       WHERE hl.patient_id = ?
       ORDER BY hl.log_date DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

module.exports = router;
