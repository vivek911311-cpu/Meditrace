-- =====================================================
-- MediTrace Phase 1 Migration
-- Run this ONCE on Aiven to add new features
-- =====================================================

-- 1. Medicine requests table (patient requests a medicine from pharmacy)
CREATE TABLE IF NOT EXISTS medicine_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  shop_id INT NOT NULL,
  medicine_name VARCHAR(200) NOT NULL,
  inventory_id INT,
  quantity INT DEFAULT 1,
  notes TEXT,
  status ENUM('pending', 'accepted', 'ready', 'completed', 'rejected') DEFAULT 'pending',
  pharmacy_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES shop_inventory(id) ON DELETE SET NULL,
  INDEX idx_patient (patient_id),
  INDEX idx_shop (shop_id),
  INDEX idx_status (status)
);

-- 2. Theme & language preferences for users
-- Run these one at a time; if a column already exists, ignore the error.
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'light';
ALTER TABLE users ADD COLUMN lang_preference VARCHAR(5) DEFAULT 'en';

-- =====================================================
-- MORE DISEASE DATA — Phase 1
-- Adding tropical, pediatric, seasonal, gastrointestinal diseases
-- =====================================================

INSERT IGNORE INTO diseases (name, description, severity, recommended_specialization, precautions, treatment_overview) VALUES
('Chickenpox', 'Highly contagious viral infection causing itchy rash and red spots; common in children', 'mild', 'General Physician', 'Isolate, avoid scratching, calamine lotion, paracetamol for fever', 'Antiviral medications, supportive care, vaccination prevents'),
('Measles', 'Highly contagious viral infection with rash and fever', 'moderate', 'Pediatrician', 'Vaccination, isolation, rest, hydration', 'Supportive care, vitamin A; MMR vaccine prevents'),
('Mumps', 'Viral infection causing swollen salivary glands', 'mild', 'General Physician', 'Isolation, soft foods, cold compress on swelling', 'Supportive care, pain relief; MMR vaccine prevents'),
('Rubella', 'Mild viral infection with rash; dangerous in pregnancy', 'mild', 'General Physician', 'Vaccination, especially before pregnancy', 'Supportive care; MMR vaccine prevents'),
('Chikungunya', 'Mosquito-borne viral disease causing severe joint pain and fever', 'moderate', 'General Physician', 'Mosquito prevention, repellents, eliminate stagnant water', 'Symptomatic treatment, hydration, NSAIDs for joint pain'),
('Leptospirosis', 'Bacterial infection from contaminated water/soil, common in monsoon', 'severe', 'Infectious Disease', 'Avoid wading in flood water, wear protective gear', 'Antibiotics (doxycycline, penicillin), supportive care'),
('Hepatitis A', 'Viral liver infection spread through contaminated food/water', 'moderate', 'Gastroenterologist', 'Safe water, vaccination, hand hygiene', 'Supportive care, hydration, avoid alcohol, vaccine prevents'),
('Hepatitis B', 'Viral liver infection spread through blood/body fluids', 'severe', 'Gastroenterologist', 'Vaccination, safe sex, avoid sharing needles', 'Antiviral medications, regular liver monitoring'),
('Jaundice', 'Yellowing of skin and eyes due to liver dysfunction', 'moderate', 'Gastroenterologist', 'Treat underlying cause, avoid alcohol, hydration', 'Treatment of underlying cause, monitoring bilirubin'),
('Acid Reflux (GERD)', 'Stomach acid frequently flows back into the esophagus', 'mild', 'Gastroenterologist', 'Avoid late meals, spicy/fatty foods, elevate head while sleeping', 'PPIs, H2 blockers, lifestyle changes'),
('Hemorrhoids (Piles)', 'Swollen veins in the lower rectum and anus', 'mild', 'General Physician', 'High-fiber diet, hydration, avoid prolonged sitting', 'Topical creams, sitz baths, surgery if severe'),
('Fissure', 'Small tear in the lining of the anus, painful during stools', 'mild', 'General Physician', 'High-fiber diet, hydration, stool softeners', 'Topical creams, sitz baths, surgery if chronic'),
('Constipation', 'Difficulty passing stools, less than 3 bowel movements per week', 'mild', 'General Physician', 'Increase fiber, hydration, regular exercise', 'Dietary changes, laxatives if persistent'),
('Diarrhea', 'Loose, watery stools occurring more frequently than usual', 'mild', 'General Physician', 'Hydration with ORS, BRAT diet, hygiene', 'ORS, anti-diarrheals if needed, antibiotics if bacterial'),
('Lactose Intolerance', 'Inability to digest lactose; causes bloating and diarrhea', 'mild', 'Gastroenterologist', 'Avoid dairy or use lactose-free alternatives', 'Lactase supplements, dietary modification'),
('PCOS', 'Polycystic Ovary Syndrome — hormonal disorder in women of reproductive age', 'moderate', 'Endocrinologist', 'Healthy diet, exercise, weight management', 'Hormonal therapy, metformin, lifestyle changes'),
('Thyroid Cancer', 'Cancer in the thyroid gland', 'severe', 'Endocrinologist', 'Regular check-ups, avoid radiation exposure', 'Surgery, radioactive iodine, thyroid hormone therapy'),
('Lung Cancer', 'Cancer that begins in the lungs', 'critical', 'Pulmonologist', 'Avoid smoking, secondhand smoke, air pollution', 'Surgery, chemotherapy, radiation, immunotherapy'),
('Breast Cancer', 'Cancer that forms in cells of breast tissue', 'severe', 'Oncologist', 'Regular self-exams, mammograms, healthy lifestyle', 'Surgery, chemotherapy, radiation, hormone therapy'),
('Glaucoma', 'Group of eye conditions damaging the optic nerve', 'moderate', 'Ophthalmologist', 'Regular eye check-ups, especially after age 40', 'Eye drops, laser therapy, surgery to reduce eye pressure'),
('Cataract', 'Clouding of the lens of the eye affecting vision', 'mild', 'Ophthalmologist', 'UV protection, healthy diet, regular eye exams', 'Surgery to replace clouded lens with artificial one'),
('Sciatica', 'Pain radiating along the sciatic nerve from lower back to leg', 'moderate', 'Orthopedist', 'Good posture, regular exercise, ergonomic seating', 'Physical therapy, pain medications, sometimes surgery'),
('Slip Disc', 'Herniated or bulged disc in the spine', 'moderate', 'Orthopedist', 'Good posture, avoid heavy lifting, strengthen core', 'Rest, physical therapy, pain management, surgery if severe'),
('Osteoporosis', 'Weakening of bones making them fragile and prone to fracture', 'moderate', 'Orthopedist', 'Calcium, vitamin D, weight-bearing exercise', 'Bisphosphonates, calcium supplements, lifestyle changes'),
('Gout', 'Form of arthritis with sudden severe attacks of joint pain', 'moderate', 'Rheumatologist', 'Avoid purine-rich foods, alcohol, stay hydrated', 'NSAIDs, colchicine, allopurinol for prevention'),
('Vitiligo', 'Skin condition causing loss of pigment patches', 'mild', 'Dermatologist', 'Sun protection, gentle skincare', 'Topical corticosteroids, phototherapy, depigmentation'),
('Psoriasis', 'Chronic skin condition causing red scaly patches', 'mild', 'Dermatologist', 'Moisturize, avoid triggers, stress management', 'Topical treatments, phototherapy, biologics'),
('Acne', 'Skin condition causing pimples, blackheads, whiteheads', 'mild', 'Dermatologist', 'Gentle cleansing, avoid touching face, balanced diet', 'Topical/oral medications, retinoids, antibiotics'),
('Fungal Skin Infection', 'Infection of skin by fungi causing itching and rash', 'mild', 'Dermatologist', 'Keep skin dry, avoid sharing personal items', 'Antifungal creams or oral medications'),
('Bipolar Disorder', 'Mental health condition with mood swings between depression and mania', 'severe', 'Psychiatrist', 'Regular sleep, stress management, avoid alcohol/drugs', 'Mood stabilizers, antipsychotics, therapy'),
('ADHD', 'Attention deficit hyperactivity disorder', 'moderate', 'Psychiatrist', 'Structured routines, behavioral strategies, exercise', 'Stimulant medications, behavioral therapy'),
('OCD', 'Obsessive-compulsive disorder with intrusive thoughts and compulsions', 'moderate', 'Psychiatrist', 'Stress management, regular routine', 'CBT, SSRIs, exposure and response prevention'),
('PTSD', 'Post-traumatic stress disorder after a traumatic event', 'severe', 'Psychiatrist', 'Support system, avoid triggers, professional help', 'Trauma-focused therapy, EMDR, SSRIs');

-- More symptoms needed for the above
INSERT IGNORE INTO symptoms (name, category, description) VALUES
('Itchy Rash', 'Skin', 'Skin rash with itching sensation'),
('Red Spots on Skin', 'Skin', 'Red spots or patches on the skin'),
('Swollen Glands', 'General', 'Visibly swollen lymph nodes or salivary glands'),
('Joint Stiffness', 'Musculoskeletal', 'Stiffness in joints, especially morning'),
('Severe Joint Pain', 'Musculoskeletal', 'Intense pain in one or more joints'),
('Yellow Eyes', 'Eyes/Ears', 'Yellowing of the whites of the eyes'),
('Yellow Skin', 'Skin', 'Yellowing of the skin (jaundice)'),
('Dark Urine', 'Urinary', 'Urine appears dark yellow, brown, or tea-colored'),
('Pale Stools', 'GI', 'Light-colored or clay-like stools'),
('Heartburn', 'GI', 'Burning sensation in chest after eating'),
('Regurgitation', 'GI', 'Acidic taste in mouth from stomach contents'),
('Rectal Bleeding', 'GI', 'Bleeding from the rectum/anus'),
('Pain During Stool', 'GI', 'Pain or burning during bowel movements'),
('Hard Stools', 'GI', 'Difficulty passing hard, dry stools'),
('Bloating', 'GI', 'Feeling of fullness or swelling in abdomen'),
('Irregular Periods', 'Endocrine', 'Menstrual cycles that are irregular or absent'),
('Excessive Hair Growth', 'Endocrine', 'Excessive facial or body hair (hirsutism)'),
('Persistent Cough Blood', 'Respiratory', 'Coughing up blood for extended period'),
('Lump in Breast', 'General', 'Palpable lump in breast tissue'),
('Eye Pressure', 'Eyes/Ears', 'Feeling of pressure or pain in the eye'),
('Vision Halos', 'Eyes/Ears', 'Seeing halos or rainbow rings around lights'),
('Cloudy Vision', 'Eyes/Ears', 'Vision appears cloudy or hazy'),
('Radiating Leg Pain', 'Musculoskeletal', 'Pain radiating from lower back to leg'),
('Numbness in Legs', 'Neurological', 'Loss of sensation in the legs'),
('Fragile Bones', 'Musculoskeletal', 'Bones that fracture easily from minor injury'),
('Sudden Joint Swelling', 'Musculoskeletal', 'Rapid swelling of a single joint'),
('White Skin Patches', 'Skin', 'Patches of lighter skin'),
('Scaly Patches', 'Skin', 'Scaly, flaky patches on skin'),
('Pimples', 'Skin', 'Inflamed bumps on the face/skin'),
('Mood Swings', 'Mental Health', 'Rapid changes in mood'),
('Difficulty Concentrating', 'Mental Health', 'Trouble focusing or staying on task'),
('Repetitive Behaviors', 'Mental Health', 'Compulsive repetitive actions'),
('Intrusive Thoughts', 'Mental Health', 'Unwanted, persistent thoughts'),
('Flashbacks', 'Mental Health', 'Reliving past traumatic events'),
('Mania', 'Mental Health', 'Period of elevated mood and energy'),
('Hyperactivity', 'Mental Health', 'Excessive activity and restlessness');

-- Disease-symptom mappings for new diseases
-- Helper: get IDs by name
SET @s_fever := (SELECT id FROM symptoms WHERE name = 'Fever' LIMIT 1);
SET @s_fatigue := (SELECT id FROM symptoms WHERE name = 'Fatigue' LIMIT 1);
SET @s_headache := (SELECT id FROM symptoms WHERE name = 'Headache' LIMIT 1);
SET @s_itchyrash := (SELECT id FROM symptoms WHERE name = 'Itchy Rash' LIMIT 1);
SET @s_redspots := (SELECT id FROM symptoms WHERE name = 'Red Spots on Skin' LIMIT 1);
SET @s_swollenglands := (SELECT id FROM symptoms WHERE name = 'Swollen Glands' LIMIT 1);
SET @s_jointstiff := (SELECT id FROM symptoms WHERE name = 'Joint Stiffness' LIMIT 1);
SET @s_severejoint := (SELECT id FROM symptoms WHERE name = 'Severe Joint Pain' LIMIT 1);
SET @s_yelloweyes := (SELECT id FROM symptoms WHERE name = 'Yellow Eyes' LIMIT 1);
SET @s_yellowskin := (SELECT id FROM symptoms WHERE name = 'Yellow Skin' LIMIT 1);
SET @s_darkurine := (SELECT id FROM symptoms WHERE name = 'Dark Urine' LIMIT 1);
SET @s_palestool := (SELECT id FROM symptoms WHERE name = 'Pale Stools' LIMIT 1);
SET @s_heartburn := (SELECT id FROM symptoms WHERE name = 'Heartburn' LIMIT 1);
SET @s_regurg := (SELECT id FROM symptoms WHERE name = 'Regurgitation' LIMIT 1);
SET @s_rectalbld := (SELECT id FROM symptoms WHERE name = 'Rectal Bleeding' LIMIT 1);
SET @s_painstool := (SELECT id FROM symptoms WHERE name = 'Pain During Stool' LIMIT 1);
SET @s_hardstool := (SELECT id FROM symptoms WHERE name = 'Hard Stools' LIMIT 1);
SET @s_bloating := (SELECT id FROM symptoms WHERE name = 'Bloating' LIMIT 1);
SET @s_nausea := (SELECT id FROM symptoms WHERE name = 'Nausea' LIMIT 1);
SET @s_abdpain := (SELECT id FROM symptoms WHERE name = 'Abdominal Pain' LIMIT 1);
SET @s_diarrhea := (SELECT id FROM symptoms WHERE name = 'Diarrhea' LIMIT 1);
SET @s_irrperiod := (SELECT id FROM symptoms WHERE name = 'Irregular Periods' LIMIT 1);
SET @s_excesshair := (SELECT id FROM symptoms WHERE name = 'Excessive Hair Growth' LIMIT 1);
SET @s_lumpbreast := (SELECT id FROM symptoms WHERE name = 'Lump in Breast' LIMIT 1);
SET @s_eyepressure := (SELECT id FROM symptoms WHERE name = 'Eye Pressure' LIMIT 1);
SET @s_visionhalos := (SELECT id FROM symptoms WHERE name = 'Vision Halos' LIMIT 1);
SET @s_cloudyvision := (SELECT id FROM symptoms WHERE name = 'Cloudy Vision' LIMIT 1);
SET @s_radleg := (SELECT id FROM symptoms WHERE name = 'Radiating Leg Pain' LIMIT 1);
SET @s_numblegs := (SELECT id FROM symptoms WHERE name = 'Numbness in Legs' LIMIT 1);
SET @s_fragilebone := (SELECT id FROM symptoms WHERE name = 'Fragile Bones' LIMIT 1);
SET @s_sudjoint := (SELECT id FROM symptoms WHERE name = 'Sudden Joint Swelling' LIMIT 1);
SET @s_whitepatch := (SELECT id FROM symptoms WHERE name = 'White Skin Patches' LIMIT 1);
SET @s_scalypatch := (SELECT id FROM symptoms WHERE name = 'Scaly Patches' LIMIT 1);
SET @s_pimples := (SELECT id FROM symptoms WHERE name = 'Pimples' LIMIT 1);
SET @s_moodswings := (SELECT id FROM symptoms WHERE name = 'Mood Swings' LIMIT 1);
SET @s_diffconc := (SELECT id FROM symptoms WHERE name = 'Difficulty Concentrating' LIMIT 1);
SET @s_repbehav := (SELECT id FROM symptoms WHERE name = 'Repetitive Behaviors' LIMIT 1);
SET @s_intrusive := (SELECT id FROM symptoms WHERE name = 'Intrusive Thoughts' LIMIT 1);
SET @s_flashback := (SELECT id FROM symptoms WHERE name = 'Flashbacks' LIMIT 1);
SET @s_mania := (SELECT id FROM symptoms WHERE name = 'Mania' LIMIT 1);
SET @s_hyperact := (SELECT id FROM symptoms WHERE name = 'Hyperactivity' LIMIT 1);
SET @s_loseapp := (SELECT id FROM symptoms WHERE name = 'Loss of Appetite' LIMIT 1);
SET @s_vomit := (SELECT id FROM symptoms WHERE name = 'Vomiting' LIMIT 1);
SET @s_cough := (SELECT id FROM symptoms WHERE name = 'Cough' LIMIT 1);
SET @s_chestpain := (SELECT id FROM symptoms WHERE name = 'Chest Pain' LIMIT 1);
SET @s_sob := (SELECT id FROM symptoms WHERE name = 'Shortness of Breath' LIMIT 1);

-- Disease IDs
SET @d_chickenpox := (SELECT id FROM diseases WHERE name = 'Chickenpox' LIMIT 1);
SET @d_measles := (SELECT id FROM diseases WHERE name = 'Measles' LIMIT 1);
SET @d_mumps := (SELECT id FROM diseases WHERE name = 'Mumps' LIMIT 1);
SET @d_chiku := (SELECT id FROM diseases WHERE name = 'Chikungunya' LIMIT 1);
SET @d_lepto := (SELECT id FROM diseases WHERE name = 'Leptospirosis' LIMIT 1);
SET @d_hepa := (SELECT id FROM diseases WHERE name = 'Hepatitis A' LIMIT 1);
SET @d_hepb := (SELECT id FROM diseases WHERE name = 'Hepatitis B' LIMIT 1);
SET @d_jaundice := (SELECT id FROM diseases WHERE name = 'Jaundice' LIMIT 1);
SET @d_gerd := (SELECT id FROM diseases WHERE name = 'Acid Reflux (GERD)' LIMIT 1);
SET @d_piles := (SELECT id FROM diseases WHERE name = 'Hemorrhoids (Piles)' LIMIT 1);
SET @d_fissure := (SELECT id FROM diseases WHERE name = 'Fissure' LIMIT 1);
SET @d_const := (SELECT id FROM diseases WHERE name = 'Constipation' LIMIT 1);
SET @d_diarr := (SELECT id FROM diseases WHERE name = 'Diarrhea' LIMIT 1);
SET @d_lactose := (SELECT id FROM diseases WHERE name = 'Lactose Intolerance' LIMIT 1);
SET @d_pcos := (SELECT id FROM diseases WHERE name = 'PCOS' LIMIT 1);
SET @d_glaucoma := (SELECT id FROM diseases WHERE name = 'Glaucoma' LIMIT 1);
SET @d_cataract := (SELECT id FROM diseases WHERE name = 'Cataract' LIMIT 1);
SET @d_sciatica := (SELECT id FROM diseases WHERE name = 'Sciatica' LIMIT 1);
SET @d_slipdisc := (SELECT id FROM diseases WHERE name = 'Slip Disc' LIMIT 1);
SET @d_osteo := (SELECT id FROM diseases WHERE name = 'Osteoporosis' LIMIT 1);
SET @d_gout := (SELECT id FROM diseases WHERE name = 'Gout' LIMIT 1);
SET @d_vitiligo := (SELECT id FROM diseases WHERE name = 'Vitiligo' LIMIT 1);
SET @d_psoriasis := (SELECT id FROM diseases WHERE name = 'Psoriasis' LIMIT 1);
SET @d_acne := (SELECT id FROM diseases WHERE name = 'Acne' LIMIT 1);
SET @d_fungal := (SELECT id FROM diseases WHERE name = 'Fungal Skin Infection' LIMIT 1);
SET @d_bipolar := (SELECT id FROM diseases WHERE name = 'Bipolar Disorder' LIMIT 1);
SET @d_adhd := (SELECT id FROM diseases WHERE name = 'ADHD' LIMIT 1);
SET @d_ocd := (SELECT id FROM diseases WHERE name = 'OCD' LIMIT 1);
SET @d_ptsd := (SELECT id FROM diseases WHERE name = 'PTSD' LIMIT 1);

-- Now insert mappings (only where both IDs exist)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) VALUES
-- Chickenpox
(@d_chickenpox, @s_itchyrash, 10), (@d_chickenpox, @s_redspots, 9), (@d_chickenpox, @s_fever, 7), (@d_chickenpox, @s_fatigue, 5), (@d_chickenpox, @s_loseapp, 4),
-- Measles
(@d_measles, @s_fever, 9), (@d_measles, @s_redspots, 9), (@d_measles, @s_cough, 6), (@d_measles, @s_fatigue, 5),
-- Mumps
(@d_mumps, @s_swollenglands, 10), (@d_mumps, @s_fever, 7), (@d_mumps, @s_fatigue, 5), (@d_mumps, @s_headache, 4),
-- Chikungunya
(@d_chiku, @s_severejoint, 10), (@d_chiku, @s_fever, 8), (@d_chiku, @s_jointstiff, 7), (@d_chiku, @s_fatigue, 6), (@d_chiku, @s_headache, 5),
-- Leptospirosis
(@d_lepto, @s_fever, 8), (@d_lepto, @s_headache, 6), (@d_lepto, @s_yelloweyes, 7), (@d_lepto, @s_fatigue, 6),
-- Hepatitis A
(@d_hepa, @s_yelloweyes, 10), (@d_hepa, @s_yellowskin, 10), (@d_hepa, @s_darkurine, 8), (@d_hepa, @s_palestool, 7), (@d_hepa, @s_fatigue, 6), (@d_hepa, @s_nausea, 5),
-- Hepatitis B
(@d_hepb, @s_yelloweyes, 9), (@d_hepb, @s_yellowskin, 9), (@d_hepb, @s_darkurine, 7), (@d_hepb, @s_fatigue, 7), (@d_hepb, @s_abdpain, 6),
-- Jaundice
(@d_jaundice, @s_yelloweyes, 10), (@d_jaundice, @s_yellowskin, 10), (@d_jaundice, @s_darkurine, 8), (@d_jaundice, @s_fatigue, 5),
-- GERD
(@d_gerd, @s_heartburn, 10), (@d_gerd, @s_regurg, 9), (@d_gerd, @s_chestpain, 5), (@d_gerd, @s_cough, 3),
-- Hemorrhoids
(@d_piles, @s_rectalbld, 10), (@d_piles, @s_painstool, 8), (@d_piles, @s_hardstool, 5),
-- Fissure
(@d_fissure, @s_painstool, 10), (@d_fissure, @s_rectalbld, 7),
-- Constipation
(@d_const, @s_hardstool, 10), (@d_const, @s_abdpain, 6), (@d_const, @s_bloating, 7),
-- Diarrhea
(@d_diarr, @s_diarrhea, 10), (@d_diarr, @s_abdpain, 7), (@d_diarr, @s_nausea, 4),
-- Lactose Intolerance
(@d_lactose, @s_bloating, 9), (@d_lactose, @s_diarrhea, 8), (@d_lactose, @s_abdpain, 6),
-- PCOS
(@d_pcos, @s_irrperiod, 10), (@d_pcos, @s_excesshair, 8), (@d_pcos, @s_fatigue, 4),
-- Glaucoma
(@d_glaucoma, @s_eyepressure, 10), (@d_glaucoma, @s_visionhalos, 8), (@d_glaucoma, @s_headache, 5),
-- Cataract
(@d_cataract, @s_cloudyvision, 10), (@d_cataract, @s_visionhalos, 5),
-- Sciatica
(@d_sciatica, @s_radleg, 10), (@d_sciatica, @s_numblegs, 7),
-- Slip Disc
(@d_slipdisc, @s_radleg, 9), (@d_slipdisc, @s_numblegs, 8),
-- Osteoporosis
(@d_osteo, @s_fragilebone, 10), (@d_osteo, @s_fatigue, 3),
-- Gout
(@d_gout, @s_sudjoint, 10), (@d_gout, @s_severejoint, 9),
-- Vitiligo
(@d_vitiligo, @s_whitepatch, 10),
-- Psoriasis
(@d_psoriasis, @s_scalypatch, 10), (@d_psoriasis, @s_itchyrash, 6),
-- Acne
(@d_acne, @s_pimples, 10),
-- Fungal
(@d_fungal, @s_itchyrash, 9), (@d_fungal, @s_scalypatch, 7),
-- Bipolar
(@d_bipolar, @s_moodswings, 10), (@d_bipolar, @s_mania, 9),
-- ADHD
(@d_adhd, @s_diffconc, 10), (@d_adhd, @s_hyperact, 9),
-- OCD
(@d_ocd, @s_repbehav, 10), (@d_ocd, @s_intrusive, 9),
-- PTSD
(@d_ptsd, @s_flashback, 10), (@d_ptsd, @s_intrusive, 8);

-- Done!
SELECT 'Phase 1 migration complete! Added:' AS Status;
SELECT COUNT(*) AS total_diseases FROM diseases;
SELECT COUNT(*) AS total_symptoms FROM symptoms;
SELECT COUNT(*) AS total_mappings FROM disease_symptoms;
