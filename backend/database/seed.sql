-- =====================================================
-- MediTrace Seed Data
-- Comprehensive medical knowledge base
-- =====================================================

USE meditrace;

-- =====================================================
-- SYMPTOMS DATA (100+ symptoms)
-- =====================================================
INSERT IGNORE INTO symptoms (name, category, description) VALUES
-- General
('Fever', 'General', 'Elevated body temperature above 100.4°F (38°C)'),
('Fatigue', 'General', 'Persistent tiredness or lack of energy'),
('Weight Loss', 'General', 'Unexplained loss of body weight'),
('Weight Gain', 'General', 'Unexplained increase in body weight'),
('Chills', 'General', 'Feeling of coldness with shivering'),
('Night Sweats', 'General', 'Excessive sweating during sleep'),
('Loss of Appetite', 'General', 'Reduced desire to eat'),
('Weakness', 'General', 'General lack of physical strength'),
('Dehydration', 'General', 'Excessive loss of body water'),

-- Respiratory
('Cough', 'Respiratory', 'Sudden expulsion of air from lungs'),
('Dry Cough', 'Respiratory', 'Cough without phlegm or mucus'),
('Productive Cough', 'Respiratory', 'Cough with mucus or phlegm'),
('Shortness of Breath', 'Respiratory', 'Difficulty breathing or breathlessness'),
('Wheezing', 'Respiratory', 'High-pitched whistling sound while breathing'),
('Chest Congestion', 'Respiratory', 'Buildup of mucus in chest'),
('Runny Nose', 'Respiratory', 'Nasal discharge'),
('Stuffy Nose', 'Respiratory', 'Nasal congestion'),
('Sneezing', 'Respiratory', 'Sudden expulsion of air from nose'),
('Sore Throat', 'Respiratory', 'Pain or irritation in throat'),
('Hoarseness', 'Respiratory', 'Abnormal voice changes'),

-- Cardiovascular
('Chest Pain', 'Cardiovascular', 'Discomfort or pain in chest area'),
('Heart Palpitations', 'Cardiovascular', 'Rapid or irregular heartbeat'),
('High Blood Pressure', 'Cardiovascular', 'BP above 140/90 mmHg'),
('Low Blood Pressure', 'Cardiovascular', 'BP below 90/60 mmHg'),
('Irregular Heartbeat', 'Cardiovascular', 'Abnormal heart rhythm'),
('Swollen Ankles', 'Cardiovascular', 'Swelling in lower extremities'),
('Cold Extremities', 'Cardiovascular', 'Cold hands and feet'),

-- Gastrointestinal
('Nausea', 'Gastrointestinal', 'Feeling of sickness with urge to vomit'),
('Vomiting', 'Gastrointestinal', 'Forceful expulsion of stomach contents'),
('Diarrhea', 'Gastrointestinal', 'Loose, watery stools'),
('Constipation', 'Gastrointestinal', 'Difficulty passing stools'),
('Abdominal Pain', 'Gastrointestinal', 'Pain in stomach area'),
('Bloating', 'Gastrointestinal', 'Feeling of fullness or swelling'),
('Heartburn', 'Gastrointestinal', 'Burning sensation in chest from acid reflux'),
('Indigestion', 'Gastrointestinal', 'Discomfort in upper abdomen'),
('Blood in Stool', 'Gastrointestinal', 'Blood present in bowel movements'),
('Stomach Cramps', 'Gastrointestinal', 'Painful muscle contractions in abdomen'),

-- Neurological
('Headache', 'Neurological', 'Pain in head or upper neck'),
('Migraine', 'Neurological', 'Severe throbbing headache'),
('Dizziness', 'Neurological', 'Feeling of being lightheaded'),
('Vertigo', 'Neurological', 'Sensation of spinning'),
('Confusion', 'Neurological', 'Difficulty thinking clearly'),
('Memory Loss', 'Neurological', 'Inability to recall information'),
('Seizures', 'Neurological', 'Sudden electrical disturbances in brain'),
('Numbness', 'Neurological', 'Loss of sensation'),
('Tingling', 'Neurological', 'Pins and needles sensation'),
('Tremors', 'Neurological', 'Involuntary shaking'),

-- Musculoskeletal
('Joint Pain', 'Musculoskeletal', 'Pain in joints'),
('Muscle Pain', 'Musculoskeletal', 'Pain in muscles'),
('Back Pain', 'Musculoskeletal', 'Pain in back region'),
('Neck Pain', 'Musculoskeletal', 'Pain in neck area'),
('Stiffness', 'Musculoskeletal', 'Reduced flexibility in joints'),
('Swelling', 'Musculoskeletal', 'Abnormal enlargement of body part'),

-- Skin
('Skin Rash', 'Skin', 'Area of irritated or swollen skin'),
('Itching', 'Skin', 'Uncomfortable urge to scratch'),
('Hives', 'Skin', 'Raised, itchy welts on skin'),
('Dry Skin', 'Skin', 'Skin lacking moisture'),
('Yellow Skin', 'Skin', 'Jaundice - yellowish discoloration'),
('Bruising', 'Skin', 'Discoloration from broken blood vessels'),
('Excessive Sweating', 'Skin', 'Hyperhidrosis'),

-- Eyes/Ears/Throat
('Blurred Vision', 'Eyes', 'Loss of sharpness of vision'),
('Eye Pain', 'Eyes', 'Discomfort in or around eyes'),
('Red Eyes', 'Eyes', 'Bloodshot appearance of eyes'),
('Watery Eyes', 'Eyes', 'Excessive tear production'),
('Ear Pain', 'Ears', 'Pain in ear'),
('Hearing Loss', 'Ears', 'Reduced ability to hear'),
('Ringing in Ears', 'Ears', 'Tinnitus'),

-- Urinary
('Frequent Urination', 'Urinary', 'Need to urinate more often than usual'),
('Painful Urination', 'Urinary', 'Burning sensation while urinating'),
('Blood in Urine', 'Urinary', 'Hematuria'),
('Difficulty Urinating', 'Urinary', 'Trouble passing urine'),
('Dark Urine', 'Urinary', 'Urine darker than normal'),

-- Endocrine
('Excessive Thirst', 'Endocrine', 'Polydipsia'),
('Excessive Hunger', 'Endocrine', 'Polyphagia'),
('Heat Intolerance', 'Endocrine', 'Inability to tolerate heat'),
('Cold Intolerance', 'Endocrine', 'Inability to tolerate cold'),
('Hair Loss', 'Endocrine', 'Loss of hair from scalp or body'),

-- Mental Health
('Anxiety', 'Mental Health', 'Persistent worry or fear'),
('Depression', 'Mental Health', 'Persistent sadness'),
('Insomnia', 'Mental Health', 'Difficulty sleeping'),
('Mood Swings', 'Mental Health', 'Rapid changes in emotional state'),
('Irritability', 'Mental Health', 'Easily annoyed or angered'),

-- Others
('Body Aches', 'General', 'Generalized pain throughout body'),
('Swollen Lymph Nodes', 'General', 'Enlarged lymph glands'),
('Difficulty Swallowing', 'General', 'Dysphagia'),
('Bad Breath', 'General', 'Halitosis'),
('Bleeding Gums', 'General', 'Bleeding from gums'),
('Joint Swelling', 'Musculoskeletal', 'Inflammation in joints'),
('Pale Skin', 'Skin', 'Loss of normal skin color'),
('Restlessness', 'Mental Health', 'Inability to rest or relax'),
('Difficulty Concentrating', 'Neurological', 'Trouble focusing'),
('Frequent Infections', 'General', 'Recurring infections'),
('Slow Wound Healing', 'General', 'Cuts take longer to heal'),
('Tunnel Vision', 'Eyes', 'Loss of peripheral vision'),
('Sensitivity to Light', 'Eyes', 'Photophobia'),
('Acid Reflux', 'Gastrointestinal', 'Stomach acid flowing back up'),
('Excessive Gas', 'Gastrointestinal', 'Flatulence'),
('Snoring', 'Respiratory', 'Loud breathing during sleep'),
('Sleep Apnea', 'Respiratory', 'Pauses in breathing during sleep');

-- =====================================================
-- DISEASES DATA (60+ diseases)
-- =====================================================
INSERT IGNORE INTO diseases (name, description, severity, recommended_specialization, precautions, treatment_overview) VALUES
('Common Cold', 'Viral infection of upper respiratory tract', 'mild', 'General Physician', 'Rest, hydration, avoid cold exposure', 'Symptomatic treatment with rest, fluids, and OTC medications'),
('Influenza (Flu)', 'Viral respiratory illness caused by influenza viruses', 'moderate', 'General Physician', 'Vaccination, hand hygiene, avoid contact with infected persons', 'Antiviral medications, rest, hydration'),
('COVID-19', 'Respiratory illness caused by SARS-CoV-2 virus', 'moderate', 'General Physician', 'Vaccination, masks, social distancing', 'Isolation, symptomatic treatment, antivirals for severe cases'),
('Pneumonia', 'Infection that inflames air sacs in lungs', 'severe', 'Pulmonologist', 'Vaccination, good hygiene, avoid smoking', 'Antibiotics, antivirals, hospitalization in severe cases'),
('Bronchitis', 'Inflammation of bronchial tubes', 'moderate', 'Pulmonologist', 'Avoid smoking and air pollution', 'Bronchodilators, cough suppressants, antibiotics if bacterial'),
('Asthma', 'Chronic inflammation of airways causing breathing difficulty', 'moderate', 'Pulmonologist', 'Avoid triggers, use prescribed inhalers regularly', 'Inhalers (bronchodilators and corticosteroids), lifestyle changes'),
('Tuberculosis', 'Bacterial infection primarily affecting lungs', 'severe', 'Pulmonologist', 'BCG vaccination, avoid contact with infected persons', 'Long-term antibiotic therapy (6-9 months)'),

('Hypertension', 'High blood pressure condition', 'moderate', 'Cardiologist', 'Low salt diet, regular exercise, stress management', 'Antihypertensive medications, lifestyle modifications'),
('Heart Attack', 'Blockage of blood flow to heart muscle', 'critical', 'Cardiologist', 'Healthy diet, exercise, no smoking, manage cholesterol', 'Emergency intervention, medications, possible surgery'),
('Coronary Artery Disease', 'Narrowing of heart arteries', 'severe', 'Cardiologist', 'Healthy lifestyle, cholesterol management', 'Medications, angioplasty, bypass surgery'),
('Arrhythmia', 'Irregular heartbeat', 'moderate', 'Cardiologist', 'Avoid caffeine, manage stress', 'Medications, pacemaker, cardioversion'),
('Heart Failure', 'Heart cannot pump blood efficiently', 'critical', 'Cardiologist', 'Manage underlying conditions, healthy diet', 'Medications, lifestyle changes, possibly surgery'),

('Type 1 Diabetes', 'Autoimmune destruction of insulin-producing cells', 'severe', 'Endocrinologist', 'Regular monitoring, balanced diet', 'Insulin therapy, blood sugar monitoring, diet management'),
('Type 2 Diabetes', 'Body resistance to insulin', 'moderate', 'Endocrinologist', 'Healthy weight, exercise, balanced diet', 'Oral medications, possible insulin, lifestyle changes'),
('Hypothyroidism', 'Underactive thyroid gland', 'moderate', 'Endocrinologist', 'Regular thyroid monitoring', 'Thyroid hormone replacement therapy'),
('Hyperthyroidism', 'Overactive thyroid gland', 'moderate', 'Endocrinologist', 'Regular monitoring, avoid iodine excess', 'Anti-thyroid medications, radioactive iodine, surgery'),

('Migraine', 'Severe recurring headaches', 'moderate', 'Neurologist', 'Identify and avoid triggers, regular sleep', 'Pain relievers, preventive medications, lifestyle changes'),
('Tension Headache', 'Most common type of headache from stress', 'mild', 'General Physician', 'Stress management, good posture', 'OTC pain relievers, relaxation techniques'),
('Stroke', 'Interruption of blood supply to brain', 'critical', 'Neurologist', 'Manage BP, cholesterol, no smoking', 'Emergency treatment, rehabilitation, medications'),
('Epilepsy', 'Neurological disorder causing seizures', 'severe', 'Neurologist', 'Take medications regularly, avoid triggers', 'Anti-epileptic drugs, surgery in some cases'),
('Alzheimer Disease', 'Progressive brain disorder affecting memory', 'severe', 'Neurologist', 'Mental and physical activity, healthy diet', 'Medications to slow progression, supportive care'),

('Gastritis', 'Inflammation of stomach lining', 'mild', 'Gastroenterologist', 'Avoid spicy foods, alcohol, NSAIDs', 'Antacids, PPIs, dietary changes'),
('Peptic Ulcer', 'Sores in stomach or small intestine lining', 'moderate', 'Gastroenterologist', 'Avoid NSAIDs, alcohol, smoking', 'Antibiotics (if H. pylori), PPIs, lifestyle changes'),
('GERD', 'Gastroesophageal reflux disease', 'mild', 'Gastroenterologist', 'Avoid trigger foods, dont lie down after eating', 'PPIs, H2 blockers, lifestyle modifications'),
('Irritable Bowel Syndrome', 'Common disorder affecting large intestine', 'mild', 'Gastroenterologist', 'Identify food triggers, manage stress', 'Dietary changes, medications for symptoms'),
('Food Poisoning', 'Illness from contaminated food', 'mild', 'General Physician', 'Food safety, proper cooking and storage', 'Hydration, rest, sometimes antibiotics'),
('Appendicitis', 'Inflammation of appendix', 'critical', 'General Surgeon', 'Cannot be prevented', 'Surgical removal of appendix'),
('Hepatitis B', 'Viral infection of liver', 'severe', 'Gastroenterologist', 'Vaccination, safe practices', 'Antiviral medications, monitoring'),

('Anemia', 'Low red blood cell count', 'moderate', 'General Physician', 'Iron-rich diet, vitamin B12', 'Iron supplements, dietary changes, treating underlying cause'),
('Leukemia', 'Cancer of blood-forming tissues', 'critical', 'Oncologist', 'No definitive prevention', 'Chemotherapy, radiation, stem cell transplant'),

('Urinary Tract Infection', 'Infection in urinary system', 'mild', 'General Physician', 'Stay hydrated, proper hygiene', 'Antibiotics, increased fluid intake'),
('Kidney Stones', 'Hard deposits in kidneys', 'moderate', 'Urologist', 'Hydration, dietary modifications', 'Pain management, lithotripsy, surgery if needed'),
('Chronic Kidney Disease', 'Gradual loss of kidney function', 'severe', 'Nephrologist', 'Control BP and diabetes', 'Medications, dialysis, transplant in advanced stages'),

('Arthritis', 'Inflammation of joints', 'moderate', 'Rheumatologist', 'Exercise, healthy weight', 'Anti-inflammatory drugs, physical therapy'),
('Rheumatoid Arthritis', 'Autoimmune disease affecting joints', 'severe', 'Rheumatologist', 'No definitive prevention', 'DMARDs, biologics, physical therapy'),
('Osteoporosis', 'Weakening of bones', 'moderate', 'Orthopedist', 'Calcium, vitamin D, exercise', 'Medications to strengthen bones, supplements'),
('Gout', 'Form of arthritis caused by uric acid crystals', 'moderate', 'Rheumatologist', 'Avoid purine-rich foods, alcohol', 'Anti-inflammatory drugs, uric acid lowering medications'),

('Eczema', 'Inflammatory skin condition', 'mild', 'Dermatologist', 'Moisturize, avoid triggers', 'Topical corticosteroids, moisturizers'),
('Psoriasis', 'Autoimmune skin condition', 'moderate', 'Dermatologist', 'Manage stress, avoid triggers', 'Topical treatments, light therapy, systemic medications'),
('Acne', 'Skin condition with pimples', 'mild', 'Dermatologist', 'Gentle skin care, avoid touching face', 'Topical treatments, oral medications'),
('Fungal Infection', 'Skin infection by fungi', 'mild', 'Dermatologist', 'Keep skin dry, good hygiene', 'Antifungal medications'),

('Depression', 'Persistent mood disorder', 'moderate', 'Psychiatrist', 'Social support, regular exercise', 'Therapy, antidepressants, lifestyle changes'),
('Anxiety Disorder', 'Excessive worry and fear', 'moderate', 'Psychiatrist', 'Stress management, support system', 'Therapy, medications, relaxation techniques'),
('Bipolar Disorder', 'Mood disorder with extreme highs and lows', 'severe', 'Psychiatrist', 'Medication compliance, therapy', 'Mood stabilizers, therapy, lifestyle management'),
('Insomnia', 'Difficulty sleeping', 'mild', 'General Physician', 'Sleep hygiene, avoid caffeine', 'Sleep hygiene, CBT, sometimes medications'),

('Sinusitis', 'Inflammation of sinuses', 'mild', 'ENT Specialist', 'Avoid allergens, treat colds promptly', 'Decongestants, nasal sprays, antibiotics if bacterial'),
('Tonsillitis', 'Inflammation of tonsils', 'mild', 'ENT Specialist', 'Good hygiene, avoid infected persons', 'Rest, fluids, antibiotics if bacterial'),
('Allergic Rhinitis', 'Hay fever due to allergens', 'mild', 'ENT Specialist', 'Avoid allergens', 'Antihistamines, nasal corticosteroids'),
('Conjunctivitis', 'Eye inflammation (pink eye)', 'mild', 'Ophthalmologist', 'Avoid touching eyes, good hygiene', 'Antibiotic drops if bacterial, supportive care'),
('Glaucoma', 'Eye condition damaging optic nerve', 'severe', 'Ophthalmologist', 'Regular eye exams', 'Eye drops, laser treatment, surgery'),
('Cataract', 'Clouding of eye lens', 'moderate', 'Ophthalmologist', 'UV protection, no smoking', 'Surgical removal and lens replacement'),

('Dengue Fever', 'Mosquito-borne viral infection', 'severe', 'General Physician', 'Mosquito control, protective clothing', 'Hydration, paracetamol, hospitalization if severe'),
('Malaria', 'Mosquito-borne parasitic disease', 'severe', 'General Physician', 'Mosquito prevention, prophylaxis in endemic areas', 'Antimalarial medications'),
('Typhoid', 'Bacterial infection from contaminated food/water', 'severe', 'General Physician', 'Vaccination, safe food and water', 'Antibiotics, hydration'),
('Chickenpox', 'Viral infection causing rash', 'mild', 'General Physician', 'Vaccination', 'Symptomatic treatment, antivirals in some cases'),

('Obesity', 'Excessive body fat accumulation', 'moderate', 'General Physician', 'Balanced diet, regular exercise', 'Lifestyle modifications, sometimes medications or surgery'),
('Vitamin D Deficiency', 'Low levels of vitamin D', 'mild', 'General Physician', 'Sunlight exposure, fortified foods', 'Vitamin D supplements'),
('Iron Deficiency', 'Low iron levels in body', 'mild', 'General Physician', 'Iron-rich foods, vitamin C', 'Iron supplements, dietary changes'),

('Dehydration', 'Loss of body fluids', 'moderate', 'General Physician', 'Adequate fluid intake', 'Oral rehydration, IV fluids in severe cases'),
('Heat Stroke', 'Body overheating due to environment', 'critical', 'General Physician', 'Stay hydrated, avoid heat exposure', 'Cooling measures, emergency care'),

('Otitis Media', 'Middle ear infection', 'mild', 'ENT Specialist', 'Good hygiene, avoid smoking', 'Antibiotics if bacterial, pain relievers'),
('Vertigo', 'Sensation of spinning', 'mild', 'ENT Specialist', 'Avoid sudden movements', 'Vestibular exercises, medications');

-- =====================================================
-- DISEASE-SYMPTOM MAPPINGS
-- Each disease linked to its symptoms with weights
-- =====================================================

-- Helper: Using subqueries to get IDs

-- Common Cold
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Common Cold' as dn, 'Runny Nose' as sn, 2.0 as weight UNION
 SELECT 'Common Cold', 'Sneezing', 2.0 UNION
 SELECT 'Common Cold', 'Sore Throat', 1.5 UNION
 SELECT 'Common Cold', 'Cough', 1.5 UNION
 SELECT 'Common Cold', 'Stuffy Nose', 2.0 UNION
 SELECT 'Common Cold', 'Headache', 1.0 UNION
 SELECT 'Common Cold', 'Fatigue', 1.0 UNION
 SELECT 'Common Cold', 'Fever', 0.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Influenza (Flu)
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Influenza (Flu)' as dn, 'Fever' as sn, 2.5 as weight UNION
 SELECT 'Influenza (Flu)', 'Body Aches', 2.0 UNION
 SELECT 'Influenza (Flu)', 'Fatigue', 2.0 UNION
 SELECT 'Influenza (Flu)', 'Chills', 2.0 UNION
 SELECT 'Influenza (Flu)', 'Headache', 1.5 UNION
 SELECT 'Influenza (Flu)', 'Cough', 1.5 UNION
 SELECT 'Influenza (Flu)', 'Sore Throat', 1.0 UNION
 SELECT 'Influenza (Flu)', 'Weakness', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- COVID-19
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'COVID-19' as dn, 'Fever' as sn, 2.0 as weight UNION
 SELECT 'COVID-19', 'Dry Cough', 2.5 UNION
 SELECT 'COVID-19', 'Shortness of Breath', 2.5 UNION
 SELECT 'COVID-19', 'Fatigue', 2.0 UNION
 SELECT 'COVID-19', 'Body Aches', 1.5 UNION
 SELECT 'COVID-19', 'Sore Throat', 1.0 UNION
 SELECT 'COVID-19', 'Loss of Appetite', 1.0 UNION
 SELECT 'COVID-19', 'Headache', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Pneumonia
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Pneumonia' as dn, 'Productive Cough' as sn, 2.5 as weight UNION
 SELECT 'Pneumonia', 'Chest Pain' , 2.0 UNION
 SELECT 'Pneumonia', 'Shortness of Breath', 2.5 UNION
 SELECT 'Pneumonia', 'Fever', 2.0 UNION
 SELECT 'Pneumonia', 'Chills', 1.5 UNION
 SELECT 'Pneumonia', 'Fatigue', 1.5 UNION
 SELECT 'Pneumonia', 'Chest Congestion', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Asthma
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Asthma' as dn, 'Wheezing' as sn, 3.0 as weight UNION
 SELECT 'Asthma', 'Shortness of Breath', 2.5 UNION
 SELECT 'Asthma', 'Chest Congestion', 2.0 UNION
 SELECT 'Asthma', 'Cough', 1.5 UNION
 SELECT 'Asthma', 'Chest Pain', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Bronchitis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Bronchitis' as dn, 'Productive Cough' as sn, 2.5 as weight UNION
 SELECT 'Bronchitis', 'Chest Congestion', 2.0 UNION
 SELECT 'Bronchitis', 'Fatigue', 1.5 UNION
 SELECT 'Bronchitis', 'Shortness of Breath', 1.5 UNION
 SELECT 'Bronchitis', 'Wheezing', 1.5 UNION
 SELECT 'Bronchitis', 'Fever', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Tuberculosis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Tuberculosis' as dn, 'Productive Cough' as sn, 2.5 as weight UNION
 SELECT 'Tuberculosis', 'Weight Loss', 2.5 UNION
 SELECT 'Tuberculosis', 'Night Sweats', 2.5 UNION
 SELECT 'Tuberculosis', 'Fever', 2.0 UNION
 SELECT 'Tuberculosis', 'Fatigue', 1.5 UNION
 SELECT 'Tuberculosis', 'Loss of Appetite', 1.5 UNION
 SELECT 'Tuberculosis', 'Chest Pain', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Hypertension
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Hypertension' as dn, 'High Blood Pressure' as sn, 3.0 as weight UNION
 SELECT 'Hypertension', 'Headache', 1.5 UNION
 SELECT 'Hypertension', 'Dizziness', 1.5 UNION
 SELECT 'Hypertension', 'Blurred Vision', 1.0 UNION
 SELECT 'Hypertension', 'Heart Palpitations', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Heart Attack
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Heart Attack' as dn, 'Chest Pain' as sn, 3.0 as weight UNION
 SELECT 'Heart Attack', 'Shortness of Breath', 2.5 UNION
 SELECT 'Heart Attack', 'Heart Palpitations', 2.0 UNION
 SELECT 'Heart Attack', 'Excessive Sweating', 2.0 UNION
 SELECT 'Heart Attack', 'Nausea', 1.5 UNION
 SELECT 'Heart Attack', 'Dizziness', 1.5 UNION
 SELECT 'Heart Attack', 'Weakness', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Arrhythmia
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Arrhythmia' as dn, 'Irregular Heartbeat' as sn, 3.0 as weight UNION
 SELECT 'Arrhythmia', 'Heart Palpitations', 2.5 UNION
 SELECT 'Arrhythmia', 'Dizziness', 1.5 UNION
 SELECT 'Arrhythmia', 'Shortness of Breath', 1.5 UNION
 SELECT 'Arrhythmia', 'Chest Pain', 1.5 UNION
 SELECT 'Arrhythmia', 'Fatigue', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Heart Failure
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Heart Failure' as dn, 'Shortness of Breath' as sn, 2.5 as weight UNION
 SELECT 'Heart Failure', 'Fatigue', 2.0 UNION
 SELECT 'Heart Failure', 'Swollen Ankles', 2.5 UNION
 SELECT 'Heart Failure', 'Heart Palpitations', 1.5 UNION
 SELECT 'Heart Failure', 'Weakness', 1.5 UNION
 SELECT 'Heart Failure', 'Cough', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Type 1 Diabetes
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Type 1 Diabetes' as dn, 'Excessive Thirst' as sn, 2.5 as weight UNION
 SELECT 'Type 1 Diabetes', 'Frequent Urination', 2.5 UNION
 SELECT 'Type 1 Diabetes', 'Excessive Hunger', 2.0 UNION
 SELECT 'Type 1 Diabetes', 'Weight Loss', 2.5 UNION
 SELECT 'Type 1 Diabetes', 'Fatigue', 2.0 UNION
 SELECT 'Type 1 Diabetes', 'Blurred Vision', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Type 2 Diabetes
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Type 2 Diabetes' as dn, 'Excessive Thirst' as sn, 2.5 as weight UNION
 SELECT 'Type 2 Diabetes', 'Frequent Urination', 2.5 UNION
 SELECT 'Type 2 Diabetes', 'Fatigue', 2.0 UNION
 SELECT 'Type 2 Diabetes', 'Blurred Vision', 1.5 UNION
 SELECT 'Type 2 Diabetes', 'Slow Wound Healing', 2.0 UNION
 SELECT 'Type 2 Diabetes', 'Frequent Infections', 1.5 UNION
 SELECT 'Type 2 Diabetes', 'Numbness', 1.5 UNION
 SELECT 'Type 2 Diabetes', 'Weight Gain', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Hypothyroidism
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Hypothyroidism' as dn, 'Fatigue' as sn, 2.5 as weight UNION
 SELECT 'Hypothyroidism', 'Weight Gain', 2.5 UNION
 SELECT 'Hypothyroidism', 'Cold Intolerance', 2.5 UNION
 SELECT 'Hypothyroidism', 'Hair Loss', 2.0 UNION
 SELECT 'Hypothyroidism', 'Constipation', 1.5 UNION
 SELECT 'Hypothyroidism', 'Depression', 1.5 UNION
 SELECT 'Hypothyroidism', 'Dry Skin', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Hyperthyroidism
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Hyperthyroidism' as dn, 'Weight Loss' as sn, 2.5 as weight UNION
 SELECT 'Hyperthyroidism', 'Heat Intolerance', 2.5 UNION
 SELECT 'Hyperthyroidism', 'Heart Palpitations', 2.0 UNION
 SELECT 'Hyperthyroidism', 'Excessive Sweating', 2.0 UNION
 SELECT 'Hyperthyroidism', 'Anxiety', 1.5 UNION
 SELECT 'Hyperthyroidism', 'Tremors', 2.0 UNION
 SELECT 'Hyperthyroidism', 'Insomnia', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Migraine
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Migraine' as dn, 'Migraine' as sn, 3.0 as weight UNION
 SELECT 'Migraine', 'Headache', 2.5 UNION
 SELECT 'Migraine', 'Nausea', 2.0 UNION
 SELECT 'Migraine', 'Vomiting', 1.5 UNION
 SELECT 'Migraine', 'Sensitivity to Light', 2.5 UNION
 SELECT 'Migraine', 'Blurred Vision', 1.5 UNION
 SELECT 'Migraine', 'Dizziness', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Stroke
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Stroke' as dn, 'Numbness' as sn, 2.5 as weight UNION
 SELECT 'Stroke', 'Confusion', 2.5 UNION
 SELECT 'Stroke', 'Headache', 2.0 UNION
 SELECT 'Stroke', 'Dizziness', 2.0 UNION
 SELECT 'Stroke', 'Blurred Vision', 2.0 UNION
 SELECT 'Stroke', 'Weakness', 2.5 UNION
 SELECT 'Stroke', 'Difficulty Swallowing', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Gastritis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Gastritis' as dn, 'Abdominal Pain' as sn, 2.5 as weight UNION
 SELECT 'Gastritis', 'Nausea', 2.0 UNION
 SELECT 'Gastritis', 'Vomiting', 1.5 UNION
 SELECT 'Gastritis', 'Indigestion', 2.0 UNION
 SELECT 'Gastritis', 'Loss of Appetite', 1.5 UNION
 SELECT 'Gastritis', 'Bloating', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Peptic Ulcer
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Peptic Ulcer' as dn, 'Abdominal Pain' as sn, 2.5 as weight UNION
 SELECT 'Peptic Ulcer', 'Heartburn', 2.0 UNION
 SELECT 'Peptic Ulcer', 'Nausea', 1.5 UNION
 SELECT 'Peptic Ulcer', 'Bloating', 1.5 UNION
 SELECT 'Peptic Ulcer', 'Indigestion', 2.0 UNION
 SELECT 'Peptic Ulcer', 'Blood in Stool', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- GERD
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'GERD' as dn, 'Heartburn' as sn, 3.0 as weight UNION
 SELECT 'GERD', 'Acid Reflux', 3.0 UNION
 SELECT 'GERD', 'Chest Pain', 1.5 UNION
 SELECT 'GERD', 'Difficulty Swallowing', 1.5 UNION
 SELECT 'GERD', 'Sore Throat', 1.0 UNION
 SELECT 'GERD', 'Cough', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- IBS
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Irritable Bowel Syndrome' as dn, 'Abdominal Pain' as sn, 2.5 as weight UNION
 SELECT 'Irritable Bowel Syndrome', 'Bloating', 2.5 UNION
 SELECT 'Irritable Bowel Syndrome', 'Diarrhea', 2.0 UNION
 SELECT 'Irritable Bowel Syndrome', 'Constipation', 2.0 UNION
 SELECT 'Irritable Bowel Syndrome', 'Excessive Gas', 2.0 UNION
 SELECT 'Irritable Bowel Syndrome', 'Stomach Cramps', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Food Poisoning
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Food Poisoning' as dn, 'Nausea' as sn, 2.5 as weight UNION
 SELECT 'Food Poisoning', 'Vomiting', 2.5 UNION
 SELECT 'Food Poisoning', 'Diarrhea', 2.5 UNION
 SELECT 'Food Poisoning', 'Abdominal Pain', 2.0 UNION
 SELECT 'Food Poisoning', 'Fever', 1.5 UNION
 SELECT 'Food Poisoning', 'Weakness', 1.5 UNION
 SELECT 'Food Poisoning', 'Dehydration', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Appendicitis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Appendicitis' as dn, 'Abdominal Pain' as sn, 3.0 as weight UNION
 SELECT 'Appendicitis', 'Nausea', 2.0 UNION
 SELECT 'Appendicitis', 'Vomiting', 2.0 UNION
 SELECT 'Appendicitis', 'Loss of Appetite', 2.0 UNION
 SELECT 'Appendicitis', 'Fever', 1.5 UNION
 SELECT 'Appendicitis', 'Stomach Cramps', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Anemia
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Anemia' as dn, 'Fatigue' as sn, 2.5 as weight UNION
 SELECT 'Anemia', 'Pale Skin', 2.5 UNION
 SELECT 'Anemia', 'Weakness', 2.0 UNION
 SELECT 'Anemia', 'Shortness of Breath', 1.5 UNION
 SELECT 'Anemia', 'Dizziness', 1.5 UNION
 SELECT 'Anemia', 'Cold Extremities', 1.5 UNION
 SELECT 'Anemia', 'Headache', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- UTI
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Urinary Tract Infection' as dn, 'Painful Urination' as sn, 3.0 as weight UNION
 SELECT 'Urinary Tract Infection', 'Frequent Urination', 2.5 UNION
 SELECT 'Urinary Tract Infection', 'Blood in Urine', 2.0 UNION
 SELECT 'Urinary Tract Infection', 'Dark Urine', 2.0 UNION
 SELECT 'Urinary Tract Infection', 'Abdominal Pain', 1.5 UNION
 SELECT 'Urinary Tract Infection', 'Fever', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Kidney Stones
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Kidney Stones' as dn, 'Back Pain' as sn, 2.5 as weight UNION
 SELECT 'Kidney Stones', 'Abdominal Pain' , 2.5 UNION
 SELECT 'Kidney Stones', 'Blood in Urine', 2.5 UNION
 SELECT 'Kidney Stones', 'Painful Urination', 2.0 UNION
 SELECT 'Kidney Stones', 'Nausea', 1.5 UNION
 SELECT 'Kidney Stones', 'Vomiting', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Arthritis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Arthritis' as dn, 'Joint Pain' as sn, 3.0 as weight UNION
 SELECT 'Arthritis', 'Joint Swelling', 2.5 UNION
 SELECT 'Arthritis', 'Stiffness', 2.5 UNION
 SELECT 'Arthritis', 'Swelling', 1.5 UNION
 SELECT 'Arthritis', 'Fatigue', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Eczema
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Eczema' as dn, 'Itching' as sn, 3.0 as weight UNION
 SELECT 'Eczema', 'Skin Rash', 2.5 UNION
 SELECT 'Eczema', 'Dry Skin', 2.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Depression
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Depression' as dn, 'Depression' as sn, 3.0 as weight UNION
 SELECT 'Depression', 'Fatigue', 2.0 UNION
 SELECT 'Depression', 'Insomnia', 2.0 UNION
 SELECT 'Depression', 'Loss of Appetite', 2.0 UNION
 SELECT 'Depression', 'Difficulty Concentrating', 2.0 UNION
 SELECT 'Depression', 'Mood Swings', 1.5 UNION
 SELECT 'Depression', 'Irritability', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Anxiety Disorder
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Anxiety Disorder' as dn, 'Anxiety' as sn, 3.0 as weight UNION
 SELECT 'Anxiety Disorder', 'Heart Palpitations', 2.0 UNION
 SELECT 'Anxiety Disorder', 'Excessive Sweating', 1.5 UNION
 SELECT 'Anxiety Disorder', 'Insomnia', 2.0 UNION
 SELECT 'Anxiety Disorder', 'Restlessness', 2.5 UNION
 SELECT 'Anxiety Disorder', 'Difficulty Concentrating', 2.0 UNION
 SELECT 'Anxiety Disorder', 'Irritability', 1.5 UNION
 SELECT 'Anxiety Disorder', 'Tremors', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Sinusitis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Sinusitis' as dn, 'Stuffy Nose' as sn, 2.5 as weight UNION
 SELECT 'Sinusitis', 'Headache', 2.0 UNION
 SELECT 'Sinusitis', 'Runny Nose', 2.0 UNION
 SELECT 'Sinusitis', 'Sore Throat', 1.5 UNION
 SELECT 'Sinusitis', 'Cough', 1.5 UNION
 SELECT 'Sinusitis', 'Bad Breath', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Tonsillitis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Tonsillitis' as dn, 'Sore Throat' as sn, 3.0 as weight UNION
 SELECT 'Tonsillitis', 'Difficulty Swallowing', 2.5 UNION
 SELECT 'Tonsillitis', 'Fever', 2.0 UNION
 SELECT 'Tonsillitis', 'Swollen Lymph Nodes', 2.0 UNION
 SELECT 'Tonsillitis', 'Bad Breath', 1.5 UNION
 SELECT 'Tonsillitis', 'Headache', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Allergic Rhinitis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Allergic Rhinitis' as dn, 'Sneezing' as sn, 2.5 as weight UNION
 SELECT 'Allergic Rhinitis', 'Runny Nose', 2.5 UNION
 SELECT 'Allergic Rhinitis', 'Itching', 2.0 UNION
 SELECT 'Allergic Rhinitis', 'Watery Eyes', 2.0 UNION
 SELECT 'Allergic Rhinitis', 'Stuffy Nose', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Conjunctivitis
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Conjunctivitis' as dn, 'Red Eyes' as sn, 3.0 as weight UNION
 SELECT 'Conjunctivitis', 'Eye Pain', 2.0 UNION
 SELECT 'Conjunctivitis', 'Watery Eyes', 2.5 UNION
 SELECT 'Conjunctivitis', 'Itching', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Dengue Fever
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Dengue Fever' as dn, 'Fever' as sn, 3.0 as weight UNION
 SELECT 'Dengue Fever', 'Headache', 2.5 UNION
 SELECT 'Dengue Fever', 'Body Aches', 2.5 UNION
 SELECT 'Dengue Fever', 'Joint Pain', 2.5 UNION
 SELECT 'Dengue Fever', 'Skin Rash', 2.0 UNION
 SELECT 'Dengue Fever', 'Nausea', 1.5 UNION
 SELECT 'Dengue Fever', 'Vomiting', 1.5 UNION
 SELECT 'Dengue Fever', 'Fatigue', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Malaria
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Malaria' as dn, 'Fever' as sn, 3.0 as weight UNION
 SELECT 'Malaria', 'Chills', 3.0 UNION
 SELECT 'Malaria', 'Headache', 2.0 UNION
 SELECT 'Malaria', 'Excessive Sweating', 2.5 UNION
 SELECT 'Malaria', 'Body Aches', 2.0 UNION
 SELECT 'Malaria', 'Nausea', 1.5 UNION
 SELECT 'Malaria', 'Fatigue', 2.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Typhoid
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Typhoid' as dn, 'Fever' as sn, 3.0 as weight UNION
 SELECT 'Typhoid', 'Headache', 2.0 UNION
 SELECT 'Typhoid', 'Abdominal Pain', 2.5 UNION
 SELECT 'Typhoid', 'Weakness', 2.0 UNION
 SELECT 'Typhoid', 'Loss of Appetite', 2.0 UNION
 SELECT 'Typhoid', 'Constipation', 1.5 UNION
 SELECT 'Typhoid', 'Diarrhea', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Insomnia
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Insomnia' as dn, 'Insomnia' as sn, 3.0 as weight UNION
 SELECT 'Insomnia', 'Fatigue', 2.0 UNION
 SELECT 'Insomnia', 'Difficulty Concentrating', 2.0 UNION
 SELECT 'Insomnia', 'Irritability', 1.5 UNION
 SELECT 'Insomnia', 'Headache', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Tension Headache
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Tension Headache' as dn, 'Headache' as sn, 3.0 as weight UNION
 SELECT 'Tension Headache', 'Neck Pain', 2.0 UNION
 SELECT 'Tension Headache', 'Stiffness', 1.5 UNION
 SELECT 'Tension Headache', 'Fatigue', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Otitis Media
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Otitis Media' as dn, 'Ear Pain' as sn, 3.0 as weight UNION
 SELECT 'Otitis Media', 'Hearing Loss', 2.0 UNION
 SELECT 'Otitis Media', 'Fever', 1.5 UNION
 SELECT 'Otitis Media', 'Headache', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Vertigo
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Vertigo' as dn, 'Vertigo' as sn, 3.0 as weight UNION
 SELECT 'Vertigo', 'Dizziness', 2.5 UNION
 SELECT 'Vertigo', 'Nausea', 2.0 UNION
 SELECT 'Vertigo', 'Ringing in Ears', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Dehydration
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Dehydration' as dn, 'Dehydration' as sn, 3.0 as weight UNION
 SELECT 'Dehydration', 'Excessive Thirst', 2.5 UNION
 SELECT 'Dehydration', 'Dark Urine', 2.0 UNION
 SELECT 'Dehydration', 'Dizziness', 1.5 UNION
 SELECT 'Dehydration', 'Headache', 1.5 UNION
 SELECT 'Dehydration', 'Fatigue', 1.5) w
WHERE d.name = w.dn AND s.name = w.sn;

-- Vitamin D Deficiency
INSERT IGNORE INTO disease_symptoms (disease_id, symptom_id, weight) 
SELECT d.id, s.id, w.weight FROM diseases d, symptoms s, 
(SELECT 'Vitamin D Deficiency' as dn, 'Fatigue' as sn, 2.0 as weight UNION
 SELECT 'Vitamin D Deficiency', 'Muscle Pain', 2.0 UNION
 SELECT 'Vitamin D Deficiency', 'Bone Pain', 2.0 UNION
 SELECT 'Vitamin D Deficiency', 'Joint Pain', 1.5 UNION
 SELECT 'Vitamin D Deficiency', 'Depression', 1.5 UNION
 SELECT 'Vitamin D Deficiency', 'Hair Loss', 1.0) w
WHERE d.name = w.dn AND s.name = w.sn;

-- =====================================================
-- HEALTHY HABITS DATA
-- =====================================================
INSERT IGNORE INTO healthy_habits (title, category, description, benefits, how_to, duration, difficulty, video_url) VALUES
('Morning Yoga Routine', 'exercise', 'Start your day with energizing yoga poses to improve flexibility and mental clarity.', 'Improves flexibility, reduces stress, enhances mood, builds core strength, improves posture', 'Find a quiet space, use a yoga mat. Start with sun salutations, then move to warrior poses, downward dog, and end with relaxation pose. Breathe deeply throughout.', '20-30 minutes', 'beginner', 'https://www.youtube.com/embed/v7AYKMP6rOE'),
('Brisk Walking', 'exercise', 'Simple yet effective cardiovascular exercise for all fitness levels.', 'Improves heart health, aids weight management, strengthens bones, boosts mood, reduces diabetes risk', 'Wear comfortable shoes. Start with 10-minute warm-up walk. Maintain a pace where you can talk but feel slightly breathless. Cool down for 5 minutes.', '30-45 minutes daily', 'beginner', 'https://www.youtube.com/embed/njeZ29umqVE'),
('Strength Training', 'exercise', 'Build muscle mass and bone density with resistance exercises.', 'Increases muscle mass, improves metabolism, strengthens bones, enhances functional fitness, boosts confidence', 'Start with bodyweight exercises like push-ups, squats, lunges. Gradually add weights. Train each major muscle group 2-3 times per week with rest days in between.', '45-60 minutes, 3-4 times/week', 'intermediate', 'https://www.youtube.com/embed/U0bhE67HuDY'),
('HIIT Workout', 'exercise', 'High-intensity interval training for maximum calorie burn in minimum time.', 'Burns calories efficiently, improves cardiovascular health, builds endurance, boosts metabolism for hours', 'Alternate between 30 seconds of intense exercise and 30 seconds of rest. Include exercises like burpees, mountain climbers, jumping jacks. Total 15-20 minutes.', '15-20 minutes, 3 times/week', 'advanced', 'https://www.youtube.com/embed/ml6cT4AZdqI'),
('Meditation Practice', 'mental', 'Mindfulness meditation for mental wellness and stress reduction.', 'Reduces stress and anxiety, improves focus, enhances emotional regulation, better sleep, lowers BP', 'Sit comfortably with straight back. Close eyes, focus on breath. When mind wanders, gently bring attention back. Start with 5 minutes, gradually increase.', '10-20 minutes daily', 'beginner', 'https://www.youtube.com/embed/inpok4MKVLM'),
('Balanced Mediterranean Diet', 'diet', 'Eat a diet rich in fruits, vegetables, whole grains, lean proteins, and healthy fats.', 'Reduces heart disease risk, supports brain health, helps weight management, fights inflammation, increases longevity', 'Include vegetables in every meal, choose whole grains over refined, eat fish twice weekly, use olive oil, limit red meat, enjoy nuts and seeds, eat fruits as desserts.', 'Throughout the day', 'beginner', NULL),
('Adequate Sleep', 'sleep', 'Get 7-9 hours of quality sleep every night for optimal health.', 'Improves memory and learning, supports immune function, helps weight management, reduces disease risk, improves mood', 'Maintain consistent sleep schedule, create dark and cool environment (65-68°F), avoid screens 1 hour before bed, limit caffeine after 2 PM, establish bedtime routine.', '7-9 hours nightly', 'beginner', NULL),
('Hydration Habit', 'lifestyle', 'Drink adequate water throughout the day for optimal body function.', 'Improves energy and brain function, aids digestion, supports kidney health, helps skin appearance, regulates body temperature', 'Drink water first thing in morning, keep water bottle with you, set reminders, drink before meals, increase intake during exercise. Aim for 8-10 glasses daily.', 'Throughout the day', 'beginner', NULL),
('Deep Breathing Exercises', 'mental', 'Practice deep breathing techniques to reduce stress and improve oxygen flow.', 'Reduces stress and anxiety, lowers BP, improves focus, helps with sleep, reduces pain perception', 'Sit comfortably. Breathe in slowly through nose for 4 counts, hold for 4 counts, exhale through mouth for 6 counts. Repeat 10 times. Practice 2-3 times daily.', '5-10 minutes', 'beginner', 'https://www.youtube.com/embed/tybOi4hjZFQ'),
('Stretching Routine', 'exercise', 'Daily stretching to improve flexibility and reduce muscle tension.', 'Improves flexibility, reduces injury risk, decreases muscle tension, improves posture, enhances circulation', 'Start with neck rolls, shoulder stretches, then chest opener, back stretches, hip flexors, quad and hamstring stretches. Hold each stretch 20-30 seconds.', '15-20 minutes', 'beginner', 'https://www.youtube.com/embed/sTxC3J3gQEU'),
('Cycling', 'exercise', 'Low-impact cardiovascular exercise excellent for joints.', 'Strengthens lower body, improves cardiovascular fitness, low impact on joints, helps weight loss, reduces stress', 'Start with 20-30 minute rides, gradually increase. Maintain proper posture. Use appropriate gears. Stay hydrated. Cycle 3-5 times per week.', '30-60 minutes', 'beginner', NULL),
('Swimming', 'exercise', 'Full-body workout that is easy on joints.', 'Full body workout, low impact, improves cardiovascular health, builds endurance, helps weight loss, reduces stress', 'Learn proper technique first. Start with shorter sessions. Alternate between different strokes. Use proper breathing technique. Aim for 30 minutes 3 times weekly.', '30-45 minutes', 'intermediate', NULL),
('Healthy Breakfast Habit', 'diet', 'Start your day with a nutritious balanced breakfast.', 'Provides energy, improves concentration, supports weight management, stabilizes blood sugar, prevents overeating later', 'Include protein (eggs, yogurt), whole grains (oats, whole wheat), fruits, and healthy fats (nuts, seeds). Avoid sugary cereals and processed foods. Eat within 1 hour of waking.', '15-20 minutes', 'beginner', NULL),
('Gratitude Journaling', 'mental', 'Daily practice of writing down things you are grateful for.', 'Improves mental health, increases happiness, reduces stress, improves sleep, strengthens relationships', 'Get a dedicated journal. Each day write 3-5 things you are grateful for. Be specific. Include why you are grateful. Practice in morning or before bed.', '5-10 minutes daily', 'beginner', NULL),
('Limit Screen Time', 'lifestyle', 'Reduce excessive screen time for better physical and mental health.', 'Improves sleep quality, reduces eye strain, decreases anxiety, more time for activities, better social connections', 'Set daily limits, use screen time tracking apps, take 20-20-20 breaks (every 20 min, look 20 feet away for 20 sec), no screens 1 hour before bed.', 'All day awareness', 'intermediate', NULL);

-- =====================================================
-- SAMPLE MEDICINES
-- =====================================================
INSERT IGNORE INTO medicines (name, generic_name, manufacturer, category, description) VALUES
('Paracetamol 500mg', 'Acetaminophen', 'Various', 'Pain Reliever', 'Used for fever and mild to moderate pain'),
('Crocin', 'Paracetamol', 'GSK', 'Pain Reliever', 'Fever and pain relief'),
('Dolo 650', 'Paracetamol', 'Micro Labs', 'Pain Reliever', 'Fever and pain management'),
('Azithromycin 500mg', 'Azithromycin', 'Various', 'Antibiotic', 'Antibiotic for bacterial infections'),
('Amoxicillin 500mg', 'Amoxicillin', 'Various', 'Antibiotic', 'Broad spectrum antibiotic'),
('Cetirizine 10mg', 'Cetirizine', 'Various', 'Antihistamine', 'For allergies and hay fever'),
('Pantoprazole 40mg', 'Pantoprazole', 'Various', 'PPI', 'For acid reflux and ulcers'),
('Omeprazole 20mg', 'Omeprazole', 'Various', 'PPI', 'Reduces stomach acid'),
('Metformin 500mg', 'Metformin', 'Various', 'Antidiabetic', 'For type 2 diabetes management'),
('Amlodipine 5mg', 'Amlodipine', 'Various', 'Antihypertensive', 'For high blood pressure'),
('Atorvastatin 10mg', 'Atorvastatin', 'Various', 'Statin', 'Cholesterol lowering medication'),
('Aspirin 75mg', 'Aspirin', 'Various', 'Antiplatelet', 'Blood thinner, heart protection'),
('Vitamin D3 60K', 'Cholecalciferol', 'Various', 'Vitamin', 'Vitamin D supplement'),
('Vitamin B12', 'Cyanocobalamin', 'Various', 'Vitamin', 'B12 supplement'),
('Iron Tablets', 'Ferrous Sulfate', 'Various', 'Supplement', 'For iron deficiency anemia'),
('Ibuprofen 400mg', 'Ibuprofen', 'Various', 'NSAID', 'Pain and inflammation reliever'),
('Diclofenac 50mg', 'Diclofenac', 'Various', 'NSAID', 'For pain and inflammation'),
('Cough Syrup', 'Dextromethorphan', 'Various', 'Cough Suppressant', 'For dry cough relief'),
('ORS Powder', 'Oral Rehydration Salts', 'Various', 'Electrolyte', 'For dehydration and diarrhea'),
('Salbutamol Inhaler', 'Salbutamol', 'Various', 'Bronchodilator', 'For asthma relief');

-- =====================================================
-- DEMO USERS (Patient, Doctor, Medical Shop)
-- Password for all: "password123"
-- bcrypt hash: $2a$10$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6.
-- =====================================================

-- Demo Patient
INSERT IGNORE INTO users (unique_id, email, password, full_name, phone, user_type) VALUES
('PAT-DEMO0001', 'patient@demo.com', '$2a$10$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6.', 'Demo Patient', '9876543210', 'patient'),
('DOC-DEMO0001', 'doctor@demo.com', '$2a$10$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6.', 'Dr. Rajesh Kumar', '9876543211', 'doctor'),
('DOC-DEMO0002', 'cardio@demo.com', '$2a$10$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6.', 'Dr. Priya Sharma', '9876543212', 'doctor'),
('DOC-DEMO0003', 'neuro@demo.com', '$2a$10$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6.', 'Dr. Amit Patel', '9876543213', 'doctor'),
('MED-DEMO0001', 'medical@demo.com', '$2a$10$dPjvfbQYY1Yz3ZQXKjLGNuQX4n0Eb5TjE1vKqXJ5cKlYJP5Y2vF6.', 'Apollo Pharmacy', '9876543214', 'medical');

-- Patient profile
INSERT IGNORE INTO patient_profiles (user_id, date_of_birth, gender, blood_group, height_cm, weight_kg, city, state)
SELECT id, '1990-05-15', 'male', 'O+', 175, 70, 'Pune', 'Maharashtra' FROM users WHERE email = 'patient@demo.com';

-- Doctor profiles
INSERT IGNORE INTO doctor_profiles (user_id, qualification, specialization, experience_years, license_number, clinic_name, clinic_address, city, state, consultation_fee, bio)
SELECT id, 'MBBS, MD', 'General Physician', 10, 'MH12345', 'City Health Clinic', '123 MG Road', 'Pune', 'Maharashtra', 500, 'Experienced general physician with focus on preventive care.' FROM users WHERE email = 'doctor@demo.com';

INSERT IGNORE INTO doctor_profiles (user_id, qualification, specialization, experience_years, license_number, clinic_name, clinic_address, city, state, consultation_fee, bio)
SELECT id, 'MBBS, MD, DM Cardiology', 'Cardiologist', 15, 'MH12346', 'Heart Care Center', '456 FC Road', 'Pune', 'Maharashtra', 1000, 'Specialized in interventional cardiology and heart failure management.' FROM users WHERE email = 'cardio@demo.com';

INSERT IGNORE INTO doctor_profiles (user_id, qualification, specialization, experience_years, license_number, clinic_name, clinic_address, city, state, consultation_fee, bio)
SELECT id, 'MBBS, MD, DM Neurology', 'Neurologist', 12, 'MH12347', 'NeuroLife Clinic', '789 JM Road', 'Pune', 'Maharashtra', 1200, 'Expert in stroke care and headache management.' FROM users WHERE email = 'neuro@demo.com';

-- Medical shop
INSERT IGNORE INTO medical_profiles (user_id, shop_name, license_number, address, city, state, pincode, latitude, longitude, delivery_available)
SELECT id, 'Apollo Pharmacy', 'PHARM12345', '321 Karve Road, Kothrud', 'Pune', 'Maharashtra', '411038', 18.5074, 73.8077, TRUE FROM users WHERE email = 'medical@demo.com';

-- Sample shop inventory
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Paracetamol 500mg', 'Acetaminophen', 'Cipla', 15.00, 500, 'Pain Reliever', 'Fever and pain relief', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Dolo 650', 'Paracetamol', 'Micro Labs', 30.00, 300, 'Pain Reliever', 'Fever and pain', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Azithromycin 500mg', 'Azithromycin', 'Sun Pharma', 120.00, 200, 'Antibiotic', 'Bacterial infections', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Cetirizine 10mg', 'Cetirizine', 'Dr Reddys', 25.00, 400, 'Antihistamine', 'For allergies', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Pantoprazole 40mg', 'Pantoprazole', 'Sun Pharma', 85.00, 250, 'PPI', 'For acid reflux', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Metformin 500mg', 'Metformin', 'USV', 45.00, 350, 'Antidiabetic', 'For diabetes', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Amlodipine 5mg', 'Amlodipine', 'Cipla', 35.00, 300, 'Antihypertensive', 'For BP', TRUE FROM users WHERE email = 'medical@demo.com';
INSERT IGNORE INTO shop_inventory (shop_id, medicine_name, generic_name, manufacturer, price, stock_quantity, category, description, is_available)
SELECT id, 'Vitamin D3 60K', 'Cholecalciferol', 'Mankind', 75.00, 200, 'Vitamin', 'Vitamin D supplement', TRUE FROM users WHERE email = 'medical@demo.com';

SELECT 'Seed data inserted successfully!' as Message;
