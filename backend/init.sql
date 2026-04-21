-- Initialize the database for report tracking system
USE testdb;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table for tracking location-based reports
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_text VARCHAR(255),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('safety', 'event','note') NOT NULL,
    safety_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    verified_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_category (category),
    INDEX idx_safety_level (safety_level),
    INDEX idx_status (status)
);

-- Insert sample users
INSERT INTO users (username, email) VALUES
('testuser', 'test@example.com'),
('admin', 'admin@example.com')
ON DUPLICATE KEY UPDATE username=username;

