CREATE DATABASE IF NOT EXISTS autohub;
USE autohub;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  mileage INT,
  manufacture_year INT,
  last_service_date DATE,
  terrain_type VARCHAR(50),
  current_performance VARCHAR(255),
  likely_locations TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 