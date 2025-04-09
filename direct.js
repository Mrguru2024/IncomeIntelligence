import http from 'http';
import fs from 'fs';
import path from 'path';

// This is a completely standalone HTTP server that has NO dependencies on Vite, React, or Firebase
// It's meant to be run independently of the main application

const port = 8080;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stackr Finance - Direct HTML</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 900px; margin: 0 auto; padding: 2rem; background-color: #f9fafb; color: #111827; }
    .header { margin-bottom: 2rem; text-align: center; }
    h1 { color: #4f46e5; font-size: 2.5rem; margin-bottom: 0.5rem; }
    .subtitle { color: #4b5563; font-size: 1.25rem; }
    .card { background: white; border-radius: 0.5rem; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .nav { display: flex; justify-content: center; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; font-weight: 500; }
    .button:hover { background: #4338ca; }
    .feature-card { border-top: 4px solid #4f46e5; height: 100%; }
    .feature-card h3 { color: #4f46e5; margin-top: 0; }
    .footer { text-align: center; margin-top: 3rem; color: #6b7280; font-size: 0.875rem; }
    .status { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
    .status-label { color: #374151; }
    .status-value { font-weight: 500; }
    .status-online { color: #10b981; }
    .status-error { color: #ef4444; }
    .split-section { display: flex; align-items: center; gap: 2rem; margin: 2rem 0; }
    .split-box { flex: 1; text-align: center; padding: 1rem; border-radius: 0.5rem; font-weight: 700; }
    .needs { background: #93c5fd; color: #1e40af; }
    .invest { background: #a7f3d0; color: #065f46; }
    .save { background: #fde68a; color: #92400e; }
    
    @media (max-width: 768px) {
      .split-section { flex-direction: column; gap: 1rem; }
      .split-box { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Stackr Finance</h1>
    <div class="subtitle">The Ultimate Financial Tool for Service Providers</div>
  </div>
  
  <div class="card">
    <h2>Service Provider Finance Made Simple</h2>
    <p>Stackr helps you manage your finances with the proven 40/30/30 split system, optimized for service-based businesses:</p>
    
    <div class="split-section">
      <div class="split-box needs">40% Needs</div>
      <div class="split-box invest">30% Investments</div>
      <div class="split-box save">30% Savings</div>
    </div>
    
    <p>Our financial system is built specifically for service providers like locksmiths, plumbers, freelancers, and other professionals who need a simple but powerful way to manage variable income.</p>
  </div>
  
  <div class="card">
    <h2>System Status</h2>
    <div class="status">
      <span class="status-label">Direct HTML Server</span>
      <span class="status-value status-online">✓ Online</span>
    </div>
    <div class="status">
      <span class="status-label">Firebase Dependency</span>
      <span class="status-value status-online">✓ None (Complete Isolation)</span>
    </div>
    <div class="status">
      <span class="status-label">Standalone Mode</span>
      <span class="status-value status-online">✓ Active</span>
    </div>
  </div>
  
  <h2>Core Features</h2>
  <div class="grid">
    <div class="card feature-card">
      <h3>Income Hub</h3>
      <p>Track all your income sources with our customizable 40/30/30 split system. Adjust the ratios to suit your specific needs.</p>
    </div>
    <div class="card feature-card">
      <h3>Smart Budgeting</h3>
      <p>Our intelligent budget planner helps you allocate funds across categories based on your income split preferences.</p>
    </div>
    <div class="card feature-card">
      <h3>Goal Setting</h3>
      <p>Set financial goals and track your progress with visual indicators and smart recommendations.</p>
    </div>
    <div class="card feature-card">
      <h3>AI Financial Advice</h3>
      <p>Get personalized financial insights and recommendations based on your income, spending, and goals.</p>
    </div>
    <div class="card feature-card">
      <h3>Bank Integration</h3>
      <p>Connect your bank accounts securely to automatically track transactions and balances.</p>
    </div>
    <div class="card feature-card">
      <h3>Income Generation</h3>
      <p>Discover new opportunities to increase your service business revenue with our specialized tools.</p>
    </div>
  </div>
  
  <div class="footer">
    <p>&copy; 2025 Stackr Finance. All rights reserved.</p>
    <p>Direct HTML server on port ${port}</p>
  </div>
</body>
</html>`;

// Create an HTTP server that serves the static HTML
const server = http.createServer((req, res) => {
  // Set headers to prevent any cross-site issues
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'none'; style-src 'unsafe-inline';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Serve our HTML
  res.statusCode = 200;
  res.end(html);
});

// Start the server
server.listen(port, () => {
  console.log(`Direct HTML server running at http://localhost:${port}`);
  console.log(`This server is completely independent of the main app and has NO Firebase dependencies`);
});