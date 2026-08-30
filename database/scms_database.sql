-- ============================================
-- SMART COMMUNITY MANAGEMENT SYSTEM DATABASE
-- Run this in phpMyAdmin or MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS scms_db;
USE scms_db;

-- USERS TABLE (Admin, Resident, Guard)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role ENUM('Admin','Resident','Guard') NOT NULL,
    phone VARCHAR(20),
    apartment VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VISITORS TABLE
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_name VARCHAR(100) NOT NULL,
    cnic VARCHAR(20),
    house_number VARCHAR(20),
    purpose ENUM('Guest','Delivery','Maintenance','Emergency') DEFAULT 'Guest',
    vehicle_number VARCHAR(20),
    visit_time TIME,
    notes TEXT,
    status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT,
    apartment VARCHAR(20),
    category ENUM('Maintenance','Electrical','Security','Water','Other') DEFAULT 'Other',
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    description TEXT NOT NULL,
    status ENUM('Open','Pending','Resolved') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE SET NULL
);

-- BILLS TABLE
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT,
    apartment VARCHAR(20),
    service VARCHAR(100),
    month VARCHAR(20),
    amount DECIMAL(10,2),
    status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE SET NULL
);

-- PARKING TABLE
CREATE TABLE IF NOT EXISTS parking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_number VARCHAR(20) NOT NULL UNIQUE,
    resident_id INT,
    vehicle_number VARCHAR(20),
    status ENUM('Available','Occupied','Reserved') DEFAULT 'Available',
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Default users (password = 'admin123', 'resident123', 'guard123')
INSERT INTO users (name, email, password, role, phone, apartment) VALUES
('Admin User',    'admin@scms.com',    'admin123',    'Admin',    '0300-0000001', NULL),
('Ali Raza',      'ali@scms.com',      'resident123', 'Resident', '0300-1234567', 'A-203'),
('Sara Noor',     'sara@scms.com',     'resident123', 'Resident', '0300-7654321', 'B-114'),
('Guard Hassan',  'guard@scms.com',    'guard123',    'Guard',    '0300-9999999', NULL);

-- Sample visitors
INSERT INTO visitors (visitor_name, cnic, house_number, purpose, vehicle_number, visit_time, status, added_by) VALUES
('Ahmed Khan',  '35202-1234567-1', 'A-203', 'Guest',    'ABC-2341', '10:30:00', 'Approved', 1),
('Sarah Noor',  '35202-7654321-2', 'B-114', 'Delivery', 'LEA-8821', '12:15:00', 'Pending',  1);

-- Sample complaints
INSERT INTO complaints (resident_id, apartment, category, priority, description, status) VALUES
(2, 'A-203', 'Maintenance', 'High',   'Water leakage in Block A parking area.',    'Open'),
(3, 'B-114', 'Electrical',  'Medium', 'Street light not working near Block B.',    'Pending'),
(2, 'A-203', 'Security',    'Low',    'Security camera angle needs adjustment.',   'Resolved');

-- Sample bills
INSERT INTO bills (resident_id, apartment, service, month, amount, status) VALUES
(2, 'A-203', 'Maintenance Fee',  'May 2026',  5000.00, 'Paid'),
(2, 'A-203', 'Parking Charges',  'May 2026',  1500.00, 'Paid'),
(2, 'A-203', 'Security Charges', 'May 2026',  1000.00, 'Paid'),
(2, 'A-203', 'Maintenance Fee',  'June 2026', 5000.00, 'Pending'),
(3, 'B-114', 'Maintenance Fee',  'June 2026', 5000.00, 'Pending');

-- Sample parking
INSERT INTO parking (slot_number, resident_id, vehicle_number, status) VALUES
('P-01', 2, 'ABC-2341', 'Occupied'),
('P-02', 3, 'LEA-8821', 'Occupied'),
('P-03', NULL, NULL, 'Available'),
('P-04', NULL, NULL, 'Available'),
('P-05', NULL, NULL, 'Available'),
('P-06', NULL, NULL, 'Reserved');
