const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  let connection;
  try {
    console.log('🚀 Initializing MediTrace database...\n');

    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📋 Creating database and tables...');
    await connection.query(schema);
    console.log('✅ Tables created successfully\n');

    // Read and execute seed data
    const seedPath = path.join(__dirname, 'seed.sql');
    let seedData = fs.readFileSync(seedPath, 'utf8');

    // Generate fresh bcrypt hash for demo users
    const demoPasswordHash = await bcrypt.hash('password123', 10);
    seedData = seedData.replace(/\$2a\$10\$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6\./g, demoPasswordHash);

    console.log('🌱 Seeding database with medical data...');
    console.log('   - 100+ symptoms');
    console.log('   - 60+ diseases');
    console.log('   - Disease-symptom mappings');
    console.log('   - Healthy habits library');
    console.log('   - Demo users and inventory');
    await connection.query(seedData);
    console.log('\n✅ Database seeded successfully!\n');

    console.log('═══════════════════════════════════════════');
    console.log('  📌 DEMO LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('  Patient:  patient@demo.com  / password123');
    console.log('  Doctor:   doctor@demo.com   / password123');
    console.log('  Cardio:   cardio@demo.com   / password123');
    console.log('  Neuro:    neuro@demo.com    / password123');
    console.log('  Medical:  medical@demo.com  / password123');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
