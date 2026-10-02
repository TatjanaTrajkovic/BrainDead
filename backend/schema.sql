CREATE DATABASE BrainDead;

use BrainDead;

CREATE TABLE users(
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PLAYER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_session(
    session_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_health INT NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE question(
    question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    scenario VARCHAR(500) NOT NULL,
    text VARCHAR(255) NOT NULL,
    position INT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE answer(
    answer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    text VARCHAR(100) NOT NULL,
    health_multiplier DECIMAL(3, 2) NOT NULL,
    feedback VARCHAR(255) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

CREATE TABLE session_question(
    session_question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_id INT,
    FOREIGN KEY (session_id) REFERENCES game_session(session_id),
    FOREIGN KEY (question_id) REFERENCES question(question_id),
    FOREIGN KEY (answer_id) REFERENCES answer(answer_id),
    UNIQUE (session_id, question_id)
);