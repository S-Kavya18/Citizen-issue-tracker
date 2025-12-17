import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const district = user && user.district ? String(user.district) : "";

  // Check if profile is complete on component mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if volunteer profile is complete
    if (user.role === 'volunteer' && !user.profile_completed && !user.district) {
      navigate("/volunteer/profile-setup");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchIssues();
  }, [district]);

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");

      // First try the volunteer-specific endpoint
      const response = await fetch("/api/volunteers/available-issues", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Volunteer API successful:', data);
        setIssues(data.issues || []);
        calculateStats(data.issues || []);
      } else {
        console.log('⚠️ Volunteer API failed, trying fallback...');
        // Fallback to general issues API with district filtering
        await fetchIssuesFallback();
      }
    } catch (error) {
      console.error("❌ Error fetching issues:", error);
      // Fallback to general issues API
      await fetchIssuesFallback();
    }
  };

  const fetchIssuesFallback = async () => {
    try {
      const fallbackResponse = await fetch("/api/issues");
      if (fallbackResponse.ok) {
        const rows = await fallbackResponse.json();
        console.log('✅ Fallback API successful, total issues:', rows.length);

        // Filter issues by district
        let filtered = rows;
        if (district) {
          filtered = rows.filter((x) =>
            (x.location || "").toLowerCase().includes(district.toLowerCase())
          );
          console.log('🔍 Filtered by district:', district, 'Found:', filtered.length);
        }

        setIssues(filtered);
        calculateStats(filtered);
      } else {
        console.error('❌ Fallback API also failed');
        setIssues([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error("❌ Fallback error:", error);
      setIssues([]);
      calculateStats([]);
    }
  };

  const calculateStats = (issuesList) => {
    const stats = {
      total: issuesList.length,
      pending: issuesList.filter(i => i.status === 'Pending').length,
      inProgress: issuesList.filter(i => i.status === 'In Progress').length,
      resolved: issuesList.filter(i => i.status === 'Resolved').length,
      myDistrict: issuesList.filter(i =>
        district && (i.location || "").toLowerCase().includes(district.toLowerCase())
      ).length
    };
    console.log('📊 Calculated stats:', stats);
    setVolunteerStats(stats);
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      calculateStats(issues.map(i => i.id === id ? { ...i, status } : i));
    } else {
      const text = await res.text();
      alert(text || "Failed to update status");
    }
  };

  const resolveWithPhoto = async (id, file) => {
    if (!file) { alert("Please choose an image"); return; }
    const form = new FormData();
    form.append("image", file);
    form.append("volunteer_id", user?.id);
    const res = await fetch(`/api/issues/${id}/resolve`, { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const updatedIssues = issues.map(i => i.id === id ? { ...i, status: 'Resolved', resolved_image_url: data.resolved_image_url } : i);
      setIssues(updatedIssues);
      calculateStats(updatedIssues);
      alert(data.message || "Issue resolved and citizen notified!");
    } else {
      const text = await res.text();
      alert(text || "Failed to resolve");
    }
  };

  const sendNote = async (id, note, keepInProgress) => {
    const res = await fetch(`/api/issues/${id}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note,
        status: keepInProgress ? 'In Progress' : 'Pending',
        volunteer_id: user?.id
      })
    });
    if (res.ok) {
      const updatedIssues = issues.map(i => i.id === id ? { ...i, volunteer_note: note, status: keepInProgress ? 'In Progress' : 'Pending' } : i);
      setIssues(updatedIssues);
      calculateStats(updatedIssues);
      const result = await res.json();
      alert(result.message || 'Note sent to reporter.');
    } else {
      alert('Failed to send note');
    }
  };

  const getFilteredIssues = () => {
    switch (filter) {
      case 'pending': return issues.filter(i => i.status === 'Pending');
      case 'inProgress': return issues.filter(i => i.status === 'In Progress');
      case 'resolved': return issues.filter(i => i.status === 'Resolved');
      case 'myDistrict': return issues.filter(i =>
        district && (i.location || "").toLowerCase().includes(district.toLowerCase())
      );
      default: return issues;
    }
  };

  const styles = {
    container: {
      padding: "20px",
      background: "#f8fafc",
      minHeight: "100vh"
    },
    header: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      color: "#fff",
      borderRadius: 16,
      padding: "24px 32px",
      marginBottom: 24,
      boxShadow: "0 8px 32px rgba(5, 150, 105, 0.2)"
    },
    profileCard: {
      background: "#fff",
      borderRadius: 16,
      padding: "24px",
      marginBottom: 24,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
      marginBottom: 24
    },
    statCard: {
      background: "#fff",
      borderRadius: 12,
      padding: "20px",
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      border: "1px solid #e2e8f0"
    },
    filterBar: {
      background: "#fff",
      borderRadius: 12,
      padding: "16px 24px",
      marginBottom: 24,
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    },
    filterBtn: (active) => ({
      padding: "8px 16px",
      borderRadius: 8,
      border: "none",
      background: active ? "#059669" : "#f1f5f9",
      color: active ? "#fff" : "#64748b",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 14,
      transition: "all 0.2s"
    }),
    issuesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: 20
    },
    issueCard: {
      background: "#fff",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      transition: "transform 0.2s, box-shadow 0.2s"
    },
    actionBtn: (color) => ({
      padding: "8px 12px",
      borderRadius: 6,
      border: "none",
      color: "#fff",
      background: color,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      transition: "all 0.2s"
    }),
    imageContainer: {
      position: "relative",
      width: "100%",
      height: 200,
      background: "#f8fafc",
      overflow: "hidden",
      cursor: "pointer"
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      objectPosition: "center",
      transition: "transform 0.2s ease"
    },
    imageOverlay: {
      position: "absolute",
      top: 8,
      right: 8,
      background: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20
    },
    modalImage: {
      maxWidth: "90vw",
      maxHeight: "90vh",
      objectFit: "contain",
      borderRadius: 8,
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
    },
    closeButton: {
      position: "absolute",
      top: 20,
      right: 20,
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      color: "#fff",
      fontSize: 24,
      width: 40,
      height: 40,
      borderRadius: "50%",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.2s"
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
          🤝 Volunteer Dashboard
        </h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: 16 }}>
          Making a difference in your community, one issue at a time
        </p>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #059669, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#fff"
          }}>
            {user.name?.charAt(0)?.toUpperCase() || "V"}
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#1f2937", fontSize: 20 }}>{user.name}</h3>
            <p style={{ margin: "4px 0", color: "#6b7280", fontSize: 14 }}>
              📍 {user.district || "District not set"} • 📞 {user.phone || "Phone not set"}
            </p>
            <p style={{ margin: 0, color: "#059669", fontSize: 14, fontWeight: 600 }}>
              🎯 {user.skills ? user.skills.substring(0, 60) + (user.skills.length > 60 ? "..." : "") : "Skills not set"}
            </p>
          </div>
        </div>

        {user.availability && (
          <div style={{
            background: "#f0fdf4",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #bbf7d0"
          }}>
            <span style={{ color: "#166534", fontSize: 14, fontWeight: 600 }}>
              🕒 Available: {user.availability.replace('_', ' ').toUpperCase()}
              {user.transportation && ` • 🚗 Transportation: ${user.transportation.replace('_', ' ')}`}
            </span>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{volunteerStats.total || 0}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Total Issues</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ fontSize: 32, color: "#f59e0b", marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{volunteerStats.pending || 0}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Pending</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ fontSize: 32, color: "#8b5cf6", marginBottom: 8 }}>🔄</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{volunteerStats.inProgress || 0}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>In Progress</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ fontSize: 32, color: "#10b981", marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{volunteerStats.resolved || 0}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Resolved</div>
        </div>

        <div style={styles.statCard}>
          <div style={{ fontSize: 32, color: "#059669", marginBottom: 8 }}>📍</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{volunteerStats.myDistrict || 0}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>In My District</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <span style={{ color: "#374151", fontWeight: 600, marginRight: 8 }}>Filter:</span>
        <button
          style={styles.filterBtn(filter === 'all')}
          onClick={() => setFilter('all')}
        >
          All Issues ({volunteerStats.total || 0})
        </button>
        <button
          style={styles.filterBtn(filter === 'pending')}
          onClick={() => setFilter('pending')}
        >
          Pending ({volunteerStats.pending || 0})
        </button>
        <button
          style={styles.filterBtn(filter === 'inProgress')}
          onClick={() => setFilter('inProgress')}
        >
          In Progress ({volunteerStats.inProgress || 0})
        </button>
        <button
          style={styles.filterBtn(filter === 'myDistrict')}
          onClick={() => setFilter('myDistrict')}
        >
          My District ({volunteerStats.myDistrict || 0})
        </button>
        <button
          style={styles.filterBtn(filter === 'resolved')}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({volunteerStats.resolved || 0})
        </button>
      </div>

      {/* Issues Grid */}
      <div style={styles.issuesGrid}>
        {getFilteredIssues().map((issue) => (
          <div key={issue.id} style={styles.issueCard}>
            {issue.image_url && (
              <div style={styles.imageContainer} onClick={() => setSelectedImage(issue.image_url)}>
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  style={styles.image}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f1f5f9; color: #6b7280; font-size: 14px;"><span>📷 Image unavailable</span></div>';
                  }}
                />
                <div style={styles.imageOverlay}>
                  🔍 Click to enlarge
                </div>
              </div>
            )}

            <div style={{ padding: 20 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1f2937",
                  flex: 1
                }}>
                  {issue.title}
                </h3>
                <span className={`pill ${String(issue.status).toLowerCase().replace(/\s+/g,'')}`}>
                  {issue.status}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{
                  margin: "0 0 8px 0",
                  color: "#6b7280",
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  🏷️ {issue.category}
                </p>
                <p style={{
                  margin: "0 0 8px 0",
                  color: "#6b7280",
                  fontSize: 14
                }}>
                  📍 {issue.location}
                </p>
                {issue.reporter_name && (
                  <p style={{
                    margin: "0 0 8px 0",
                    color: "#6b7280",
                    fontSize: 14
                  }}>
                    👤 Reported by: {issue.reporter_name}
                  </p>
                )}
                <p style={{
                  margin: 0,
                  color: "#9ca3af",
                  fontSize: 12
                }}>
                  📅 {new Date(issue.created_at).toLocaleDateString()}
                </p>
              </div>

              {issue.description && (
                <p style={{
                  margin: "0 0 16px 0",
                  color: "#4b5563",
                  fontSize: 14,
                  lineHeight: 1.5
                }}>
                  {issue.description}
                </p>
              )}

              {/* Location Link */}
              {(issue.latitude || issue.longitude || issue.location) && (
                <div style={{ marginBottom: 16 }}>
                  <a
                    href={issue.latitude || issue.longitude ?
                      `https://www.google.com/maps?q=${issue.latitude || ''},${issue.longitude || ''}` :
                      `https://www.google.com/maps?q=${encodeURIComponent(issue.location || '')}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#059669",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    🗺️ Open in Maps →
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 16,
                flexWrap: 'wrap'
              }}>
                <button
                  style={styles.actionBtn('#f59e0b')}
                  onClick={() => updateStatus(issue.id, 'In Progress')}
                >
                  🔄 In Progress
                </button>
                <button
                  style={styles.actionBtn('#ef4444')}
                  onClick={() => sendNote(issue.id, 'Location unclear - need better directions', false)}
                >
                  📍 Need Better Location
                </button>
              </div>

              {/* Resolution Section - Photo Required */}
              {issue.status !== 'Resolved' && (
                <div style={{
                  marginBottom: 16,
                  padding: 16,
                  background: "#f0fdf4",
                  border: "2px solid #bbf7d0",
                  borderRadius: 12
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12
                  }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <h4 style={{
                      margin: 0,
                      color: "#166534",
                      fontSize: 16,
                      fontWeight: 700
                    }}>
                      Mark as Resolved
                    </h4>
                  </div>
                  <p style={{
                    margin: "0 0 12px 0",
                    color: "#15803d",
                    fontSize: 14,
                    lineHeight: 1.4
                  }}>
                    📸 <strong>Photo proof required:</strong> Upload a clear photo showing the completed work to resolve this issue. The citizen will be automatically notified.
                  </p>
                  <label style={{
                    display: "inline-block",
                    padding: "12px 20px",
                    border: "2px solid #16a34a",
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)"
                  }}>
                    📷 Upload Resolution Photo & Complete
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          resolveWithPhoto(issue.id, file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Resolved Photo Link */}
              {issue.status === 'Resolved' && issue.resolved_image_url && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    onClick={() => setSelectedImage(issue.resolved_image_url)}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    📸 View Resolution Photo
                  </button>
                </div>
              )}

              {/* Note to Reporter */}
              {issue.status !== 'Resolved' && (
                <div>
                  <textarea
                    placeholder="Add a note for the reporter (e.g., need more specific landmark)..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '2px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      resize: "vertical",
                      outline: "none"
                    }}
                    defaultValue={issue.volunteer_note || ''}
                    onChange={(e) => (issue._note = e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      style={styles.actionBtn('#6366f1')}
                      onClick={() => sendNote(issue.id, issue._note || 'Working on this issue', true)}
                    >
                      💬 Send Note & Mark In Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {getFilteredIssues().length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h3 style={{ color: "#1f2937", marginBottom: 8 }}>
            {filter === 'all' ? 'No issues available' : `No ${filter} issues`}
          </h3>
          <p style={{ color: "#6b7280", fontSize: 16 }}>
            {filter === 'resolved' ?
              'Great job! You\'ve helped resolve issues in your community.' :
              filter === 'myDistrict' ?
                'No issues found in your district. Check back later or view all issues.' :
                'Check back later for new issues to help with.'
            }
          </p>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <button 
            style={styles.closeButton}
            onClick={() => setSelectedImage(null)}
            onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Full resolution"
            style={styles.modalImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;