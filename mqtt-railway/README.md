# MQTT Railway Deploy

ใช้ deploy MQTT broker (Mosquitto) แยก service บน Railway

## วิธี deploy

1. สร้าง service ใหม่ใน Railway project
2. ตั้งค่า **Root Directory** = `mqtt-railway` (หรือ `frontend/mqtt-railway` ถ้า repo root เป็น WashEnd)
3. Railway จะใช้ `railway.json` และ `Dockerfile` ในโฟลเดอร์นี้โดยอัตโนมัติ
4. ไม่ต้องตั้ง Start Command (จะใช้ CMD จาก image)

## ทำไมต้องแยกโฟลเดอร์

`railway.json` ที่ root มี `startCommand: "HOSTNAME=0.0.0.0 npm run start"` สำหรับ Next.js  
ถ้า MQTT ใช้โฟลเดอร์เดียวกัน Railway จะใช้คำสั่งนั้นกับ MQTT container → error เพราะ image ไม่มี npm
