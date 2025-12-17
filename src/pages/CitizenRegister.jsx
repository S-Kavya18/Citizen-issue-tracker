import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

const CitizenRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      console.log('🔥 Firebase user:', firebaseUser);

      // Automatically set role as citizen and sync with backend
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch('/api/firebase-auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          selectedRole: 'citizen' // Automatically set as citizen
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Citizen registration successful:', data);
        
        // Store user data and token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to citizen dashboard
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        console.error('❌ Registration failed:', errorData);
        alert(errorData.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('❌ Google Sign-up error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert("Sign-up was cancelled. Please try again.");
      } else {
        alert("An error occurred during sign-up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(44,62,80,0.13)",
    padding: "40px 32px",
    maxWidth: 500,
    width: "100%",
    margin: "32px 0",
    textAlign: "center"
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #2d6cdf 0%, #4bb1f6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 16,
    padding: "16px 32px",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    marginTop: 24,
    minWidth: 280,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    opacity: isLoading ? 0.7 : 1
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
      padding: "20px"
    }}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👥</div>
          <h2 style={{ 
            color: "#2d6cdf", 
            fontWeight: 800, 
            fontSize: 32, 
            marginBottom: 8 
          }}>
            Join as a Citizen
          </h2>
          <p style={{ 
            color: "#6b7280", 
            fontSize: 16, 
            lineHeight: 1.5 
          }}>
            Start reporting issues and tracking progress in your community
          </p>
        </div>

        {/* Benefits */}
        <div style={{ 
          background: "#f8fafc", 
          borderRadius: 12, 
          padding: 24, 
          marginBottom: 32,
          textAlign: "left" 
        }}>
          <h4 style={{ 
            color: "#374151", 
            marginBottom: 16, 
            textAlign: "center" 
          }}>
            As a citizen, you can:
          </h4>
          <ul style={{ 
            color: "#6b7280", 
            fontSize: 14,
            lineHeight: 1.6,
            paddingLeft: 20,
            margin: 0
          }}>
            <li>📸 Report community issues with photos and descriptions</li>
            <li>📍 Track the status and progress of your reports</li>
            <li>🔔 Receive notifications when your issues are being addressed</li>
            <li>👀 View all community issues and their current status</li>
            <li>💬 Provide feedback on resolved issues</li>
            <li>📊 See community improvement statistics</li>
          </ul>
        </div>

        {/* Sign Up Button */}
        <button
          style={buttonStyle}
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div style={{ 
                width: 20, 
                height: 20, 
                border: "2px solid transparent",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Setting up your account...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Footer */}
        <div style={{ marginTop: 32 }}>
          <p style={{ 
            color: "#9ca3af", 
            fontSize: 14, 
            marginBottom: 16 
          }}>
            Already have an account?{" "}
            <Link 
              to="/login" 
              style={{ 
                color: "#2d6cdf", 
                textDecoration: "none", 
                fontWeight: 600 
              }}
            >
              Sign in here
            </Link>
          </p>
          
          <p style={{ 
            color: "#9ca3af", 
            fontSize: 12, 
            marginTop: 16 
          }}>
            Want to help solve issues instead?{" "}
            <Link 
              to="/volunteer/register" 
              style={{ 
                color: "#059669", 
                textDecoration: "none", 
                fontWeight: 600 
              }}
            >
              Join as a Volunteer
            </Link>
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CitizenRegister;