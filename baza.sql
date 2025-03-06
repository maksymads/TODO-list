CREATE DATABASE todo_list;

USE todo_list;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    priority ENUM('Niski', 'Średni', 'Wysoki') DEFAULT 'Średni',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    planned_end_date DATETIME,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
