const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// Generate unique ID based on user type
function generateUniqueId(userType) {
  const prefix = { patient: 'PAT', doctor: 'DOC', medical: 'MED' }[userType];
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
}

// =====================================================
// REGISTER
// =====================================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, user_type } = req.body;

    if (!email || !password || !full_name || !user_type) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!['patient', 'doctor', 'medical'].includes(user_type)) {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const unique_id = generateUniqueId(user_type);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (unique_id, email, password, full_name, phone, user_type) VALUES (?, ?, ?, ?, ?, ?)',
      [unique_id, email, hashedPassword, full_name, phone || null, user_type]
    );

    const userId = result.insertId;

    // Create profile based on user type
    if (user_type === 'patient') {
      await db.query('INSERT INTO patient_profiles (user_id) VALUES (?)', [userId]);
    } else if (user_type === 'doctor') {
      await db.query('INSERT INTO doctor_profiles (user_id) VALUES (?)', [userId]);
    } else if (user_type === 'medical') {
      await db.query('INSERT INTO medical_profiles (user_id, shop_name) VALUES (?, ?)', [userId, full_name]);
    }

    const user = { id: userId, unique_id, email, full_name, user_type };
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// =====================================================
// LOGIN
// =====================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password, user_type } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await db.query(
      'SELECT id, unique_id, email, password, full_name, user_type, phone FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    if (user_type && user.user_type !== user_type) {
      return res.status(401).json({ success: false, message: `This account is registered as ${user.user_type}, not ${user_type}` });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    delete user.password;
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// =====================================================
// GET CURRENT USER
// =====================================================
router.get('/me', authenticate, async (req, res) => {
  try {
    // Try fetching with new columns first; fall back if columns don't exist (migration not run yet)
    let users;
    try {
      [users] = await db.query(
        'SELECT id, unique_id, email, full_name, phone, user_type, profile_image, theme_preference, lang_preference, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
    } catch (e) {
      // Fallback to columns that always exist
      [users] = await db.query(
        'SELECT id, unique_id, email, full_name, phone, user_type, profile_image, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
    }

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let profile = null;

    if (user.user_type === 'patient') {
      const [profiles] = await db.query('SELECT * FROM patient_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || null;
    } else if (user.user_type === 'doctor') {
      const [profiles] = await db.query('SELECT * FROM doctor_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || null;
    } else if (user.user_type === 'medical') {
      const [profiles] = await db.query('SELECT * FROM medical_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || null;
    }

    res.json({ success: true, user, profile });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// =====================================================
// UPDATE PROFILE
// =====================================================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;
    const data = req.body;

    // Update base user fields if provided
    if (data.full_name || data.phone) {
      await db.query('UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [data.full_name || null, data.phone || null, userId]);
    }

    if (userType === 'patient') {
      await db.query(
        `UPDATE patient_profiles SET 
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender),
          blood_group = COALESCE(?, blood_group),
          height_cm = COALESCE(?, height_cm),
          weight_kg = COALESCE(?, weight_kg),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          emergency_contact = COALESCE(?, emergency_contact),
          allergies = COALESCE(?, allergies),
          chronic_conditions = COALESCE(?, chronic_conditions)
        WHERE user_id = ?`,
        [data.date_of_birth, data.gender, data.blood_group, data.height_cm, data.weight_kg,
         data.address, data.city, data.state, data.pincode, data.emergency_contact,
         data.allergies, data.chronic_conditions, userId]
      );
    } else if (userType === 'doctor') {
      await db.query(
        `UPDATE doctor_profiles SET 
          qualification = COALESCE(?, qualification),
          specialization = COALESCE(?, specialization),
          experience_years = COALESCE(?, experience_years),
          license_number = COALESCE(?, license_number),
          clinic_name = COALESCE(?, clinic_name),
          clinic_address = COALESCE(?, clinic_address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          consultation_fee = COALESCE(?, consultation_fee),
          available_days = COALESCE(?, available_days),
          available_from = COALESCE(?, available_from),
          available_to = COALESCE(?, available_to),
          bio = COALESCE(?, bio)
        WHERE user_id = ?`,
        [data.qualification, data.specialization, data.experience_years, data.license_number,
         data.clinic_name, data.clinic_address, data.city, data.state, data.pincode,
         data.consultation_fee, data.available_days, data.available_from, data.available_to,
         data.bio, userId]
      );
    } else if (userType === 'medical') {
      await db.query(
        `UPDATE medical_profiles SET 
          shop_name = COALESCE(?, shop_name),
          license_number = COALESCE(?, license_number),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          opening_time = COALESCE(?, opening_time),
          closing_time = COALESCE(?, closing_time),
          is_24_hours = COALESCE(?, is_24_hours),
          delivery_available = COALESCE(?, delivery_available)
        WHERE user_id = ?`,
        [data.shop_name, data.license_number, data.address, data.city, data.state, data.pincode,
         data.latitude, data.longitude, data.opening_time, data.closing_time,
         data.is_24_hours, data.delivery_available, userId]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// =====================================================
// UPLOAD PROFILE PHOTO (base64)
// We store as base64 data URL in profile_image column.
// Frontend should compress to ~200KB max before sending.
// =====================================================
router.post('/profile-photo', authenticate, async (req, res) => {
  try {
    const { image_data } = req.body;
    if (!image_data || !image_data.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }
    // Soft limit: 1MB base64 (~750KB image)
    if (image_data.length > 1_400_000) {
      return res.status(400).json({ success: false, message: 'Image too large. Please use a smaller image (max ~750KB).' });
    }
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [image_data, req.user.id]);
    res.json({ success: true, message: 'Profile photo updated', image_data });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to update photo' });
  }
});

// =====================================================
// UPDATE USER PREFERENCES (theme + language)
// =====================================================
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { theme, lang } = req.body;
    const updates = [];
    const params = [];
    if (theme && ['light', 'dark'].includes(theme)) {
      updates.push('theme_preference = ?');
      params.push(theme);
    }
    if (lang && ['en', 'hi', 'mr'].includes(lang)) {
      updates.push('lang_preference = ?');
      params.push(lang);
    }
    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No valid preferences provided' });
    }
    params.push(req.user.id);
    try {
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    } catch (e) {
      // If columns don't exist (migration not run), don't fail — just acknowledge
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        return res.json({ success: true, message: 'Preferences saved locally (migration pending)' });
      }
      throw e;
    }
    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

module.exports = router;
