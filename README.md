# CivicTracker.ai - Panchayat / Ward Civic Issue Tracker

## Project Features
- **Citizen Portal**: Submit complaints with photo mock and mocked geolocation. Track complaints via unique ID.
- **Officer Dashboard**: Role-based board to view complaints, status update workflow, track SLA timelines visually.
- **Automated Workflow**: Easy update tracking, issue lifecycle history, and mock SLA escalation.

## Setup & Installation

**Prerequisites:** Node.js v18+ 

**1. Clone the repository / Unzip the folder**
\`\`\`bash
cd civic-issue-tracker
\`\`\`

**2. Setup Backend Server**
\`\`\`bash
cd backend
npm install
node server.js
\`\`\`
*(Server will start at http://localhost:5000 using a local mocked \`db.json\` database)*

**3. Setup Frontend Application**
Open a new terminal and run:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*(Application will start on Vite's default port, e.g. http://localhost:5173)*

## Tech Stack
- Frontend: React (Vite), TailwindCSS, Framer Motion, Lucide-React
- Backend: Node.js, Express.js
- Database: Mongoose (Initially structure modeled, adapted to \`db.json\` local storage for true portability in MVP to avoid MongoDB environment errors during eval).
