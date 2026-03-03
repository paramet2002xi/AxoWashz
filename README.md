# ระบบจัดการเครื่องซักผ้า

เว็บไซต์สำหรับดูสถานะเครื่องซักผ้า พัฒนาด้วย Next.js และ Tailwind CSS

## คุณสมบัติ

- 🔐 ระบบล็อกอิน (ผู้ใช้ทั่วไปและแอดมิน)
- 🏠 หน้า Home - ดูสถานะเครื่องซักผ้าทั้งหมด
- 👨‍💼 หน้า Admin - จัดการเครื่องซักผ้า (เพิ่ม, แก้ไข, ลบ, เปลี่ยนสถานะ)
- 📊 แสดงสถิติเครื่องซักผ้าแบบเรียลไทม์
- 🎨 UI สวยงามและใช้งานง่าย

## การติดตั้ง

```bash
npm install
```

## การรันโปรเจกต์

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## การเชื่อมต่อกับ Backend

Frontend เชื่อมต่อกับ Backend API โดยอัตโนมัติ

### ตั้งค่า Backend URL

สร้างไฟล์ `.env.local` ในโฟลเดอร์ `frontend/`:

```bash
# Backend API URL (default: http://localhost:4658)
NEXT_PUBLIC_API_URL=http://localhost:4658
```

หรือถ้า Backend รันบน port 8080:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### เริ่มต้น Backend

ก่อนรัน Frontend ให้แน่ใจว่า Backend ทำงานอยู่:

```bash
# ใช้ Docker Compose (แนะนำ)
cd frontend
docker compose up -d --build

# หรือรัน Backend โดยตรง
./gradlew bootRun
```

Backend จะรันที่ `http://localhost:4658` (หรือ port ที่กำหนดใน `application.yml`)

## ข้อมูลสำหรับทดสอบ

### ผู้ใช้ทั่วไป
- **ชื่อผู้ใช้:** `user001`, `user002`, `user003`, `user004`, `user005`
- **รหัสผ่าน:** `user001`, `user002`, `user003`, `user004`, `user005` (ตามลำดับ)

### ผู้ดูแลระบบ (Admin)
- **ชื่อผู้ใช้:** `admin001`, `admin002`, `admin003`, `admin004`, `admin005`
- **รหัสผ่าน:** `admin001`, `admin002`, `admin003`, `admin004`, `admin005` (ตามลำดับ)

> **หมายเหตุ:** ข้อมูลผู้ใช้มาจาก seed data ใน Backend

## โครงสร้างโปรเจกต์

```
app/
├── contexts/
│   └── AuthContext.tsx      # Context สำหรับจัดการ Authentication
├── lib/
│   └── mockData.ts          # ข้อมูลเครื่องซักผ้าสำหรับทดสอบ
├── types/
│   └── washingMachine.ts    # Type definitions
├── admin/
│   └── page.tsx              # หน้าแอดมิน
├── home/
│   └── page.tsx              # หน้า Home
├── login/
│   └── page.tsx              # หน้า Login
├── layout.tsx                # Root layout
└── page.tsx                  # หน้าแรก (redirect)
```

## เทคโนโลยีที่ใช้

- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Context** - State Management

## สถานะเครื่องซักผ้า

- **พร้อมใช้งาน** (available) - เครื่องพร้อมใช้งาน
- **กำลังใช้งาน** (in-use) - มีคนใช้งานอยู่
- **ซ่อมบำรุง** (maintenance) - กำลังซ่อมบำรุง
- **เกิดข้อผิดพลาด** (error) - เกิดข้อผิดพลาด

## Deploy บน Railway

**สำคัญ:** ไฟล์ `railway.json` ไม่มี `startCommand` เพื่อให้ Backend และ MQTT ใช้ CMD/ENTRYPOINT จาก Dockerfile ได้

| Service | Root Directory | ตั้งค่าใน Railway |
|---------|----------------|-------------------|
| **Frontend** | `frontend` | ใช้ `Dockerfile.frontend` • ตั้ง **Variable** `NEXT_PUBLIC_API_URL` = URL ของ Backend (เช่น `https://backend-production-xxxx.up.railway.app`) |
| **Backend** | `frontend` | ใช้ `Dockerfile` • Start Command ว่างเปล่า |
| **MQTT** | `mqtt-railway` | Start Command ว่างเปล่า |

## การพัฒนาเพิ่มเติม

- ✅ เชื่อมต่อกับ API จริง (เสร็จแล้ว)
- เพิ่มระบบแจ้งเตือน
- เพิ่มระบบจองเครื่องซักผ้า
- เพิ่มระบบประวัติการใช้งาน

## สถานะการเชื่อมต่อ

Frontend ตอนนี้เชื่อมต่อกับ Backend API แล้ว:
- ✅ ระบบล็อกอินผ่าน JWT
- ✅ ดึงข้อมูลเครื่องซักผ้าจาก API
- ✅ Admin สามารถเพิ่ม/ลบ/แก้ไขเครื่องซักผ้า
- ✅ Auto-refresh ข้อมูลทุก 30 วินาที
- ✅ CORS configuration ใน Backend

# Fan Status Tracking Backend (Spring Boot + Gradle + MySQL + MQTT)

## What you get
- Spring Boot (Gradle) REST API + JWT
- MySQL (Docker) with schema + seed data
- MQTT subscriber (topic: `fan/status`) that ingests the same JSON as `/api/board/status`
- Docker Compose to run everything

> Note: The seed users/passwords are stored as **PLAINTEXT** to match your sample responses.  
> For production, switch to BCrypt hashing (Spring Security) and never return passwords in APIs.

---

## 1) Run with Docker Compose
```bash
docker compose up -d --build
```

### Services
- MySQL: `localhost:3306` (db: `fan_db`, user: `fan_user`, pass: `fan_pass`)
- Backend: `http://localhost:8080`
- MQTT broker (Mosquitto): `localhost:1883`

---

## 2) Seed accounts (already in DB)
### Admin (role: ผู้ดูแลระบบ)
- admin001 / admin001
- admin002 / admin002
- admin003 / admin003
- admin004 / admin004
- admin005 / admin005

### User (role: ผู้ใช้งาน)
- user001 / user001
- user002 / user002
- user003 / user003
- user004 / user004
- user005 / user005

---

## 3) API quick test

### Login (JWT)
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{"username":"admin001","password":"admin001"}"
```

### Get fans status (requires JWT)
```bash
curl http://localhost:8080/api/fans/status ^
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Admin create fan (requires admin JWT)
```bash
curl -X POST http://localhost:8080/api/admin/fans ^
  -H "Authorization: Bearer <JWT_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{"fan_name":"ฮาตาริ เครื่องที่ 3","fan_id":"16584263MN12548"}"
```

### Board sends status (no auth)
```bash
curl -X POST http://localhost:8080/api/board/status ^
  -H "Content-Type: application/json" ^
  -d "{"fan_name":"ฮาตาริ เครื่องที่ 3","fan_id":"16584263MN12548","fan_status":"เครื่องกำลังทำงาน","coin":"5"}"
```

### MQTT publish example
Publish the same JSON to topic `fan/status`:
```bash
# If you have mosquitto_pub installed:
mosquitto_pub -h localhost -t fan/status -m "{"fan_name":"ฮาตาริ เครื่องที่ 3","fan_id":"16584263MN12548","fan_status":"เครื่องว่าง","coin":"10"}"
```

### Get menu for current user (requires JWT)
```bash
curl http://localhost:8080/api/menu ^
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 4) Notes
- `/api/admin/**` requires role "ผู้ดูแลระบบ" (mapped to `ROLE_ADMIN`)
- Other `/api/**` (except `/api/auth/**` and `/api/board/**`) requires login
- JWT includes:
  - subject = username (ClaimTypes.Name equivalent)
  - `UserId` claim = user id from DB
  - expires in 7 days (configurable via `APP_JWT_EXPIRE_DAYS`)

#   A x o W a s h z 
 
 