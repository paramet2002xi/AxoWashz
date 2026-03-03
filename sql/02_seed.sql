USE fan_db;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO groups_role (group_name, created_date, created_by) VALUES
('ผู้ใช้งาน', NOW(), 'ระบบ'),
('ผู้ดูแลระบบ', NOW(), 'ระบบ')
ON DUPLICATE KEY UPDATE group_name = VALUES(group_name);

INSERT INTO users (username, password, created_date, created_by) VALUES
('admin001', 'admin001', NOW(), 'ระบบ'),
('admin002', 'admin002', NOW(), 'ระบบ'),
('admin003', 'admin003', NOW(), 'ระบบ'),
('admin004', 'admin004', NOW(), 'ระบบ'),
('admin005', 'admin005', NOW(), 'ระบบ'),
('user001', 'user001', NOW(), 'ระบบ'),
('user002', 'user002', NOW(), 'ระบบ'),
('user003', 'user003', NOW(), 'ระบบ'),
('user004', 'user004', NOW(), 'ระบบ'),
('user005', 'user005', NOW(), 'ระบบ')
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO user_group (users_id, groups_id)
SELECT u.id, g.id
FROM users u
JOIN groups_role g ON g.group_name = 'ผู้ดูแลระบบ'
WHERE u.username LIKE 'admin%';

INSERT INTO user_group (users_id, groups_id)
SELECT u.id, g.id
FROM users u
JOIN groups_role g ON g.group_name = 'ผู้ใช้งาน'
WHERE u.username LIKE 'user%';

INSERT INTO user_menu (groups_id, menu_code, menu_name, path, created_date, created_by)
SELECT g.id, 'homepage', 'homepage', '/homepage', NOW(), 'ระบบ'
FROM groups_role g
WHERE g.group_name IN ('ผู้ใช้งาน','ผู้ดูแลระบบ');

INSERT INTO user_menu (groups_id, menu_code, menu_name, path, created_date, created_by)
SELECT g.id, 'adminpage', 'adminpage', '/adminpage', NOW(), 'ระบบ'
FROM groups_role g
WHERE g.group_name = 'ผู้ดูแลระบบ';

INSERT INTO fans (fan_name, fan_id, fan_status, created_date, created_by) VALUES
('ฮาตาริ เครื่องที่ 1', 'FAN-0001', 'เครื่องว่าง', NOW(), 'ระบบ'),
('ฮาตาริ เครื่องที่ 2', 'FAN-0002', 'เครื่องกำลังทำงาน', NOW(), 'ระบบ');
