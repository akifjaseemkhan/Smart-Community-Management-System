USE scms_db;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Info','Warning','Event','Urgent') DEFAULT 'Info',
    posted_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample announcements
INSERT INTO announcements (title, message, type, posted_by) VALUES
('Water Supply Interruption', 'Water supply will be interrupted on June 12 from 9AM to 2PM for pipeline maintenance. Please store water in advance.', 'Warning', 1),
('Community Eid Gathering', 'All residents are invited to the community Eid celebration on June 15 at 7PM in the main hall. Food and activities for all ages!', 'Event', 1),
('New Security Cameras Installed', 'We have installed 8 new HD security cameras at all entry and exit points. Your safety is our priority.', 'Info', 1),
('Parking Rules Reminder', 'Reminder: Visitors are not allowed to park in resident slots. Violating vehicles will be towed. Please inform your guests.', 'Urgent', 1);
