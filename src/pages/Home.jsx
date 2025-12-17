import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [recentIssues, setRecentIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((rows) => setRecentIssues(rows.slice(0, 3)))
      .catch(() => setRecentIssues([]));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          color: "#2563eb",
          minHeight: 460,
          width: "100%",         // take full width of parent
  maxWidth: "100%",
          margin: 0, 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
            zIndex: 1,
          }} />
          <div style={{ position: "relative", zIndex: 2, padding: 40, borderRadius: 24, boxShadow: "0 8px 32px rgba(44,62,180,0.12)", background: "rgba(255,255,255,0.45)", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <h1 style={{ fontSize: 48, margin: 0, fontWeight: 800, color: "#2563eb", letterSpacing: "1px" }}>
                Build a Better Neighborhood, Together.
              </h1>
              <p style={{ fontSize: 20, marginTop: 18, color: "#1e40af", fontWeight: 500 }}>
                AreaAssist connects you with local volunteers to quickly resolve community issues. Report a problem,
                track its progress, and see the change.
              </p>
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              {(() => {
                let user = null;
                try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { user = null; }
                if (user && user.role === "citizen") {
                  return (
                    <button onClick={() => navigate("/add-issue")}
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(90deg, #2d6cdf 0%, #4bb1f6 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 18,
                        boxShadow: "0 2px 8px rgba(44,62,80,0.10)",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >Report an Issue</button>
                  );
                }
                return null;
              })()}
              {(() => {
                let user = null;
                try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { user = null; }
                if (!user) {
                  return (
                    <Link to="/"
                      style={{
                        padding: "14px 28px",
                        background: "#fff",
                        color: "#2d6cdf",
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 18,
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(44,62,80,0.10)",
                        border: "2px solid #2d6cdf"
                      }}
                    >Get Started</Link>
                  );
                }
                return (
                  <Link to="/issues"
                    style={{
                      padding: "14px 28px",
                      background: "#fff",
                      color: "#2d6cdf",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 18,
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(44,62,80,0.10)",
                      border: "2px solid #2d6cdf"
                    }}
                  >View Community Issues</Link>
                );
              })()}
            </div>
          </div>
      </section>

      {/* How it works */}
  <section style={{ padding: "48px 16px", background: "#e3eafc" }}>
  <h2 style={{ textAlign: "center", fontSize: 40, marginBottom: 16, color: "#2563eb", fontWeight: 800 }}>How It Works</h2>
  <p style={{ textAlign: "center", color: "#1e40af", marginBottom: 36, fontSize: 18 }}>
          A simple three-step process to improve your community.
        </p>
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          <img src={process.env.PUBLIC_URL + '/iStock-697438336.jpg'} alt="card-bg" style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 220, opacity: 0.13, pointerEvents: "none", zIndex: 0 }} />
          <img src={process.env.PUBLIC_URL + '/iStock-697438336.jpg'} alt="card-bg" style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 220, opacity: 0.13, pointerEvents: "none", zIndex: 0 }} />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            position: "relative",
            zIndex: 1
          }}>
            <Card title="Submit an Issue" desc="Snap a photo and describe a problem in your area." icon="🎯" />
            <Card title="Volunteer Assigned" desc="A local volunteer is notified and assigned to your issue." icon="🤝" />
            <Card title="Track & Resolve" desc="Follow the progress in real-time and get notified when it’s resolved." icon="✅" />
          </div>
        </div>
      </section>

      {/* From Your Community */}
  <section style={{ padding: "48px 16px", background: "#f3f8fd" }}>
  <h2 style={{ textAlign: "center", fontSize: 40, marginBottom: 16, color: "#2563eb", fontWeight: 800 }}>From Your Community</h2>
  <p style={{ textAlign: "center", color: "#1e40af", marginBottom: 28, fontSize: 18 }}>
          See what issues your neighbors are reporting and tracking.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 1100,
          margin: "0 auto",
        }}>
          {recentIssues.map((i) => (
            <IssueCard key={i.id} issue={i} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/issues" style={{ padding: "14px 28px", borderRadius: 12, background: "#fff", textDecoration: "none", color: "#2d6cdf", fontWeight: 700, fontSize: 18, boxShadow: "0 2px 8px rgba(44,62,80,0.10)", border: "2px solid #2d6cdf" }}>
            View All Community Issues
          </Link>
        </div>
      </section>
    </div>
  );
}

const Card = ({ title, desc, icon }) => {
  return (
    <div style={{ position: "relative", background: "rgba(255,255,255,0.85)", borderRadius: 18, padding: 32, boxShadow: "0 4px 24px rgba(44,62,80,0.10)", textAlign: "center", overflow: "hidden" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 10, color: "#2d6cdf" }}>{title}</div>
        <div style={{ color: "#566", fontSize: 17 }}>{desc}</div>
      </div>
    </div>
  );
}

const IssueCard = ({ issue }) => {
  return (
    <div style={{ background: "rgba(255,255,255,0.85)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(44,62,80,0.10)" }}>
      
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#2d6cdf" }}>{issue.title}</div>
        <div style={{ color: "#566", marginTop: 6, fontSize: 16 }}>{issue.category}</div>
        <div style={{ color: "#566", marginTop: 6, fontSize: 16 }}>📍 {issue.location}</div>
        <div style={{ marginTop: 14, display: "inline-block", padding: "6px 16px", borderRadius: 14, fontWeight: 700, fontSize: 15, background: issue.status === "Resolved" ? "#c8f5d2" : issue.status === "In Progress" ? "#e3efff" : "#fff3cd", color: issue.status === "Resolved" ? "#2f6f44" : issue.status === "In Progress" ? "#2d6cdf" : "#b59f3b" }}>
          {issue.status}
        </div>
      </div>
    </div>
  );
}
export default Home;
