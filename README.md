# University Research Opportunity Portal

A production-ready full-stack web application designed for managing and discovering university research positions. Built for **Computer Networks (CN) Assignment 01**.

---

## 🌟 Features

- **Dynamic Opportunities Dashboard:** View, filter (by Status/Department), and real-time search across posted research positions.
- **Full RESTful API:** Standardized JSON endpoints supporting complete CRUD operations with robust HTTP status codes (`200`, `201`, `400`, `404`, `500`).
- **Input Validation:** Both client-side (Bootstrap form validation) and backend validation middleware for data integrity.
- **Status Lifecycle Management:** Instantly toggle opportunity status between **Open** and **Closed**.
- **Interactive UI:** Built with Bootstrap 5 cards, statistics overview cards, detail viewer modals, floating toast notifications, and delete confirmation prompts.
- **Automated Database Tooling:** One-command MySQL database setup and seeding script.

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0 / MariaDB (utilizing `mysql2/promise` pool)
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API), Bootstrap 5
- **API Testing:** Postman Collection v2.1 (Exported JSON included)
- **Environment Management:** `dotenv`

---

## 📁 Repository Structure

```text
P23-0551/
├── config/
│   └── db.js                        # MySQL connection pool configuration
├── controllers/
│   └── opportunityController.js     # REST API business logic & input validation
├── middleware/
│   └── errorHandler.js              # Centralized error handling & 404 handler
├── public/                          # Frontend static assets
│   ├── css/
│   │   └── styles.css               # Custom styling & responsive layouts
│   ├── js/
│   │   └── app.js                   # Client Fetch API & DOM manipulation logic
│   └── index.html                   # Bootstrap 5 Single Page Application UI
├── routes/
│   └── opportunities.js             # Express API routes definition
├── scripts/
│   └── initDb.js                    # Automated MySQL database setup script
├── .env.example                     # Environment configuration template
├── .gitignore                       # Git ignore definitions
├── package.json                     # Node.js project manifest & scripts
├── README.md                        # Project documentation & setup guide
├── research_portal.postman_collection.json # Exported Postman Collection v2.1
└── schema.sql                       # Database schema & sample seed data
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18+ recommended) & **npm**
- **MySQL Server** (v8.0+ running on port `3306` or custom port)

### 1. Clone & Install Dependencies

```bash
# Navigate to the workspace directory
cd /path/to/P23-0551

# Install required Node.js packages
npm install
```

### 2. Environment Configuration

Copy `.env.example` to create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` to match your local MySQL credentials:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=research_portal
```

### 3. Initialize MySQL Database

Import `schema.sql` into your MySQL server automatically using the setup command:

```bash
npm run db:setup
```

*Alternatively, you can manually import `schema.sql` via MySQL CLI:*

```bash
mysql -u root -p < schema.sql
```

### 4. Start the Application

```bash
# Start production server
npm start

# Or start in development mode with nodemon
npm run dev
```

Open your browser and navigate to: **[http://localhost:5000](http://localhost:5000)**

---

## 📡 REST API Reference

All endpoints return standardized JSON format and appropriate HTTP status codes.

Base URL: `http://localhost:5000/api/opportunities`

| Method | Endpoint | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/opportunities` | Create a new research opportunity | `201 Created`, `400 Bad Request` |
| **GET** | `/api/opportunities` | Retrieve all research opportunities (supports `?status=`, `?department=`, `?search=`) | `200 OK`, `500 Server Error` |
| **GET** | `/api/opportunities/:id` | Retrieve a single opportunity by ID | `200 OK`, `404 Not Found` |
| **PUT** | `/api/opportunities/:id` | Update opportunity details or toggle status | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/opportunities/:id` | Delete a research opportunity by ID | `200 OK`, `404 Not Found` |

---

## 🧪 Postman API Testing Instructions

An exported Postman Collection **v2.1** (`research_portal.postman_collection.json`) is included in the project root directory.

### Mandatory Test Coverage Included:

1. **POST** `/api/opportunities` — Create Opportunity 1 (`201 Created`)
2. **POST** `/api/opportunities` — Create Opportunity 2 (`201 Created`)
3. **POST** `/api/opportunities` — Create Opportunity 3 (`201 Created`)
4. **GET** `/api/opportunities` — Retrieve All Opportunities (`200 OK`)
5. **GET** `/api/opportunities/:id` — Retrieve Single Opportunity by ID (`200 OK`)
6. **PUT** `/api/opportunities/:id` — Update Opportunity Details (`200 OK`)
7. **PUT** `/api/opportunities/:id` — Toggle/Close Opportunity Status (`200 OK`)
8. **DELETE** `/api/opportunities/:id` — Delete Opportunity (`200 OK`)
9. **GET** `/api/opportunities/:id` — Re-get Deleted Opportunity (`404 Not Found`)
10. **POST** `/api/opportunities` — Create Opportunity with Invalid Payload (`400 Bad Request`)

### How to Import & Run in Postman:

1. Open **Postman**.
2. Click **Import** (top-left) and select `research_portal.postman_collection.json`.
3. Ensure the server is running (`http://localhost:5000`).
4. Click **Run Collection** to execute all 10 tests sequentially.

---

## 🔗 Repository & Submission Link
GitHub Repository: https://github.com/mobeenhaider2007-ux/research-opportunity-portal
---

## 📄 License & Attribution

Developed for Computer Networks (CN) Assignment 01 — University Research Opportunity Portal.
