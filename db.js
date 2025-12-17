
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./areassist.db");

// Create table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      category TEXT,
      location TEXT,
      image_url TEXT,
      user_id INTEGER,
      latitude REAL,
      longitude REAL,
      resolved_image_url TEXT,
      volunteer_note TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Safe migrations when columns are missing
  db.run(`ALTER TABLE issues ADD COLUMN title TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN location TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN image_url TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN user_id INTEGER`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN latitude REAL`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN longitude REAL`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN resolved_image_url TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN volunteer_note TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN resolved_at DATETIME`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN image_verification_status TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN image_verification_confidence INTEGER`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN image_verification_report TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN image_verification_checks TEXT`, () => {});
  
  // New comprehensive verification columns
  db.run(`ALTER TABLE issues ADD COLUMN image_verification TEXT`, () => {});
  db.run(`ALTER TABLE issues ADD COLUMN resolution_verification TEXT`, () => {});

  db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'citizen',
      district TEXT,
      google_id TEXT UNIQUE,
      profile_picture TEXT,
      firebase_uid TEXT,
      email_verified BOOLEAN,
      phone_verified BOOLEAN,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Best-effort migration in case the table existed without new columns
  db.run(`ALTER TABLE users ADD COLUMN district TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN google_id TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN firebase_uid TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN profile_picture TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN email_verified BOOLEAN`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN phone_verified BOOLEAN`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN last_login DATETIME`, () => {});
  
  // OTP table for phone/email verification
  db.run(`CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      channel TEXT NOT NULL, -- 'phone' or 'email'
      destination TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // Volunteer-specific profile fields
  db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN skills TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN availability TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN experience TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN transportation TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN emergency_contact TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN emergency_phone TEXT`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE`, () => {});
    // Add verified flag for volunteers/admins
    db.run(`ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0`, () => {});

  // Create notifications table for communication between volunteers and citizens
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      issue_id INTEGER NOT NULL,
      volunteer_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'volunteer_update',
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (issue_id) REFERENCES issues(id),
      FOREIGN KEY (volunteer_id) REFERENCES users(id)
  )`);
});

module.exports = db;
