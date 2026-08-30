# 🏘 Smart Community Management System (SCMS)

A full-stack web application for managing a residential community — **Java Servlets**,
**MySQL**, and a **vanilla HTML/CSS/JS** frontend.

![Java](https://img.shields.io/badge/Java-JDK%2017%2B-orange?style=flat-square&logo=openjdk)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![Tomcat](https://img.shields.io/badge/Tomcat-10.1-yellow?style=flat-square&logo=apachetomcat)
![Maven](https://img.shields.io/badge/Maven-3.9-red?style=flat-square&logo=apachemaven)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🚀 Live demo

The frontend is deployed as a static site (e.g. Netlify) and ships with an
**in-browser mock API** — so the whole app is clickable with **no backend**.

> Deploy on Netlify: connect the repo, publish directory `frontend`, no build
> command (already set in [`netlify.toml`](netlify.toml)).

Demo logins:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@scms.com` | `admin123` |
| Resident | `ali@scms.com` | `resident123` |
| Guard | `guard@scms.com` | `guard123` |

Demo data lives in `localStorage`. Reset it any time: add `?resetdb` to the URL,
or run `SCMS_MOCK.reset()` in the browser console.

---

## ✨ Features

### 👑 Admin
- Live dashboard with charts (visitors, complaints, billing, parking stats)
- Approve / reject visitor entries
- Manage complaints with priority and status tracking
- Add bills and mark payments
- Monitor parking slots in real time
- Post community announcements
- Add / remove residents, guards, and admins

### 🏠 Resident
- View personal bills and payment status
- Submit and track complaints
- Pre-register visitors for their apartment
- Read community announcements and notices

### 🛡 Guard
- Register new visitors at the gate
- View today's entry list with approval status

---

## 🛠 Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, vanilla JavaScript, Chart.js (CDN) |
| Demo backend | In-browser mock API — `frontend/js/mock-api.js` (localStorage) |
| Real backend | Java Servlets (Jakarta EE 10 / Servlet 6.0) |
| Database | MySQL 8 |
| App server | Apache Tomcat 10.1 |
| Build tool | Apache Maven 3.9 |
| DB driver | MySQL Connector/J 8.3 |
| JSON | `org.json` |

---

## 📁 Project structure

```
.
├── frontend/                     # Static site (deploy this folder)
│   ├── index.html                # Login
│   ├── admin.html                # Admin dashboard
│   ├── visitors.html complaints.html billing.html parking.html
│   ├── announcements.html manage-users.html
│   ├── guard.html resident.html
│   ├── sidebar.js                # Shared sidebar + styles
│   ├── js/
│   │   ├── config.js             # apiBase + useMock switch
│   │   └── mock-api.js           # in-browser API (mirrors the servlets)
│   └── prototypes/               # archived early mockups (not used)
│
├── backend/                      # Java Maven project → scms.war
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/scms/
│       │   ├── servlet/          # Login, Dashboard, Visitor, Complaint,
│       │   │                     #   Bill, Parking, Announcement, User
│       │   ├── util/DBConnection.java
│       │   ├── model/User.java
│       │   └── patterns/         # 6 GoF design-pattern demos
│       └── webapp/WEB-INF/web.xml
│
├── database/
│   ├── scms_database.sql         # schema + sample data
│   └── scms_updates.sql          # announcements table
│
├── docs/HOW_TO_RUN.txt           # detailed local setup guide
├── netlify.toml
└── LICENSE
```

---

## ⚙️ Run the full stack locally

Prereqs: **JDK 17+**, **Maven 3.9+**, **MySQL 8** (XAMPP is fine), **Tomcat 10.1**.

### 1. Database
Import both SQL files (phpMyAdmin → SQL tab, or `mysql` CLI):

```bash
mysql -u root -p < database/scms_database.sql
mysql -u root -p < database/scms_updates.sql
```

### 2. Backend
```bash
cd backend
mvn clean package
```
Produces `backend/target/scms.war`.

DB settings are read from env vars (fallbacks in parentheses):
`SCMS_DB_URL` (`jdbc:mysql://localhost:3306/scms_db?useSSL=false&serverTimezone=UTC`),
`SCMS_DB_USER` (`root`), `SCMS_DB_PASSWORD` (empty).

### 3. Deploy
Copy `scms.war` into `<tomcat>/webapps/`, start Tomcat, then check:
`http://localhost:8080/scms/api/dashboard` → JSON.

### 4. Point the frontend at it
In [`frontend/js/config.js`](frontend/js/config.js) set `useMock: false`
(and `apiBase` if not `http://localhost:8080/scms/api`). Or open any page with
`?mock=off`. Serve `frontend/` with any static server.

---

## 🌐 API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user |
| GET | `/api/dashboard` | Live stats |
| GET/POST/PUT/DELETE | `/api/visitors` | Visitor CRUD |
| GET/POST/PUT | `/api/complaints` | Complaint CRUD |
| GET/POST/PUT | `/api/bills` | Billing CRUD (`?resident_id=` filter) |
| GET/PUT | `/api/parking` | Parking slots |
| GET/POST/DELETE | `/api/announcements` | Announcements |
| GET/POST/DELETE | `/api/users` | User management |

The mock API implements every one of these with the same request/response shapes.

---

## 🧠 Design patterns (`backend/.../patterns/`)

| Pattern | Class | Purpose |
|---------|-------|---------|
| Singleton | `AdminSession` | Single admin session instance |
| Factory | `VehicleFactory` | Creates `Car` / `Bike` |
| Builder | `Residentbuilder` | Builds `Resident` step by step |
| Adapter | `ComplaintAdapter` | Adapts a legacy complaint system |
| Bridge | `Bill` + `PaymentMethod` | Decouples payment methods |
| Composite | `LoginForm` | Composes form-field components |

Each package has a `*Demo` class with a `main` method.

---

## 🗄 Database schema

```
users         → id, name, email, password, role, phone, apartment, created_at
visitors      → id, visitor_name, cnic, house_number, purpose, vehicle_number,
                visit_time, notes, status, added_by, created_at
complaints    → id, resident_id, apartment, category, priority, description,
                status, created_at
bills         → id, resident_id, apartment, service, month, amount, status,
                created_at
parking       → id, slot_number, resident_id, vehicle_number, status
announcements → id, title, message, type, posted_by, created_at
```

---

## ⚠️ Notes & known limitations

- Passwords are stored in plain text — fine for a course demo, **not** for
  production. Hash them (bcrypt/argon2) before any real use.
- The servlets use permissive CORS (`Access-Control-Allow-Origin: *`).
- The mock API is for demo/portfolio use only; it holds no real data.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

Built as a university project at Sir Syed University of Engineering & Technology (SSUET).
