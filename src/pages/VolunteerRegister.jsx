import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

const VolunteerRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // Configure Google provider
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        login_hint: 'user@example.com'
      });
      
      // Add scopes for better profile data
      provider.addScope('profile');
      provider.addScope('email');

      console.log('🔥 Initiating Google Sign In...');
      const result = await signInWithPopup(auth, provider);
      
      // Get user and token
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken(true); // Force token refresh

      console.log('✅ Firebase authentication successful')

      console.log('🔄 Syncing with backend...');
      
      // Prepare user data
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        emailVerified: firebaseUser.emailVerified,
        selectedRole: 'volunteer'
      };

      // Sync with backend
      const response = await fetch('/api/firebase-auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(userData)
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend sync failed:', errorData);
        throw new Error(errorData.error || errorData.details || 'Registration failed');
      }

      // Parse response
      const data = await response.json();
      
      if (!data || !data.token || !data.user) {
        console.error('❌ Invalid response data:', data);
        throw new Error('Invalid response from server');
      }

      console.log('✅ Registration successful, saving data...');
      
      // Clear any existing data
      localStorage.clear();
      
      // Store new authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        idToken, // Store Firebase token for future API calls
        lastLogin: new Date().toISOString()
      }));
      
      console.log('💡 Redirecting to profile setup...');
      // Redirect with a slight delay to ensure storage is complete
      setTimeout(() => {
        navigate('/volunteer/profile-setup');
      }, 100);
    
    } catch (error) {
      console.error('❌ Registration error:', error);
      let errorMessage = "Registration failed. Please try again.";
      let clearStorage = true;
      
      // Handle Firebase Auth errors
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Sign-up was cancelled. Please try again.";
            clearStorage = false;
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many attempts. Please try again later.";
            break;
          case 'auth/user-token-expired':
            errorMessage = "Your session has expired. Please try again.";
            break;
          case 'auth/popup-blocked':
            errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
            clearStorage = false;
            break;
          default:
            errorMessage = "Authentication error. Please try again.";
        }
      }
      // Handle backend errors
      else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error to user
      alert(errorMessage);
      
      // Clear storage if needed
      if (clearStorage) {
        console.log('🧹 Clearing stored data...');
        localStorage.clear();
      }
      
      // Log out of Firebase if needed
      if (error.code && error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/popup-blocked') {
        try {
          await auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
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
    background: "linear-gradient(90deg, #059669 0%, #10b981 100%)",
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
      background: "linear-gradient(120deg, #ecfdf5 0%, #d1fae5 100%)",
      padding: "20px"
    }}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🤝</div>
          <h2 style={{ 
            color: "#059669", 
            fontWeight: 800, 
            fontSize: 32, 
            marginBottom: 8 
          }}>
            Join as a Volunteer
          </h2>
          <p style={{ 
            color: "#6b7280", 
            fontSize: 16, 
            lineHeight: 1.5 
          }}>
            Help solve community issues and make a positive impact
          </p>
        </div>

        {/* Benefits */}
        <div style={{ 
          background: "#f0fdf4", 
          borderRadius: 12, 
          padding: 24, 
          marginBottom: 32,
          textAlign: "left",
          border: "1px solid #bbf7d0"
        }}>
          <h4 style={{ 
            color: "#374151", 
            marginBottom: 16, 
            textAlign: "center" 
          }}>
            As a volunteer, you can:
          </h4>
          <ul style={{ 
            color: "#6b7280", 
            fontSize: 14,
            lineHeight: 1.6,
            paddingLeft: 20,
            margin: 0
          }}>
            <li>🎯 Get assigned to issues that match your skills and location</li>
            <li>🔧 Work on resolving community problems that matter</li>
            <li>📋 Update progress and communicate with issue reporters</li>
            <li>👥 Coordinate with other volunteers on larger projects</li>
            <li>⭐ Build your volunteer reputation and impact score</li>
            <li>📊 Track your contributions and community impact</li>
          </ul>
        </div>

        {/* Volunteer Commitment */}
        <div style={{ 
          background: "#fef3c7", 
          borderRadius: 12, 
          padding: 20, 
          marginBottom: 32,
          border: "1px solid #fde68a"
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>💪</div>
          <p style={{ 
            color: "#92400e", 
            fontSize: 14,
            lineHeight: 1.5,
            margin: 0,
            fontWeight: 600
          }}>
            <strong>Ready to make a difference?</strong><br/>
            Volunteers are the heart of our community. Your time and skills help solve real problems and bring neighbors together.
          </p>
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
                color: "#059669", 
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
            Want to report issues instead?{" "}
            <Link 
              to="/citizen/register" 
              style={{ 
                color: "#2d6cdf", 
                textDecoration: "none", 
                fontWeight: 600 
              }}
            >
              Join as a Citizen
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

export default VolunteerRegister;