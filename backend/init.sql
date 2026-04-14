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
    description TEXT NOT NULL,
    category ENUM('safety', 'maintenance', 'environmental', 'infrastructure', 'emergency', 'other') NOT NULL,
    safety_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
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

-- Insert sample reports
INSERT INTO reports (user_id, latitude, longitude, description, category, safety_level) VALUES
(1, 37.7749, -122.4194, 'Pothole on main street causing traffic issues', 'infrastructure', 'medium'),
(1, 37.7849, -122.4094, 'Broken streetlight in park area', 'safety', 'high'),
(2, 37.7649, -122.4294, 'Fallen tree blocking sidewalk after storm', 'environmental', 'high')
ON DUPLICATE KEY UPDATE description=description;