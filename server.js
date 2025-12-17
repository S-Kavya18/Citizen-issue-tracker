// Load environment variables from backend/.env regardless of CWD
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const issueRoutes = require("./routes/issues");
const feedbackRoutes = require("./routes/feedback");
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuth");
const firebaseAuthRoutes = require("./routes/firebaseAuth");
const volunteerRoutes = require("./routes/volunteers");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notifications");
const passport = require("./config/googleAuth");
const fs = require("fs");

const app = express();

// Configure CORS
// Removing redundant CORS configuration

const PORT = process.env.PORT || 5000;
// Fingerprint to verify the running instance & file freshness
const STARTUP_FINGERPRINT = Date.now();
console.log(`🆔 server.js loaded. Fingerprint: ${STARTUP_FINGERPRINT} | PID: ${process.pid} | File: ${__filename}`);

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


// Handle preflight requests safely (avoid path-to-regexp wildcard issue)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logger (after body parsing for visibility)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Error handling for JSON parsing
// app.use((err, req, res, next) => {
//  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//   console.error('JSON Parse Error:', err);
//   return res.status(400).json({ error: 'Invalid JSON format' });
//  }
//  next();
// });

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", require("express").static(uploadsDir));

// API Routes
app.use("/issues", issueRoutes);

// Pre-mount probe: verify authRoutes loaded successfully
console.log('🔍 Pre-mount probe: authRoutes type:', typeof authRoutes);
console.log('🔍 Pre-mount probe: authRoutes.stack length:', authRoutes?.stack?.length || 'NO_STACK');
if (authRoutes?.stack) {
  authRoutes.stack.forEach((layer, i) => {
    if (layer.route) {
      console.log(`  Route ${i}: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
    }
  });
} else {
  console.warn('⚠️  authRoutes has no stack - module may have failed to load properly');
}

app.use("/auth", authRoutes);
app.use("/firebase-auth", firebaseAuthRoutes); // Firebase auth routes
app.use("/volunteers", volunteerRoutes);
app.use("/api/feedback", feedbackRoutes);
console.log('🔌 Mounted feedback routes at /api/feedback');
app.use("/admin", adminRoutes);
console.log('🔌 Mounted admin routes at /admin');
app.use("/notifications", notificationRoutes);

// Ultra-simple fingerprint route (add before debug enumerator & 404)
app.get('/debug/fingerprint', (req, res) => {
  res.json({
    fingerprint: STARTUP_FINGERPRINT,
    pid: process.pid,
    uptime_sec: process.uptime().toFixed(1),
    file: __filename,
    envPort: process.env.PORT || null,
    node: process.version
  });
});

// Debug: list all registered routes (non-production convenience)
app.get('/debug/routes', (req, res) => {
  try {
    const routes = [];
    const stack = app._router && app._router.stack ? app._router.stack : [];
    stack.forEach(layer => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods)
          .filter(m => layer.route.methods[m])
          .map(m => m.toUpperCase());
        routes.push({ path: layer.route.path, methods });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        layer.handle.stack.forEach(r => {
          if (r.route && r.route.path) {
            const methods = Object.keys(r.route.methods)
              .filter(m => r.route.methods[m])
              .map(m => m.toUpperCase());
            const prefix = layer.regexp && layer.regexp.source ? extractMountPath(layer.regexp) : '';
            routes.push({ path: prefix + r.route.path, methods });
          }
        });
      }
    });
    res.json({ count: routes.length, routes });
  } catch (e) {
    res.status(500).json({ error: 'Failed to enumerate routes', details: e.message });
  }
});

function extractMountPath(regexp) {
  // Convert something like ^\\/api\\/auth\\/?$ into /api/auth
  try {
    let out = regexp.source
      .replace('^', '')
      .replace('\\/?$', '')
      .replace(/\\/g, '')
      .replace(/\(\?:\(\?=\)|\)/g, '')
      .replace(/\(\?=\)/g, '')
      .replace(/\(\?!.*\)/g, '')
      .replace(/\^/g, '');
    if (!out.startsWith('/')) out = '/' + out;
    return out;
  } catch { return ''; }
}

// Utility: log all registered routes at startup for debugging
function logRegisteredRoutes() {
  try {
    const rows = [];
    const stack = app._router?.stack || [];
    console.log('🔍 Debug: app._router exists:', !!app._router);
    console.log('🔍 Debug: stack length:', stack.length);
    
    stack.forEach((layer, index) => {
      try {
        console.log(`🔍 Debug: Layer ${index} - name: ${layer.name}, route: ${!!layer.route}`);
        if (layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods || {}).filter(m=>layer.route.methods[m]).map(m=>m.toUpperCase());
          rows.push({ path: layer.route.path, methods });
        } else if (layer.name === 'router' && layer.handle?.stack) {
          const prefix = layer.regexp && layer.regexp.source ? extractMountPath(layer.regexp) : '';
          console.log(`🔍 Debug: Router layer with prefix: "${prefix}", subroutes: ${layer.handle.stack.length}`);
          layer.handle.stack.forEach((r, ri) => {
            try {
              if (r.route && r.route.path) {
                const methods = Object.keys(r.route.methods || {}).filter(m=>r.route.methods[m]).map(m=>m.toUpperCase());
                const fullPath = (prefix + r.route.path).replace(/\/\/+/, '/');
                rows.push({ path: fullPath, methods });
                console.log(`🔍 Debug: Subroute ${ri}: ${methods.join(',')} ${fullPath}`);
              }
            } catch (subErr) {
              console.warn(`🔍 Debug: Error processing subroute ${ri}:`, subErr.message);
            }
          });
        }
      } catch (layerErr) {
        console.warn(`🔍 Debug: Error processing layer ${index}:`, layerErr.message);
      }
    });
    console.log('🔎 Registered Routes (' + rows.length + '):');
    rows.forEach(r => console.log('  ', r.methods.join(','), r.path));
  } catch (e) {
    console.error('💥 Route enumeration failed:', e.message);
    console.error('💥 Stack trace:', e.stack);
  }
}

// More defensive alternative: enumerate routes even if app._router is falsy
function logRegisteredRoutesRobust() {
  try {
    const rows = [];
    const router = app._router || null;
    if (!router) {
      console.log('🔍 Robust Debug: app._router is not set. Attempting to inspect app._router via internal properties...');
    }

    const stack = (router && router.stack) || [];
    console.log('🔍 Robust Debug: stack length:', stack.length);

    function processLayer(layer, prefix = '') {
      if (!layer) return;
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods || {}).filter(m => layer.route.methods[m]).map(m => m.toUpperCase());
        rows.push({ path: prefix + layer.route.path, methods });
      } else if (layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
        const mount = (layer.regexp && extractMountPath(layer.regexp)) || '';
        layer.handle.stack.forEach(l => processLayer(l, prefix + mount));
      }
    }

    stack.forEach(l => processLayer(l, ''));

    console.log('🔎 Robust Registered Routes (' + rows.length + '):');
    rows.forEach(r => console.log('  ', (r.methods || []).join(','), r.path));
    if (rows.length === 0) console.log('⚠️  No routes discovered by robust enumerator. Routes may be mounted dynamically or via other processes.');
  } catch (e) {
    console.error('💥 Robust route enumeration failed:', e.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Handle specific errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404s
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`
🚀 Server running at http://localhost:${port}
📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
🔒 Session Secret: ${process.env.SESSION_SECRET ? 'Set' : 'Default'}
  `);
  logRegisteredRoutes();
});
