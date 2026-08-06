# JedOS — Desktop-style Portfolio

Full-stack portfolio จำลองหน้า desktop OS
Stack: React + TypeScript + Tailwind (frontend) · C#/.NET 8 Web API (backend) · PostgreSQL · Docker/Railway

## โครงสร้างโปรเจกต์

```
portfolio-fullstack/
├── client/          React + TS + Tailwind (Vite)
├── server/          ASP.NET Core Web API + EF Core (Npgsql)
└── docker-compose.yml
```

## รันแบบ local (ต้องมี Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:5000 (Swagger ที่ /swagger เมื่อรันแบบ Development)
- Postgres: localhost:5432 (user: postgres / pass: devpass)

## ตั้งค่าครั้งแรกสำหรับ Backend (EF Core Migration)

เครื่องนี้ยังไม่มี .NET SDK ติดตั้ง — ให้รันคำสั่งนี้บนเครื่องของคุณเองในโฟลเดอร์ `server/`
ก่อน build image ครั้งแรก (สร้างไฟล์ migration จริงจาก Models ที่เตรียมไว้):

```bash
cd server
dotnet tool install --global dotnet-ef   # ถ้ายังไม่มี
dotnet ef migrations add InitialCreate
```

`Program.cs` ตั้งไว้ให้รัน `db.Database.Migrate()` อัตโนมัติตอน startup
เพราะฉะนั้นแค่มี migration files ก็พอ ไม่ต้องรัน `dotnet ef database update` เองอีก
(container จะ apply ให้เองตอนเริ่มทำงาน)

## รันแบบ dev แยกส่วน (ไม่ผ่าน Docker)

**Backend:**
```bash
cd server
dotnet restore
dotnet run
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```
สร้างไฟล์ `.env` ใน `client/` ใส่ `VITE_API_URL=http://localhost:5000`

## Deploy ด้วย Docker ล้วนๆ บน VPS ของตัวเอง

ถ้าไม่อยากใช้ Railway และมี VPS เป็นของตัวเอง (DigitalOcean, Vultr, Hetzner ฯลฯ) ใช้ไฟล์
`docker-compose.prod.yml` ที่เตรียมไว้ได้เลย — มันรวม **Caddy** เป็น reverse proxy ที่ออก
HTTPS certificate ให้อัตโนมัติ (Let's Encrypt) ไม่ต้องตั้ง SSL เอง

### สิ่งที่ต้องมีก่อน
- VPS ที่ติดตั้ง Docker + Docker Compose แล้ว (`curl -fsSL https://get.docker.com | sh`)
- โดเมนที่ชี้ DNS A record มาที่ IP ของ VPS แล้ว (ต้องมี 2 record: `yourdomain.com` และ `api.yourdomain.com`)

### ขั้นตอน

1. Clone/copy โปรเจกต์ขึ้น VPS
2. สร้างไฟล์ `.env` จาก `.env.example` แล้วใส่โดเมนจริงกับรหัสผ่าน DB ที่แข็งแรง:
   ```bash
   cp .env.example .env
   nano .env   # แก้ DOMAIN และ DB_PASSWORD
   ```
3. รัน:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
4. รอสัก 1-2 นาทีให้ Caddy ขอ SSL certificate เสร็จ แล้วเข้า `https://yourdomain.com` ได้เลย

### คำสั่งที่ใช้บ่อยหลัง deploy

```bash
# ดู log
docker compose -f docker-compose.prod.yml logs -f api

# อัปเดตโค้ดใหม่ (หลัง git pull)
docker compose -f docker-compose.prod.yml up -d --build

# หยุดทั้งระบบ
docker compose -f docker-compose.prod.yml down

# หยุดแต่ไม่ลบข้อมูล DB (volume ยังอยู่)
docker compose -f docker-compose.prod.yml down --volumes=false
```

### หมายเหตุเรื่องความปลอดภัย
- `db` service ใน compose ไฟล์นี้ไม่ publish port ออกสู่ภายนอกเลย เข้าถึงได้แค่จาก container อื่นใน network เดียวกัน
- อย่า commit ไฟล์ `.env` จริงขึ้น git — ใส่ `.env` ใน `.gitignore` ไว้แล้ว
- แนะนำตั้ง backup อัตโนมัติสำหรับ `pgdata` volume (เช่น cron job รัน `pg_dump` ทุกคืน)

## Deploy บน Railway

สร้าง 3 services แยกกันในโปรเจกต์เดียว:

1. **PostgreSQL** — ใช้ Railway's managed Postgres plugin โดยตรง (New → Database → PostgreSQL)
   Railway จะ generate `DATABASE_URL` ให้อัตโนมัติ

2. **API service** — deploy จาก `server/` folder (Railway จะ detect Dockerfile เอง)
   ตั้ง environment variables:
   - `FrontendUrl` = URL ของ frontend service (เช่น `https://your-client.up.railway.app`)
   - `DATABASE_URL` จะถูก inject มาจาก Postgres plugin อัตโนมัติถ้า link service กันไว้ (Program.cs อ่านค่านี้ให้แล้ว)
   - `Smtp__User`, `Smtp__Password`, `Smtp__NotifyTo` — สำหรับส่งอีเมลแจ้งเตือนเวลามีคนกรอกฟอร์ม Contact
     (`Smtp__Password` ต้องเป็น Gmail App Password จาก myaccount.google.com/apppasswords ไม่ใช่รหัสผ่านปกติ)
     ถ้าไม่ตั้งค่านี้ ฟอร์ม Contact ยังบันทึกลง DB ได้ปกติ แค่จะไม่มีอีเมลแจ้งเตือนเข้ามา

3. **Client service** — deploy จาก `client/` folder
   ตั้ง build arg / env variable:
   - `VITE_API_URL` = URL ของ API service (เช่น `https://your-api.up.railway.app`)

หลัง deploy ครั้งแรก อย่าลืมกลับไปอัปเดต `FrontendUrl` ใน API service ให้ตรงกับ URL จริงของ client
(เพราะตอน deploy ครั้งแรก Railway ยังไม่ generate domain ให้จนกว่าจะ deploy เสร็จรอบนึงก่อน)

## Endpoints หลัก

| Method | Path            | คำอธิบาย                        |
|--------|-----------------|----------------------------------|
| GET    | /api/projects   | รายการผลงานทั้งหมด               |
| GET    | /api/projects/{id} | ผลงานรายชิ้น                  |
| GET    | /api/skills     | รายการทักษะ + % ความชำนาญ        |
| POST   | /api/contact    | ส่งข้อความติดต่อ (บันทึกลง DB)   |

## ขั้นตอนถัดไปที่แนะนำ

- เพิ่ม resize หน้าต่าง (ตอนนี้ลากย้ายตำแหน่งได้อย่างเดียว)
- เพิ่ม loading skeleton แทนข้อความ "กำลังโหลด..." ธรรมดา
- เพิ่ม admin endpoint (ป้องกันด้วย API key) สำหรับเพิ่ม/แก้ projects โดยไม่ต้อง redeploy
- ใส่ rate limiting ที่ `/api/contact` กันสแปม
