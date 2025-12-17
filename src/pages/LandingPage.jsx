import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      {/* Hero Section */}
      <section style={{
        position: "relative",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          zIndex: 1,
        }} />
        
        <div style={{ 
          position: "relative", 
          zIndex: 2, 
          padding: 40, 
          borderRadius: 24, 
          boxShadow: "0 8px 32px rgba(44,62,180,0.12)", 
          background: "rgba(255,255,255,0.45)", 
          maxWidth: 800, 
          margin: "0 auto" 
        }}>
          <h1 style={{ 
            fontSize: 48, 
            margin: 0, 
            fontWeight: 800, 
            color: "#2563eb", 
            letterSpacing: "1px" 
          }}>
            Welcome to AreaAssist
          </h1>
          <p style={{ 
            fontSize: 22, 
            marginTop: 18, 
            color: "#1e40af", 
            fontWeight: 500,
            lineHeight: 1.4
          }}>
            Building stronger communities through collaboration.<br/>
            Choose how you want to participate:
          </p>
        </div>
      </section>

      {/* Role Selection Cards */}
      <section style={{ 
        padding: "60px 16px", 
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 40,
        }}>
          {/* Citizen Card */}
          <div style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 20,
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(44,62,80,0.15)",
            transition: "transform 0.3s ease",
            border: "2px solid transparent"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>👥</div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: "#2563eb", 
              marginBottom: 16 
            }}>
              I'm a Citizen
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: "#6b7280", 
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              I live or work in this area and want to report issues, track their progress, 
              and stay informed about what's happening in my community.
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: "#374151", marginBottom: 12 }}>What you can do:</h4>
              <ul style={{ 
                textAlign: "left", 
                color: "#6b7280", 
                fontSize: 14,
                lineHeight: 1.5,
                paddingLeft: 20
              }}>
                <li>📸 Report community issues with photos</li>
                <li>📍 Track the status of your reports</li>
                <li>🔔 Get notified when issues are resolved</li>
                <li>👀 View all community issues and their progress</li>
                <li>💬 Provide feedback on resolved issues</li>
              </ul>
            </div>
            
            <Link 
              to="/citizen/register" 
              style={{
                display: "inline-block",
                padding: "16px 32px",
                background: "linear-gradient(90deg, #2d6cdf 0%, #4bb1f6 100%)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                boxShadow: "0 4px 16px rgba(45, 108, 223, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              Join as Citizen
            </Link>
          </div>

          {/* Volunteer Card */}
          <div style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 20,
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(44,62,80,0.15)",
            transition: "transform 0.3s ease",
            border: "2px solid transparent"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🤝</div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: "#2563eb", 
              marginBottom: 16 
            }}>
              I'm a Volunteer
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: "#6b7280", 
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              I want to help solve community problems, coordinate with other volunteers, 
              and make a positive impact in my neighborhood.
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: "#374151", marginBottom: 12 }}>What you can do:</h4>
              <ul style={{ 
                textAlign: "left", 
                color: "#6b7280", 
                fontSize: 14,
                lineHeight: 1.5,
                paddingLeft: 20
              }}>
                <li>🎯 Get assigned to issues that need help</li>
                <li>🔧 Work on resolving community problems</li>
                <li>📋 Update progress on active issues</li>
                <li>👥 Coordinate with other volunteers</li>
                <li>⭐ Build your volunteer reputation</li>
              </ul>
            </div>
            
            <Link 
              to="/volunteer/register" 
              style={{
                display: "inline-block",
                padding: "16px 32px",
                background: "linear-gradient(90deg, #059669 0%, #10b981 100%)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                boxShadow: "0 4px 16px rgba(5, 150, 105, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              Join as Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: "60px 16px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 800, 
            color: "#2563eb", 
            marginBottom: 16 
          }}>
            How AreaAssist Works
          </h2>
          <p style={{ 
            fontSize: 18, 
            color: "#6b7280", 
            marginBottom: 40,
            maxWidth: 600,
            margin: "0 auto 40px"
          }}>
            A simple process that brings citizens and volunteers together to solve community issues
          </p>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 30,
            marginTop: 40
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
              <h3 style={{ color: "#374151", fontWeight: 700, marginBottom: 8 }}>1. Report Issue</h3>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Citizens report problems with photos and descriptions</p>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
              <h3 style={{ color: "#374151", fontWeight: 700, marginBottom: 8 }}>2. Volunteer Responds</h3>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Volunteers are notified and take action</p>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ color: "#374151", fontWeight: 700, marginBottom: 8 }}>3. Issue Resolved</h3>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Progress is tracked and everyone is notified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Existing User Section */}
      <section style={{ 
        padding: "40px 16px", 
        background: "#1e40af",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h3 style={{ 
            color: "#fff", 
            fontSize: 24, 
            fontWeight: 700, 
            marginBottom: 16 
          }}>
            Already have an account?
          </h3>
          <Link 
            to="/login" 
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 8,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.3)",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
          >
            Sign In Here
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;