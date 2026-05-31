-- =====================================================
-- MediTrace Database Schema
-- Digital Healthcare Platform
-- =====================================================

CREATE DATABASE IF NOT EXISTS meditrace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meditrace;

-- =====================================================
-- USERS TABLE (base table for all user types)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unique_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  user_type ENUM('patient', 'doctor', 'medical') NOT NULL,
  profile_image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_unique_id (unique_id),
  INDEX idx_user_type (user_type)
);

-- =====================================================
-- PATIENT PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  blood_group VARCHAR(5),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  emergency_contact VARCHAR(20),
  allergies TEXT,
  chronic_conditions TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- DOCTOR PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  qualification VARCHAR(255),
  specialization VARCHAR(150),
  experience_years INT DEFAULT 0,
  license_number VARCHAR(100),
  clinic_name VARCHAR(200),
  clinic_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
  available_from TIME DEFAULT '09:00:00',
  available_to TIME DEFAULT '18:00:00',
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_specialization (specialization),
  INDEX idx_city (city)
);

-- =====================================================
-- MEDICAL SHOP PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shop_name VARCHAR(200) NOT NULL,
  license_number VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_time TIME DEFAULT '08:00:00',
  closing_time TIME DEFAULT '22:00:00',
  is_24_hours BOOLEAN DEFAULT FALSE,
  delivery_available BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city (city)
);

-- =====================================================
-- SYMPTOMS MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS symptoms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- =====================================================
-- DISEASES MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS diseases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  severity ENUM('mild', 'moderate', 'severe', 'critical') DEFAULT 'moderate',
  recommended_specialization VARCHAR(150),
  precautions TEXT,
  treatment_overview TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_specialization (recommended_specialization)
);

-- =====================================================
-- DISEASE-SYMPTOMS MAPPING (Many-to-Many with weight)
-- This drives the disease prediction algorithm
-- =====================================================
CREATE TABLE IF NOT EXISTS disease_symptoms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disease_id INT NOT NULL,
  symptom_id INT NOT NULL,
  weight DECIMAL(4,2) DEFAULT 1.0,
  FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
  FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_disease_symptom (disease_id, symptom_id),
  INDEX idx_disease (disease_id),
  INDEX idx_symptom (symptom_id)
);

-- =====================================================
-- VITALS TRACKING (for health monitoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS vitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  heart_rate INT,
  bp_systolic INT,
  bp_diastolic INT,
  oxygen_level DECIMAL(5,2),
  blood_sugar DECIMAL(6,2),
  temperature DECIMAL(4,2),
  sleep_hours DECIMAL(4,2),
  steps INT,
  notes TEXT,
  source ENUM('manual', 'watch') DEFAULT 'manual',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patient_date (patient_id, recorded_at)
);

-- =====================================================
-- SYMPTOM CHECK HISTORY (predictions log)
-- =====================================================
CREATE TABLE IF NOT EXISTS symptom_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  symptoms_data JSON,
  vitals_data JSON,
  predictions JSON,
  top_disease VARCHAR(200),
  top_probability DECIMAL(5,2),
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patient (patient_id)
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  symptoms_summary TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_date (appointment_date),
  INDEX idx_status (status)
);

-- =====================================================
-- PRESCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT,
  diagnosis TEXT,
  notes TEXT,
  prescribed_date DATE DEFAULT (CURRENT_DATE),
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id)
);

-- =====================================================
-- PRESCRIPTION ITEMS (medicines)
-- =====================================================
CREATE TABLE IF NOT EXISTS prescription_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration_days INT,
  instructions TEXT,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  INDEX idx_prescription (prescription_id)
);

-- =====================================================
-- EXERCISE PRESCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS exercise_prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  exercise_name VARCHAR(200) NOT NULL,
  duration_minutes INT,
  frequency VARCHAR(100),
  instructions TEXT,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- =====================================================
-- MEDICATION TRACKING (patient logs)
-- =====================================================
CREATE TABLE IF NOT EXISTS medication_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  prescription_item_id INT NOT NULL,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('taken', 'missed', 'skipped') DEFAULT 'taken',
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prescription_item_id) REFERENCES prescription_items(id) ON DELETE CASCADE,
  INDEX idx_patient_date (patient_id, taken_at)
);

-- =====================================================
-- MEDICINES MASTER LIST
-- =====================================================
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200),
  manufacturer VARCHAR(200),
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- =====================================================
-- MEDICAL SHOP INVENTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  medicine_name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200),
  manufacturer VARCHAR(200),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  category VARCHAR(100),
  description TEXT,
  expiry_date DATE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shop (shop_id),
  INDEX idx_medicine (medicine_name),
  INDEX idx_availability (is_available)
);

-- =====================================================
-- HEALTHY HABITS / EXERCISES LIBRARY
-- =====================================================
CREATE TABLE IF NOT EXISTS healthy_habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category ENUM('exercise', 'diet', 'sleep', 'mental', 'lifestyle') NOT NULL,
  description TEXT,
  benefits TEXT,
  how_to TEXT,
  duration VARCHAR(100),
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- =====================================================
-- PATIENT HABIT TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  habit_id INT,
  custom_habit_name VARCHAR(200),
  log_date DATE DEFAULT (CURRENT_DATE),
  completed BOOLEAN DEFAULT TRUE,
  duration_minutes INT,
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (habit_id) REFERENCES healthy_habits(id) ON DELETE SET NULL,
  INDEX idx_patient_date (patient_id, log_date)
);

-- =====================================================
-- REVIEWS / RATINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  INDEX idx_doctor (doctor_id)
);
