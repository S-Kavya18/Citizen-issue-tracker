import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from location state
  const userData = location.state?.userData;
  const firebaseUser = location.state?.firebaseUser;

  if (!userData || !firebaseUser) {
    // If no user data, redirect to login
    navigate("/login");
    return null;
  }

  const handleRoleSelection = async (role) => {
    setIsSubmitting(true);
    
    try {
      console.log('🎯 Role selected:', role);
      console.log('👤 User data:', userData);
      
      // Sync with backend using the selected role
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
          selectedRole: role // Pass the selected role
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Role selection successful:', data);
        
        // Store user data and token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on selected role
        if (role === 'volunteer') {
          navigate("/volunteer/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Role selection failed:', errorData);
        alert(errorData.error || "Failed to set role. Please try again.");
      }
    } catch (error) {
      console.error('❌ Role selection error:', error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  const roleCardStyle = {
    border: "2px solid #e5e7eb",
    borderRadius: 16,
    padding: "24px",
    margin: "16px 0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#f9fafb"
  };

  const selectedRoleCardStyle = {
    ...roleCardStyle,
    border: "2px solid #2d6cdf",
    background: "#f0f9ff",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(45, 108, 223, 0.15)"
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #2d6cdf 0%, #4bb1f6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 18,
    padding: "16px 32px",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: 24,
    minWidth: 200
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)" 
    }}>
      <div style={cardStyle}>
        <h2 style={{ 
          color: "#2d6cdf", 
          fontWeight: 800, 
          fontSize: 32, 
          marginBottom: 16 
        }}>
          Choose Your Role
        </h2>
        
        <p style={{ 
          color: "#6b7280", 
          fontSize: 16, 
          marginBottom: 32,
          lineHeight: 1.5 
        }}>
          Welcome, <strong>{userData.displayName}</strong>! Please select your role to continue.
        </p>

        <div style={{ marginBottom: 24 }}>
          <div 
            style={selectedRole === 'citizen' ? selectedRoleCardStyle : roleCardStyle}
            onClick={() => setSelectedRole('citizen')}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>👥</div>
            <h3 style={{ 
              color: "#374151", 
              fontWeight: 700, 
              fontSize: 20, 
              marginBottom: 8 
            }}>
              Citizen
            </h3>
            <p style={{ 
              color: "#6b7280", 
              fontSize: 14, 
              lineHeight: 1.4 
            }}>
              Report issues, track progress, and stay informed about your community.
            </p>
          </div>

          <div 
            style={selectedRole === 'volunteer' ? selectedRoleCardStyle : roleCardStyle}
            onClick={() => setSelectedRole('volunteer')}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>🤝</div>
            <h3 style={{ 
              color: "#374151", 
              fontWeight: 700, 
              fontSize: 20, 
              marginBottom: 8 
            }}>
              Volunteer
            </h3>
            <p style={{ 
              color: "#6b7280", 
              fontSize: 14, 
              lineHeight: 1.4 
            }}>
              Help resolve issues, coordinate with other volunteers, and make a difference.
            </p>
          </div>
        </div>

        <button
          style={{
            ...buttonStyle,
            opacity: selectedRole ? 1 : 0.5,
            cursor: selectedRole && !isSubmitting ? "pointer" : "not-allowed"
          }}
          onClick={() => selectedRole && handleRoleSelection(selectedRole)}
          disabled={!selectedRole || isSubmitting}
        >
          {isSubmitting ? "Setting up..." : "Continue"}
        </button>

        <p style={{ 
          color: "#9ca3af", 
          fontSize: 12, 
          marginTop: 16 
        }}>
          You can change your role later in your profile settings.
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;

