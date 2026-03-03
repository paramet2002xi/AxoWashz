CREATE DATABASE IF NOT EXISTS fan_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fan_db;

CREATE TABLE IF NOT EXISTS groups_role (
  id INT NOT NULL AUTO_INCREMENT,
  group_name VARCHAR(100)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    NOT NULL,
  created_date DATETIME NULL,
  created_by VARCHAR(255),
  updated_date DATETIME NULL,
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uq_groups_group_name (group_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_date DATETIME NULL,
  created_by VARCHAR(255),
  updated_date DATETIME NULL,
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_group (
  id INT NOT NULL AUTO_INCREMENT,
  users_id INT NULL,
  groups_id INT NULL,
  PRIMARY KEY (id),
  KEY ix_user_group_users_id (users_id),
  KEY ix_user_group_groups_id (groups_id),
  CONSTRAINT fk_user_group_users 
    FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_group_groups 
    FOREIGN KEY (groups_id) REFERENCES groups_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_menu (
  id INT NOT NULL AUTO_INCREMENT,
  groups_id INT NOT NULL,
  menu_code VARCHAR(50),
  menu_name VARCHAR(255)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci,
  path VARCHAR(255),
  created_date DATETIME NULL,
  created_by VARCHAR(255),
  updated_date DATETIME NULL,
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  KEY ix_user_menu_groups_id (groups_id),
  CONSTRAINT fk_user_menu_groups 
    FOREIGN KEY (groups_id) REFERENCES groups_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fans (
  id INT NOT NULL AUTO_INCREMENT,
  fan_name VARCHAR(255)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci,
  fan_id VARCHAR(255),
  fan_status VARCHAR(255)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci,
  created_date DATETIME NULL,
  created_by VARCHAR(255),
  updated_date DATETIME NULL,
  updated_by VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uq_fans_fan_id (fan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fans_log (
  id INT NOT NULL AUTO_INCREMENT,
  fan_name VARCHAR(255)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci,
  fan_id VARCHAR(255),
  fan_status VARCHAR(255)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci,
  coin VARCHAR(50),
  log_date DATETIME NULL,
  PRIMARY KEY (id),
  KEY ix_fans_log_fan_id (fan_id),
  KEY ix_fans_log_log_date (log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
