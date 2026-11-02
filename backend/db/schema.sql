CREATE DATABASE IF NOT EXISTS BrainDead;

USE BrainDead;

CREATE TABLE users(
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NULL UNIQUE,
    email VARCHAR(255) NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE' NOT NULL,
    role ENUM('PLAYER', 'ADMIN') DEFAULT 'PLAYER' NOT NULL,
    is_guest BOOLEAN NOT NULL DEFAULT FALSE,
    auth_token VARCHAR(64) NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_session(
    session_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_health INT NOT NULL DEFAULT 100,
    status ENUM('ACTIVE', 'COMPLETED', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE question(
    question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    scenario VARCHAR(500) NOT NULL,
    text VARCHAR(255) NOT NULL,
    position INT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answer(
    answer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    text VARCHAR(150) NOT NULL,
    health_change INT NOT NULL,
    feedback VARCHAR(500) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

CREATE TABLE session_question(
    session_question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_id INT,
    FOREIGN KEY (session_id) REFERENCES game_session(session_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(question_id),
    FOREIGN KEY (answer_id) REFERENCES answer(answer_id),
    UNIQUE (session_id, question_id)
);