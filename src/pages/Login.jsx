
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";

// Input style for all fields
const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #bcdffb",
  fontSize: 16,
  fontWeight: 500,
  outline: "none",
  background: "#f7fbff",
  color: "#2d6cdf",
  boxShadow: "0 2px 8px rgba(44,62,80,0.07)",
  transition: "border 0.2s, box-shadow 0.2s"
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      alert(`Authentication failed: ${error}`);
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Admins go to admin dashboard; volunteers may need profile setup
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === "volunteer" && (!userData.profile_completed && !userData.district)) {
          navigate("/volunteer/profile-setup");
        } else {
          navigate(userData.role === "volunteer" ? "/volunteer/dashboard" : "/dashboard");
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        alert('Authentication failed');
      }
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Backend email/password login only
    let res;
    let data = {};
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch (networkErr) {
      alert("Network error reaching backend. Ensure server is running on port 5000.");
      return;
    }
    try {
      data = await res.json();
    } catch { /* ignore parse error */ }

    if (res.status === 404) {
      alert("Backend login route not found (404). Restart backend or check reverse proxy.");
      return;
    }
    if (res.status === 400 && data?.error === 'Account uses federated login. Use Google sign-in.') {
      alert("This account was created with Google. Use the Google sign-in button.");
      return;
    }
    if (res.status === 400 && data?.error === 'User not found') {
      // Auto-register then retry login
      try {
        const displayName = email.split('@')[0];
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: displayName, email, password, role: 'citizen' })
        });
        const regData = await regRes.json().catch(() => ({}));
        if (!regRes.ok) {
          alert(regData.error || 'Registration failed');
          return;
        }
        // Retry login
        const retryRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const retryData = await retryRes.json().catch(() => ({}));
          if (retryRes.ok && retryData.token) {
          localStorage.setItem('token', retryData.token);
          localStorage.setItem('user', JSON.stringify(retryData.user));
          if (retryData.user?.role === 'admin') {
            navigate('/admin');
          } else if (retryData.user?.role === 'volunteer' && (!retryData.user.profile_completed && !retryData.user.district)) {
            navigate('/volunteer/profile-setup');
          } else {
            navigate(retryData.user?.role === 'volunteer' ? '/volunteer/dashboard' : '/dashboard');
          }
          return;
        }
        alert(retryData.error || 'Login failed after registration');
        return;
      } catch (autoErr) {
        alert('Auto-registration failed. Please try again.');
        return;
      }
    }
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Redirect admin users to admin dashboard; others to profile
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else if (data.user?.role === 'volunteer' && (!data.user.profile_completed && !data.user.district)) {
        navigate('/volunteer/profile-setup');
      } else {
        navigate('/profile');
      }
    } else {
      alert(data.error || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🚀 Login: Starting Google authentication...');
      
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        console.log('✅ Login: Google auth successful, checking role selection...');
        
        // Check if user needs role selection
        const roleCheckResult = await authService.checkRoleSelection(result.firebaseUser);
        
        if (roleCheckResult.success) {
          if (roleCheckResult.needsRoleSelection) {
            console.log('🎯 User needs role selection, redirecting to role selection page...');
            // Redirect to role selection page
            navigate('/role-selection', { 
              state: { 
                userData: result.user, 
                firebaseUser: result.firebaseUser 
              } 
            });
          } else {
            console.log('✅ Existing user, syncing with backend...');
            // Existing user, sync with backend
            const syncResult = await authService.syncUserWithBackend(result.firebaseUser);
            
            if (syncResult.success) {
              console.log('✅ Login: Backend sync successful, redirecting...');
              localStorage.setItem("token", syncResult.data.token);
              localStorage.setItem("user", JSON.stringify(syncResult.data.user));
              // Redirect admin users to admin dashboard
              if (syncResult.data.user?.role === 'admin') {
                navigate('/admin');
              } else if (syncResult.data.user?.role === 'volunteer' && (!syncResult.data.user.profile_completed && !syncResult.data.user.district)) {
                navigate('/volunteer/profile-setup');
              } else {
                navigate('/profile');
              }
            } else {
              console.error('❌ Login: Backend sync failed:', syncResult.error);
              alert(syncResult.error || "Failed to sync with backend");
            }
          }
        } else {
          console.error('❌ Login: Role check failed:', roleCheckResult.error);
          alert(roleCheckResult.error || "Failed to check user status");
        }
      } else {
        console.error('❌ Login: Google auth failed:', result.error);
        // Don't show alert for cancelled popup - it's user choice
        if (result.error && !result.error.includes('cancelled') && !result.error.includes('blocked')) {
          alert(result.error);
        }
      }
    } catch (error) {
      console.error('❌ Login: Unexpected error:', error);
      // Only show alert for unexpected errors
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        alert("Google sign-in failed. Please try again.");
      }
    }
  };



  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(44,62,80,0.13)", padding: "40px 32px", maxWidth: 400, width: "100%", margin: "32px 0" }}>
        <h2 style={{ textAlign: "center", color: "#2d6cdf", fontWeight: 800, fontSize: 32, marginBottom: 24 }}>Login</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={inputStyle} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          <button type="submit" style={{
            background: "linear-gradient(90deg, #2d6cdf 0%, #4bb1f6 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 18,
            padding: "14px 0",
            boxShadow: "0 2px 8px rgba(44,62,80,0.10)",
            cursor: "pointer",
            marginTop: 8,
            transition: "background 0.2s"
          }}>Login</button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
          <span style={{ padding: "0 16px", color: "#6b7280", fontSize: 14, fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "#fff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            padding: "14px 0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "all 0.2s",
            width: "100%"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#9ca3af";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* New User Registration Links */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
            New to AreaAssist? Choose how you'd like to join:
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="/citizen/register"
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "#f0f9ff",
                color: "#2563eb",
                textDecoration: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                border: "1px solid #bfdbfe",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#dbeafe";
                e.currentTarget.style.borderColor = "#93c5fd";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f0f9ff";
                e.currentTarget.style.borderColor = "#bfdbfe";
              }}
            >
              👥 Join as Citizen
            </a>
            <a
              href="/volunteer/register"
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "#f0fdf4",
                color: "#16a34a",
                textDecoration: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                border: "1px solid #bbf7d0",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#dcfce7";
                e.currentTarget.style.borderColor = "#86efac";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#bbf7d0";
              }}
            >
              🤝 Join as Volunteer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


