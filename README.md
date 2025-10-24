# Relife Connect - Student Organization Management System

**Relife Connect** เป็นระบบบริหารงานภายในพรรคนักศึกษาที่ออกแบบมาเพื่อจัดการข้อมูลสมาชิก การประชุม ร่างระเบียบ และการโหวต

## 🚀 Quick Start

### ติดตั้ง Dependencies
```bash
pnpm install
```

### ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` ตามตัวอย่างใน `.env.example`

### สร้างฐานข้อมูล
```bash
pnpm db:push
```

### เริ่ม Dev Server
```bash
pnpm dev
```

เปิด browser ไปที่ `http://localhost:3000`

---

## 📋 ฟีเจอร์หลัก

### Admin Panel (หลังบ้าน)
- ✅ จัดการสมาชิก (Members)
- ✅ จัดการตำแหน่ง (Positions)
- ✅ จัดการฝ่าย (Departments)
- ✅ จัดการการประชุม (Meetings)
- ✅ จัดการร่างระเบียบ (Regulations)
- ✅ Dashboard พร้อมสถิติ

### Public Frontend (หน้าเว็บสาธารณะ)
- ✅ ดูทีมบริหาร (Open Data)
- ✅ ดูรายงานการประชุม (Open Data)
- ✅ ค้นหาและ Filter
- ✅ Responsive Design

---

## 🛠 Tech Stack

### Frontend
- React 19
- Tailwind CSS 4
- shadcn/ui
- tRPC
- Vite

### Backend
- Node.js + Express
- tRPC
- Drizzle ORM
- MySQL/TiDB

### Authentication
- Manus OAuth

---

## 📚 Documentation

ดูรายละเอียดเพิ่มเติมใน [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## 📁 Project Structure

```
relife-connect/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main app
│   └── public/            # Static assets
├── server/                # Backend (Express + tRPC)
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   └── _core/             # Core utilities
├── drizzle/               # Database schema & migrations
│   └── schema.ts          # Database tables
└── storage/               # S3 storage helpers
```

---

## 🔐 Authentication

ระบบใช้ **Manus OAuth** สำหรับ Login:
- Admin Panel: ต้อง Login ด้วยอีเมลที่ได้รับอนุญาต
- Public Pages: เข้าถึงได้โดยไม่ต้อง Login

---

## 📊 Database Schema

### หลัก Tables
- **users** - ผู้ใช้งาน
- **members** - สมาชิก
- **positions** - ตำแหน่ง
- **departments** - ฝ่าย
- **meetings** - การประชุม
- **draftRegulations** - ร่างระเบียบ
- **votes** - การโหวต

---

## 🚀 Deployment

### Build for Production
```bash
pnpm build
```

### Deploy
- ใช้ Vercel, Netlify, หรือ hosting service อื่น
- ตั้งค่า Environment Variables ที่ถูกต้อง
- ตั้งค่า Database URL สำหรับ Production

---

## 📝 License

MIT License

---

## 👥 Contributors

- Relife Connect Development Team

---

## 📧 Support

สำหรับคำถามหรือปัญหา โปรดติดต่อทีมพัฒนา

---

**Version:** 1.0.0  
**Last Updated:** October 2025

# relife-app
