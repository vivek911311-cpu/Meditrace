const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// SEARCH MEDICINES across all shops
// =====================================================
router.get('/search', async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    let sql = `
      SELECT si.*, u.full_name as shop_owner_name, u.phone as shop_phone,
             mp.shop_name, mp.address as shop_address, mp.city as shop_city,
             mp.state, mp.pincode, mp.latitude, mp.longitude,
             mp.opening_time, mp.closing_time, mp.delivery_available, mp.is_24_hours
      FROM shop_inventory si
      JOIN users u ON si.shop_id = u.id
      JOIN medical_profiles mp ON u.id = mp.user_id
      WHERE si.is_available = TRUE AND si.stock_quantity > 0
        AND (si.medicine_name LIKE ? OR si.generic_name LIKE ? OR si.category LIKE ?)`;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (city) {
      sql += ' AND mp.city LIKE ?';
      params.push(`%${city}%`);
    }

    sql += ' ORDER BY si.price ASC LIMIT 50';

    const [results] = await db.query(sql, params);
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// =====================================================
// GET ALL MEDICAL SHOPS
// =====================================================
router.get('/shops', async (req, res) => {
  try {
    const { city } = req.query;
    let query = `
      SELECT u.id, u.unique_id, u.full_name, u.email, u.phone,
             mp.shop_name, mp.license_number, mp.address, mp.city, mp.state, mp.pincode,
             mp.latitude, mp.longitude, mp.opening_time, mp.closing_time,
             mp.is_24_hours, mp.delivery_available,
             (SELECT COUNT(*) FROM shop_inventory WHERE shop_id = u.id AND is_available = TRUE) as medicine_count
      FROM users u
      JOIN medical_profiles mp ON u.id = mp.user_id
      WHERE u.user_type = 'medical' AND u.is_active = TRUE`;
    const params = [];
    if (city) {
      query += ' AND mp.city LIKE ?';
      params.push(`%${city}%`);
    }
    query += ' ORDER BY mp.shop_name';
    const [shops] = await db.query(query, params);
    res.json({ success: true, shops });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shops' });
  }
});

// =====================================================
// MEDICAL SHOP: Get own inventory
// =====================================================
router.get('/my-inventory', authenticate, authorize('medical'), async (req, res) => {
  try {
    const [inventory] = await db.query(
      'SELECT * FROM shop_inventory WHERE shop_id = ? ORDER BY medicine_name',
      [req.user.id]
    );
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

// =====================================================
// MEDICAL SHOP: Add medicine to inventory
// =====================================================
router.post('/inventory', authenticate, authorize('medical'), async (req, res) => {
  try {
    const { medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, expiry_date } = req.body;

    if (!medicine_name || price == null) {
      return res.status(400).json({ success: false, message: 'Medicine name and price are required' });
    }

    const [result] = await db.query(
      `INSERT INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, expiry_date, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, medicine_name, generic_name || null, manufacturer || null, price, stock_quantity || 0,
       category || null, description || null, expiry_date || null, (stock_quantity || 0) > 0]
    );

    res.status(201).json({ success: true, message: 'Medicine added', id: result.insertId });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to add medicine' });
  }
});

// =====================================================
// MEDICAL SHOP: Update inventory item
// =====================================================
router.put('/inventory/:id', authenticate, authorize('medical'), async (req, res) => {
  try {
    const { id } = req.params;
    const { medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, expiry_date, is_available } = req.body;

    // Verify ownership
    const [item] = await db.query('SELECT shop_id FROM shop_inventory WHERE id = ?', [id]);
    if (item.length === 0 || item[0].shop_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await db.query(
      `UPDATE shop_inventory SET 
         medicine_name = COALESCE(?, medicine_name),
         generic_name = COALESCE(?, generic_name),
         manufacturer = COALESCE(?, manufacturer),
         price = COALESCE(?, price),
         stock_quantity = COALESCE(?, stock_quantity),
         category = COALESCE(?, category),
         description = COALESCE(?, description),
         expiry_date = COALESCE(?, expiry_date),
         is_available = COALESCE(?, is_available)
       WHERE id = ?`,
      [medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, expiry_date, is_available, id]
    );

    res.json({ success: true, message: 'Inventory updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inventory' });
  }
});

// =====================================================
// MEDICAL SHOP: Delete inventory item
// =====================================================
router.delete('/inventory/:id', authenticate, authorize('medical'), async (req, res) => {
  try {
    const { id } = req.params;
    const [item] = await db.query('SELECT shop_id FROM shop_inventory WHERE id = ?', [id]);
    if (item.length === 0 || item[0].shop_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await db.query('DELETE FROM shop_inventory WHERE id = ?', [id]);
    res.json({ success: true, message: 'Medicine removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

module.exports = router;
