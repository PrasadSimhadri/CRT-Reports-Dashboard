# CRT Reports Dashboard - Frontend

## Overview

The **CRT Reports Dashboard** is a web-based application designed to provide detailed insights into student and batch performance.
It allows administrators, faculty, and stakeholders to track **batch reports, student-wise reports, test-wise reports and missing test reports** in a structured and interactive way.

The project is built with **Next.js** and follows a modular structure for scalability and maintainability.

---

## Features

* 📊 **Batch Reports** – View consolidated reports at the batch level.
* 👨‍🎓 **Student Reports** – Analyze performance of individual students.
* 📝 **Test Reports** – Generate and view test-specific reports.
* ⚠️ **Missing Test Reports** – Identify students/tests with missing reports.
* ⚙️ **Settings Module** – Manage application-level configurations.
* 🔐 **Login Authentication** – Secure access to the dashboard.
* 🎨 **Modern UI** – Built with Next.js, React, and CSS for responsive design.

---

## Project Structure

```
CRT-Reports-Dashboard/
├── .next/                # Next.js build output
├── docs/                 # Documentation (if any)
├── node_modules/         # Dependencies
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   |    ├── batch-reports/        # Batch-level analytics
│   │   |    ├── student-reports/      # Student-wise reports
│   │   |    ├── test-reports/         # Test-wise reports
│   │   |    ├── test-missing-reports/ # Missing reports tracking
│   │   |    ├── settings/             # App settings
│   │   |    ├── page.tsx              # Entry point (home page)
│   │   |    ├── layout.tsx          
│   │   ├── api/                  # API routes
│   │   ├── login/                # Authentication
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   └── lib/                      # Utility functions
├── .env                   # Environment variables
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

---

## Tech Stack

* **Frontend Framework:** [Next.js](https://nextjs.org/)
* **Styling:** CSS / Tailwind (if added)
* **State Management:** React hooks
* **Backend Integration:** Next.js API routes
* **Deployment:** Vercel / Azure App Hosting

---

## Installation & Setup

### Clone the repository

```bash
git clone https://github.com/your-username/CRT-Reports-Dashboard-Frontend.git
cd CRT-Reports-Dashboard
```

### Install dependencies

```bash
npm install
```

### Setup environment variables

Create a `.env` file in the root directory:

```
NEXT_PUBLIC_API_URL=<your-api-url>
NEXTAUTH_SECRET=<your-secret>
```

### Run the development server

```bash
npm run dev
```

Now open [http://localhost:9002](http://localhost:9002) to view the app.

---

## Build for Production

```bash
npm run build
npm run dev
```

---

