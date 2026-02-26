# Bradley Deans Portfolio

A personal portfolio website showcasing projects, skills, and professional experience. Includes a public-facing website, an admin dashboard for content management, and a RESTful API backend.

## Overview

This project consists of three main components:

| Component           | Description                                                     | Port |
|---------------------|-----------------------------------------------------------------|------|
| **Website**         | Public portfolio site at [deansbrad.com](https://deansbrad.com) | 5500 |
| **Admin Dashboard** | Content management interface                                    | 5501 |
| **API**             | RESTful backend service                                         | 3000 |

## Features

### Public Website
- Responsive portfolio showcasing projects and skills
- Testimonials section with visitor submissions
- Dark/light theme toggle
- Smooth scroll navigation and animations

### Admin Dashboard
- Secure JWT-based authentication
- Project management (CRUD operations)
- Testimonial moderation and approval
- System health monitoring
- Activity logs viewer

### API
- RESTful endpoints with versioned routing (`/v1/`)
- MongoDB database integration
- JWT authentication and authorization
- Rate limiting and security headers (Helmet)
- Image processing and optimization (Sharp)
- FTP integration for file uploads
- Email service for notifications
- Request logging and error tracking

## Tech Stack

| Layer        | Technologies                                  |
|--------------|-----------------------------------------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES Modules), jQuery  |
| **Backend**  | Node.js, Express 5                            |
| **Database** | MongoDB (Mongoose ODM)                        |
| **Security** | JWT, bcrypt, Helmet, CORS, Rate Limiting      |
| **Services** | Nodemailer (email), Sharp (images), basic-ftp |

## Project Structure

```
portfolio/
├── api/                    # Backend API service
│   ├── config/             # Environment configuration
│   ├── endpoints/          # Route handlers
│   ├── schemas/            # Mongoose models
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── website/                # Public portfolio site
│   └── src/
│       ├── assets/         # CSS, images
│       ├── components/     # UI components
│       ├── models/         # Data models
│       ├── services/       # API clients
│       └── utils/          # Utilities
└── website-admin/          # Admin dashboard
    └── src/
        ├── components/     # UI components
        ├── managers/       # State management
        ├── models/         # Data models
        ├── services/       # API clients
        └── utils/          # Utilities
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- FTP server (for image uploads)

### Environment Setup

Create environment files in `api/config/`:

```bash
# .env.development
NODE_ENV=development
PORT=3000
API_VERSION=1
APP_NAME=portfolio

# MongoDB
MONGO_URI=your_mongodb_uri
DB_NAME=portfolio

# JWT
JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h
JWT_ISSUER=portfolio-api

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CORS_ORIGINS=http://localhost:5500,http://localhost:5501

# Email (optional)
EMAIL_FROM=your_email
EMAIL_HOST=smtp_host
EMAIL_PORT=465
EMAIL_PASSWORD=your_password

# FTP (optional)
FTP_HOST=ftp_host
FTP_PORT=21
FTP_USER=ftp_user
FTP_PASSWORD=ftp_password
FTP_REMOTE_PATH=/path
FTP_PUBLIC_URL_BASE=https://your-domain.com
```

### Installation

```bash
# Install API dependencies
cd api
npm install

# Start the API in development mode
npm run dev
```

### Running the Websites

Use the VS Code tasks or serve manually:

```bash
# Website (port 5500)
cd website
npx http-server . -p 5500 -c-1

# Admin Dashboard (port 5501)
cd website-admin
npx http-server . -p 5501 -c-1
```

## API Endpoints

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| `GET`  | `/v1/`            | API status            |
| `GET`  | `/v1/health`      | Health check          |
| `POST` | `/v1/auth/login`  | User authentication   |
| `GET`  | `/v1/projects`    | List projects         |
| `POST` | `/v1/projects`    | Create project (auth) |
| `GET`  | `/v1/testimonial` | List testimonials     |
| `POST` | `/v1/testimonial` | Submit testimonial    |
| `GET`  | `/v1/logs`        | View logs (auth)      |

## License

All rights reserved. This project is not open for contributions.

---

*Built by Bradley Deans*