-- ============================================================
-- Church API – MySQL Database Schema
-- Run this once on your alwaysdata MySQL database
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    phone      VARCHAR(30)   NOT NULL,
    subject    VARCHAR(200)  DEFAULT '',
    message    TEXT          NOT NULL,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    date        VARCHAR(20)   NOT NULL,
    day         VARCHAR(20)   NOT NULL,
    title       VARCHAR(200)  NOT NULL,
    category    VARCHAR(100)  DEFAULT NULL,
    description TEXT          DEFAULT NULL,
    icon        VARCHAR(100)  DEFAULT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_sections (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    eyebrow    VARCHAR(100)  NOT NULL,
    title      VARCHAR(200)  NOT NULL,
    cols       INT           DEFAULT 3,
    sort_order INT           DEFAULT 0,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT           NOT NULL,
    title      VARCHAR(200)  DEFAULT '',
    src        VARCHAR(500)  NOT NULL,
    alt        VARCHAR(300)  DEFAULT '',
    sort_order INT           DEFAULT 0,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES gallery_sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sermons (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    series      VARCHAR(200)  NOT NULL,
    speaker     VARCHAR(100)  NOT NULL,
    date        VARCHAR(20)   NOT NULL,
    scripture   VARCHAR(200)  DEFAULT NULL,
    tag         VARCHAR(100)  DEFAULT NULL,
    featured    TINYINT(1)    DEFAULT 0,
    description TEXT          DEFAULT NULL,
    file        VARCHAR(500)  DEFAULT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);