import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [authVersion, setAuthVersion] = useState(0);
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { user = null; }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthVersion((v) => v + 1);
    navigate("/login");
  };

  return (
    <nav style={{
      background: "#fff",
      borderRadius: 0,
      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
      margin: 0,
      width: "280px",
      height: "100vh",
      padding: "20px 0",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 1000,
      borderRight: "1px solid #e5e7eb"
    }}>
      <ul className="navbar-right" style={{ display: "flex", listStyle: "none", gap: "8px", margin: 0, padding: "0 20px", alignItems: "stretch", minHeight: "auto", justifyContent: "flex-start", flexDirection: "column" }}>
        <li style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <Link to={user ? (user.role === 'volunteer' ? '/volunteer/dashboard' : '/dashboard') : '/'} style={{ display: 'flex', alignItems: 'center', gap: 12, color: "#1f2937", textDecoration: "none", fontWeight: 700, fontSize: 20, letterSpacing: 0.5 }}>
            <img src={process.env.PUBLIC_URL + '/iStock-697438336.jpg'} alt="AreaAssist Logo" style={{ height: 36, width: 36, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', background: '#fff' }} />
            AreaAssist
          </Link>
        </li>
        <li><Link to="/feedback" style={{ color: "#374151", textDecoration: "none", fontWeight: 500, fontSize: 16, padding: "12px 16px", borderRadius: 8, transition: "all 0.2s", display: "block" }} onMouseOver={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>Feedback</Link></li>
        <li><Link to="/issues" style={{ color: "#374151", textDecoration: "none", fontWeight: 500, fontSize: 16, padding: "12px 16px", borderRadius: 8, transition: "all 0.2s", display: "block" }} onMouseOver={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>Community</Link></li>
        {user && user.role === 'admin' && (
          <li><Link to="/admin" style={{ color: "#374151", textDecoration: "none", fontWeight: 500, fontSize: 16, padding: "12px 16px", borderRadius: 8, transition: "all 0.2s", display: "block" }} onMouseOver={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>Admin</Link></li>
        )}
        {(user && user.role === 'citizen') && (
          <li><Link to="/add-issue" style={{ color: "#374151", textDecoration: "none", fontWeight: 500, fontSize: 16, padding: "12px 16px", borderRadius: 8, transition: "all 0.2s", display: "block" }} onMouseOver={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>Submit Issue</Link></li>
        )}
        <li style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
          {user ? (
            <div style={{ position: "relative" }}>
              <details style={{ display: "block" }}>
                <summary style={{ listStyle: "none", cursor: "pointer", color: "#374151", fontWeight: 500, fontSize: 16, borderRadius: 8, padding: "12px 16px", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12, width: "100%" }} onMouseOver={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2)"
                  }}>
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                  {user.name}
                </summary>
                <div style={{ position: "relative", background: "#f9fafb", color: "#374151", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                  <Link to="/profile" style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "#374151", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #e5e7eb", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e5e7eb"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>👤 My Profile</Link>
                  {user.role !== 'volunteer' && (
                    <Link to="/dashboard" style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "#374151", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #e5e7eb", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e5e7eb"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Dashboard</Link>
                  )}
                  {user.role !== 'volunteer' && (
                    <Link to="/submit-issue" style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "#374151", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #e5e7eb", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e5e7eb"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Submit Issue</Link>
                  )}
                  <Link to="/issues" style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "#374151", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #e5e7eb", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e5e7eb"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Community</Link>
                  {user.role === "volunteer" && (
                    <Link to="/volunteer/dashboard" style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "#374151", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #e5e7eb", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#e5e7eb"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Volunteer</Link>
                  )}
                  <button onClick={logout} style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "transparent", border: 0, cursor: "pointer", color: "#dc2626", fontWeight: 500, fontSize: 14, transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#fef2f2"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Log out</button>
                </div>
              </details>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/login" style={{ color: "#374151", textDecoration: "none", fontWeight: 500, fontSize: 16, padding: "12px 16px", borderRadius: 8, transition: "all 0.2s", display: "block", textAlign: "center" }} onMouseOver={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}>Login</Link>
              <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: 16, padding: "12px 16px", borderRadius: 8, transition: "all 0.2s", display: "block", textAlign: "center", background: "#22c55e" }} onMouseOver={e => { e.currentTarget.style.background = "#16a34a"; }} onMouseOut={e => { e.currentTarget.style.background = "#22c55e"; }}>Get Started</Link>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
