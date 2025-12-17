import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      // Send token to backend admin login
      const resp = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Login failed');

      // Store a minimal user in localStorage so Navbar can show admin links
      localStorage.setItem('user', JSON.stringify({ name: data.user.name || user.displayName || 'Admin', role: 'admin', email: data.user.email }));
      alert('Logged in as admin');
      window.location.href = '/admin';
    } catch (e) {
      console.error('Admin sign-in failed', e);
      alert('Admin sign-in failed: ' + (e.message || e));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Login</h2>
      <p>Sign in with a Firebase account that has the admin role in the system.</p>
      <button onClick={signInWithGoogle} style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6 }}>Sign in with Google</button>
      <p style={{ marginTop: 12 }}>Note: backend also accepts `ADMIN_SECRET` for quick local access.</p>
    </div>
  );
}
