# Relife Connect - ระบบบริหารงานภายในพรรคนักศึกษา

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [ข้อกำหนดการใช้งาน](#ข้อกำหนดการใช้งาน)
3. [การติดตั้งและการเริ่มต้น](#การติดตั้งและการเริ่มต้น)
4. [คู่มือการใช้งาน](#คู่มือการใช้งาน)
5. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
6. [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)

---

## ภาพรวมระบบ

**Relife Connect** เป็นระบบบริหารงานภายในพรรคนักศึกษาที่ออกแบบมาเพื่อจัดการข้อมูลสมาชิก การประชุม ร่างระเบียบ และการโหวต ระบบนี้แยกออกเป็นสองส่วนหลัก:

### 1. **Admin Panel (หลังบ้าน)**
- สำหรับคณะกรรมการบริหารพรรคเท่านั้น
- จัดการข้อมูลสมาชิก ตำแหน่ง ฝ่าย การประชุม และร่างระเบียบ
- ดูสถิติและรายงานการประชุม
- ควบคุมสิทธิ์การเข้าถึงข้อมูล (Open Data)

### 2. **Public Frontend (หน้าเว็บสาธารณะ)**
- เปิดให้บุคคลทั่วไปเข้าถึงได้
- ดูข้อมูลสมาชิก Open Data
- อ่านรายงานการประชุม
- ข้อมูลเกี่ยวกับพรรคและนโยบาย

---

## ข้อกำหนดการใช้งาน

### ระบบ
- **OS:** Linux/macOS/Windows (ผ่าน WSL)
- **Node.js:** v18+
- **npm/pnpm:** Latest version

### ฐานข้อมูล
- **MySQL/TiDB:** สำหรับเก็บข้อมูล
- **Drizzle ORM:** สำหรับจัดการฐานข้อมูล

### Authentication
- **Manus OAuth:** สำหรับระบบ Login

---

## การติดตั้งและการเริ่มต้น

### 1. Clone Repository
```bash
git clone <repository-url>
cd relife-connect
```

### 2. ติดตั้ง Dependencies
```bash
pnpm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่มตัวแปรต่อไปนี้:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_TITLE=Relife Connect
VITE_APP_LOGO=https://your-logo-url.png
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

### 4. สร้างและ Push ฐานข้อมูล
```bash
pnpm db:push
```

### 5. เริ่มต้น Dev Server
```bash
pnpm dev
```

เปิด browser ไปที่ `http://localhost:3000`

---

## คู่มือการใช้งาน

### สำหรับ Admin (คณะกรรมการบริหาร)

#### 1. **การ Login**
- คลิก "Login" บนหน้าแรก
- ใช้อีเมลที่ได้รับอนุญาต
- ระบบจะนำไปยัง Admin Dashboard

#### 2. **จัดการสมาชิก**
- ไปที่ **สมาชิก** ในเมนูด้านข้าง
- **เพิ่มสมาชิก:** คลิก "เพิ่มสมาชิก" และกรอกข้อมูล
- **แก้ไข:** คลิก Edit icon
- **ลบ:** คลิก Delete icon
- **Open Data:** ติ๊กถูก "เปิดเผย" เพื่อแสดงในหน้าสาธารณะ

#### 3. **จัดการตำแหน่ง**
- ไปที่ **ตำแหน่ง** ในเมนู
- เพิ่ม/แก้ไข/ลบตำแหน่งต่างๆ
- ตำแหน่งสามารถกำหนดให้สมาชิกได้

#### 4. **จัดการฝ่าย**
- ไปที่ **ฝ่าย** ในเมนู
- สร้างฝ่ายใหม่และจัดการสมาชิกในแต่ละฝ่าย

#### 5. **จัดการการประชุม**
- ไปที่ **การประชุม** ในเมนู
- **สร้างการประชุม:** กรอกวันที่ เวลา สถานที่ และรายละเอียด
- **บันทึกการเข้าร่วม:** ติ๊กชื่อสมาชิกที่เข้าร่วม
- **Open Data:** ติ๊กถูก "เปิดเผย" เพื่อแสดงในหน้าสาธารณะ

#### 6. **จัดการร่างระเบียบ**
- ไปที่ **ร่างระเบียบ** ในเมนู
- **สร้างร่าง:** กรอกชื่อ ผู้เสนอ และเนื้อหา
- **เปลี่ยนสถานะ:** 
  - **เสนอ:** ร่างใหม่
  - **พิจารณา:** กำลังพิจารณา
  - **ผ่านมติ:** ได้รับการอนุมัติ
  - **ไม่ผ่าน:** ถูกปฏิเสธ

#### 7. **ดูแดชบอร์ด**
- หน้าแรกของ Admin Panel
- แสดงสถิติจำนวนสมาชิก ตำแหน่ง ฝ่าย การประชุม และร่างระเบียบ
- แสดงสถานะร่างระเบียบและข้อมูล Open Data

### สำหรับ Public Users (บุคคลทั่วไป)

#### 1. **หน้าแรก**
- ข้อมูลเกี่ยวกับ Relife Connect
- ลิงก์ไปยัง "ทีมบริหาร" และ "รายงานการประชุม"

#### 2. **ดูทีมบริหาร**
- คลิก "ทีมบริหารพรรค" บนหน้าแรก
- ดูรายชื่อสมาชิก Open Data
- ค้นหาสมาชิกตามชื่อหรืออีเมล

#### 3. **ดูรายงานการประชุม**
- คลิก "รายงานการประชุม" บนหน้าแรก
- ดูรายงานการประชุม Open Data
- ค้นหารายงานตามชื่อหรือคำอธิบาย

---

## สถาปัตยกรรมระบบ

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Routing:** wouter
- **API Client:** tRPC

### Backend
- **Runtime:** Node.js
- **Framework:** Express 4
- **RPC:** tRPC 11
- **Database ORM:** Drizzle ORM

### Database Schema

#### Users (ผู้ใช้งาน)
```
id, name, email, loginMethod, role, createdAt, lastSignedIn
```

#### Members (สมาชิก)
```
id, firstName, lastName, studentId, email, phone, educationCenter, isOpenData, createdAt, updatedAt
```

#### Positions (ตำแหน่ง)
```
id, name, description, createdAt, updatedAt
```

#### Departments (ฝ่าย)
```
id, name, description, createdAt, updatedAt
```

#### Meetings (การประชุม)
```
id, meetingTypeId, title, date, time, location, description, isOpenData, createdAt, updatedAt
```

#### DraftRegulations (ร่างระเบียบ)
```
id, title, proposerMemberId, content, status, createdAt, updatedAt
```

#### Votes (การโหวต)
```
id, agendaId, memberId, voteType, createdAt
```

---

## ฟีเจอร์หลัก

### ✅ ระบบบริหารงานบุคคล
- [x] จัดการโปรไฟล์สมาชิก
- [x] จัดการตำแหน่งและฝ่าย
- [x] บันทึกการเข้าร่วมประชุม
- [x] ควบคุมการเปิดเผยข้อมูล (Open Data)

### ✅ ระบบสภานักศึกษา
- [x] จัดการการประชุม
- [x] บันทึกมติการประชุม
- [x] จัดการร่างระเบียบ/กฎหมาย
- [x] ติดตามสถานะร่างระเบียบ

### ✅ ระบบ Dashboard
- [x] สรุปสถิติสมาชิก ตำแหน่ง ฝ่าย
- [x] แสดงสถานะร่างระเบียบ
- [x] สรุปข้อมูล Open Data
- [x] รายชื่อสมาชิกล่าสุด

### ✅ ระบบ Open Data
- [x] หน้าแรกสาธารณะ
- [x] ดูทีมบริหาร (Open Data)
- [x] ดูรายงานการประชุม (Open Data)
- [x] ค้นหาและ Filter

### 🔄 ฟีเจอร์ที่อาจพัฒนาเพิ่มเติม
- [ ] ระบบการโหวต (Voting System)
- [ ] ระบบระเบียบวาระ (Agenda Management)
- [ ] ส่งออกรายงาน (Export Reports)
- [ ] ระบบแจ้งเตือน (Notifications)
- [ ] ระบบ Analytics ขั้นสูง

---

## การ Deploy

### สำหรับ Production
1. ตั้งค่า Environment Variables ที่ถูกต้อง
2. Build project: `pnpm build`
3. Deploy ไปยัง Hosting Service (Vercel, Netlify, etc.)
4. ตั้งค่า Database URL สำหรับ Production

---

## Troubleshooting

### ปัญหา: ไม่สามารถ Login ได้
- ตรวจสอบ Environment Variables
- ตรวจสอบการเชื่อมต่อ OAuth Server
- ล้าง Cache และ Cookies

### ปัญหา: ข้อมูลไม่แสดงใน Public Pages
- ตรวจสอบว่า `isOpenData` ถูกติ๊กถูก
- ตรวจสอบการเชื่อมต่อฐานข้อมูล

### ปัญหา: Error 404 บนหน้า Admin
- ตรวจสอบว่า User มีสิทธิ์ Login
- ตรวจสอบ Role ของ User ในฐานข้อมูล

---

## Support & Contact

สำหรับคำถามหรือปัญหาเพิ่มเติม โปรดติดต่อทีมพัฒนา Relife Connect

---

**Last Updated:** October 2025
**Version:** 1.0.0

