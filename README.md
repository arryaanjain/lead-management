<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lead Management System - README</title>
</head>
<body>

<p align="center"><em>Smart Lead Management and Secure Catalogue Access for Modern Businesses</em></p>


<h1>📋 Lead Management System</h1>

<!-- Badges Section -->
<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue?logo=react" alt="React Badge" />
  <img src="https://img.shields.io/badge/Vite-Frontend-lightblue?logo=vite" alt="Vite Badge" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" alt="Node.js Badge" />
  <img src="https://img.shields.io/badge/Express.js-API-black?logo=express" alt="Express.js Badge" />
  <img src="https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb" alt="MongoDB Badge" />
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-38bdf8?logo=tailwindcss" alt="Tailwind Badge" />
  <img src="https://img.shields.io/badge/JWT-Authentication-orange?logo=jsonwebtokens" alt="JWT Badge" />
</p>
<br/>


<p>A secure and efficient lead management system for handling client requests, approvals, and protected catalogue access, built with <strong>React</strong>, <strong>Node.js</strong>, and <strong>MongoDB</strong>.</p>

<hr>

<h2>🚀 Features</h2>
<ul>
  <li>Client lead submission form</li>
  <li>Admin panel for lead approval/rejection</li>
  <li>Token-based secure access for approved clients</li>
  <li>Real-time status checking (Approved / Pending / Rejected)</li>
  <li>Protected access to confidential catalogue (PDF)</li>
  <li>Responsive and mobile-friendly UI</li>
  <li>Security measures against copying, printing, and screenshots</li>
</ul>

<hr>

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> React (Vite) + TailwindCSS + React Router</li>
  <li><strong>Backend:</strong> Node.js + Express.js</li>
  <li><strong>Database:</strong> MongoDB (Mongoose)</li>
  <li><strong>Authentication:</strong> JWT (JSON Web Tokens)</li>
  <li><strong>Storage:</strong> GridFS for large catalogue PDF</li>
</ul>

<hr>

<h2>🧩 Project Structure</h2>
<ul>
  <li><code>client/</code> - React frontend for clients</li>
  <li><code>admin/</code> - React frontend for admin dashboard</li>
  <li><code>server/</code> - Express backend API server</li>
</ul>

<hr>

<h2>📦 Setup Instructions</h2>

<h3>1. Clone the repository</h3>
<pre><code>git clone https://github.com/yourusername/lead-management-system.git
cd lead-management-system
</code></pre>

<h3>2. Install dependencies</h3>

<p>For each folder (<code>client</code>, <code>admin</code>, and <code>server</code>):</p>
<pre><code>npm install</code></pre>

<h3>3. Create Environment Variables</h3>

<p>Example <code>.env</code> file for <strong>server/</strong>:</p>
<pre><code>
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
</code></pre>

<p>Example <code>.env</code> file for <strong>client/</strong> and <strong>admin/</strong>:</p>
<pre><code>
VITE_API_URL=http://localhost:5000
</code></pre>

<h3>4. Start Development Servers</h3>

<p>In separate terminals:</p>
<ul>
  <li><strong>Server:</strong> <code>node index.js</code> <em>or</em> <code>nodemon index.js</code> <strong>(recommended)</strong></li>
  <li><strong>Client:</strong> <code>npm run dev</code></li>
  <li><strong>Admin:</strong> <code>npm run dev</code></li>
</ul>

<hr>

<h2>✅ Main Flows</h2>
<ul>
  <li><strong>Client submits lead</strong> ➡️ Status set to <code>pending</code>.</li>
  <li><strong>Admin approves/rejects</strong> ➡️ Status updated.</li>
  <li><strong>Client checks status</strong> ➡️ Accesses catalogue if <code>approved</code>.</li>
  <li><strong>Token status auto-refresh</strong> ➡️ In case of lead status changes while token is active.</li>
</ul>

<hr>

<h2>🛡️ Security Highlights</h2>
<ul>
  <li>JWT token verification middleware</li>
  <li>Access control on sensitive routes</li>
  <li>Catalogue display with disabled copying, printing, and screenshot warnings</li>
  <li>Session persistence via localStorage</li>
</ul>

<hr>

<h2>📷 Screenshots</h2>
<ul>
  <li>Client lead form submission screen</li>
  <li>Admin dashboard showing pending/approved/rejected leads</li>
  <li>Catalogue preview screen with mobile page indicators and security notice</li>
</ul>

<p><em>(Add screenshots here for better visibility!)</em></p>

<hr>

<h2>🤝 Contributing</h2>
<p>Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.</p>

<hr>

<h2>📄 License</h2>
<p>This project is licensed under the <strong>MIT License</strong>.</p>

</body>
</html>
