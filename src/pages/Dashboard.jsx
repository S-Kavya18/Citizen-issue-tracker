import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]); // For community overview
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [view, setView] = useState("my-issues"); // my-issues, community, statistics, notifications
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch user's issues
    fetch(`/api/issues?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((rows) => setIssues(rows))
      .catch(error => console.error("Error fetching user issues:", error));
    
    // Fetch all community issues for overview
    fetch('/api/issues')
      .then((r) => r.json())
      .then((rows) => setAllIssues(rows))
      .catch(error => console.error("Error fetching community issues:", error));
    
    // Fetch notifications
    fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : (Array.isArray(rows?.notifications) ? rows.notifications : []);
        setNotifications(list);
      })
      .catch(error => console.error("Error fetching notifications:", error));
    
    // Fetch unread notifications count
    fetch(`/api/notifications/unread-count?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(error => console.error("Error fetching unread count:", error));
  }, [user?.id]);

  // Functions to handle notifications
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
        // If it was unread, decrease the count
        const wasUnread = notifications.find(n => n.id === notificationId && !n.is_read);
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const stats = useMemo(() => {
    const myStats = {
      total: issues.length,
      pending: issues.filter(i => i.status === 'Pending').length,
      inProgress: issues.filter(i => i.status === 'In Progress').length,
      resolved: issues.filter(i => i.status === 'Resolved').length
    };
    
    const communityStats = {
      total: allIssues.length,
      pending: allIssues.filter(i => i.status === 'Pending').length,
      inProgress: allIssues.filter(i => i.status === 'In Progress').length,
      resolved: allIssues.filter(i => i.status === 'Resolved').length
    };
    
    return { myStats, communityStats };
  }, [issues, allIssues]);

  const filtered = useMemo(() => {
    const sourceIssues = view === 'community' ? allIssues : issues;
    let rows = [...sourceIssues];
    if (query) rows = rows.filter(i => (i.title + " " + i.description).toLowerCase().includes(query.toLowerCase()));
    if (category) rows = rows.filter(i => i.category === category);
    if (sortBy === "recent") rows.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === "status") rows.sort((a,b) => String(a.status).localeCompare(String(b.status)));
    return rows;
  }, [issues, allIssues, query, category, sortBy, view]);

  const styles = {
    container: {
      padding: "20px",
      background: "#f8fafc",
      minHeight: "100vh"
    },
    header: {
      background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      color: "#fff",
      borderRadius: 16,
      padding: "24px 32px",
      marginBottom: 24,
      boxShadow: "0 8px 32px rgba(37, 99, 235, 0.2)"
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
    navigationBar: {
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
    navBtn: (active) => ({
      padding: "10px 16px",
      borderRadius: 8,
      border: "none",
      background: active ? "#2563eb" : "#f1f5f9",
      color: active ? "#fff" : "#64748b",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 14,
      transition: "all 0.2s"
    }),
    filterBar: {
      background: "#fff",
      borderRadius: 12,
      padding: "16px 24px",
      marginBottom: 24,
      display: "grid",
      gridTemplateColumns: "1fr auto auto",
      gap: 16,
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    },
    quickActions: {
      background: "#fff",
      borderRadius: 12,
      padding: "20px",
      marginBottom: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    },
    actionButton: {
      background: "#10b981",
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 16,
      marginRight: 12,
      marginBottom: 8,
      transition: "all 0.2s"
    },
    issuesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: 20
    },
    issueCard: {
      background: "#fff",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      transition: "transform 0.2s, box-shadow 0.2s"
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
          🏠 Citizen Dashboard
        </h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: 16 }}>
          Track your reported issues and stay updated on community progress
        </p>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#fff"
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#1f2937", fontSize: 20 }}>{user?.name || "Citizen"}</h3>
            <p style={{ margin: "4px 0", color: "#6b7280", fontSize: 14 }}>
              📧 {user?.email || "Email not available"}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, color: "#2563eb", fontSize: 14, fontWeight: 600 }}>
                🏛️ Active community member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "recently"}
              </p>
              {unreadCount > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fef3c7",
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid #fbbf24"
                }}>
                  <span style={{ color: "#92400e", fontSize: 12, fontWeight: 600 }}>
                    🔔 {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setView('notifications')}
                    style={{
                      background: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 600
                    }}
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>Quick Actions</h3>
        <button 
          style={styles.actionButton}
          onClick={() => navigate('/add-issue')}
        >
          ➕ Report New Issue
        </button>
        <button 
          style={{...styles.actionButton, background: "#8b5cf6"}}
          onClick={() => navigate('/issues')}
        >
          🌍 Browse Community Issues
        </button>
        <button 
          style={{...styles.actionButton, background: "#f59e0b"}}
          onClick={() => navigate('/feedback')}
        >
          💬 Provide Feedback
        </button>
      </div>

      {/* Navigation Bar */}
      <div style={styles.navigationBar}>
        <span style={{ color: "#374151", fontWeight: 600, marginRight: 8 }}>View:</span>
        <button 
          style={styles.navBtn(view === 'my-issues')} 
          onClick={() => setView('my-issues')}
        >
          My Issues ({stats.myStats.total})
        </button>
        <button 
          style={styles.navBtn(view === 'community')} 
          onClick={() => setView('community')}
        >
          Community Issues ({stats.communityStats.total})
        </button>
        <button 
          style={styles.navBtn(view === 'statistics')} 
          onClick={() => setView('statistics')}
        >
          📊 Statistics
        </button>
        <button 
          style={styles.navBtn(view === 'notifications')} 
          onClick={() => setView('notifications')}
        >
          🔔 Notifications {unreadCount > 0 && <span style={{ 
            background: '#ef4444', 
            color: '#fff', 
            borderRadius: '50%', 
            fontSize: 11, 
            fontWeight: 'bold',
            padding: '2px 6px',
            marginLeft: 6,
            minWidth: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>{unreadCount}</span>}
        </button>
      </div>

      {/* Statistics View */}
      {view === 'statistics' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#1f2937", marginBottom: 16 }}>📈 My Issues Overview</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.myStats.total}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Total Reported</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#f59e0b", marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.myStats.pending}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Pending</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#8b5cf6", marginBottom: 8 }}>🔄</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.myStats.inProgress}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>In Progress</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#10b981", marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.myStats.resolved}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Resolved</div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ color: "#1f2937", marginBottom: 16 }}>🌍 Community Overview</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }}>🏘️</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.communityStats.total}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Community Issues</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#f59e0b", marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.communityStats.pending}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Awaiting Action</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#8b5cf6", marginBottom: 8 }}>🔄</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.communityStats.inProgress}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Being Worked On</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: 32, color: "#10b981", marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>{stats.communityStats.resolved}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Successfully Resolved</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notifications View */}
      {view === 'notifications' && (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: 24
          }}>
            <h3 style={{ color: "#1f2937", margin: 0 }}>🔔 Your Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Mark All as Read
              </button>
            )}
          </div>

          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <div style={{ 
              background: "#fff", 
              borderRadius: 12, 
              padding: 40, 
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
              <h3 style={{ color: "#6b7280", marginBottom: 8 }}>No notifications yet</h3>
              <p style={{ color: "#9ca3af" }}>
                When volunteers update your issues, you'll see notifications here
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Array.isArray(notifications) && notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: notification.is_read ? "1px solid #e5e7eb" : "2px solid #3b82f6",
                    position: "relative"
                  }}
                >
                  {!notification.is_read && (
                    <div style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#3b82f6"
                    }} />
                  )}
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: "0 0 8px 0", 
                        color: "#1f2937",
                        fontSize: 16,
                        fontWeight: 600
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{ 
                        margin: "0 0 12px 0", 
                        color: "#374151",
                        fontSize: 14,
                        lineHeight: 1.5
                      }}>
                        {notification.message}
                      </p>
                      
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        gap: 16,
                        fontSize: 12,
                        color: "#6b7280"
                      }}>
                        <span>
                          📅 {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                        </span>
                        {notification.volunteer_name && (
                          <span>👨‍🔧 {notification.volunteer_name}</span>
                        )}
                        <span>🏷️ {notification.issue_category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    gap: 8,
                    paddingTop: 12,
                    borderTop: "1px solid #f3f4f6"
                  }}>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setView('my-issues');
                        // Optionally scroll to the specific issue
                      }}
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      View Issue
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Issues View */}
      {view !== 'statistics' && view !== 'notifications' && (
        <>
          {/* Filter Bar */}
          <div style={styles.filterBar}>
            <input 
              placeholder="Search issues by keyword..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8 }}
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8 }}
            >
              <option value="">All Categories</option>
              <option value="Roads & Potholes">Roads & Potholes</option>
              <option value="Public Lighting">Public Lighting</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Parks & Recreation">Parks & Recreation</option>
              <option value="Other">Other</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8 }}
            >
              <option value="recent">Most Recent</option>
              <option value="status">By Status</option>
            </select>
          </div>

          {/* Issues Grid */}
          {filtered.length === 0 ? (
            <div style={{ 
              background: "#fff", 
              borderRadius: 12, 
              padding: 40, 
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {view === 'my-issues' ? "📭" : "🔍"}
              </div>
              <h3 style={{ color: "#6b7280", marginBottom: 8 }}>
                {view === 'my-issues' ? "No issues reported yet" : "No issues found"}
              </h3>
              <p style={{ color: "#9ca3af", marginBottom: 20 }}>
                {view === 'my-issues' 
                  ? "Start by reporting your first community issue" 
                  : "Try adjusting your search filters"}
              </p>
              {view === 'my-issues' && (
                <button 
                  style={styles.actionButton}
                  onClick={() => navigate('/add-issue')}
                >
                  Report First Issue
                </button>
              )}
            </div>
          ) : (
            <div style={styles.issuesGrid}>
              {filtered.map((issue) => (
                <div key={issue.id} style={styles.issueCard}>
                  {issue.image_url && (
                    <div 
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 180,
                        background: "#f8fafc",
                        cursor: "pointer",
                        overflow: "hidden"
                      }}
                      onClick={() => setSelectedImage(issue.image_url)}
                    >
                      <img 
                        src={issue.image_url} 
                        alt={issue.title} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "contain",
                          objectPosition: "center",
                          transition: "transform 0.2s ease"
                        }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f1f5f9; color: #6b7280; font-size: 14px;"><span>📷 Image unavailable</span></div>';
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
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
                      <p style={{ 
                        margin: "0 0 12px 0", 
                        color: "#374151", 
                        fontSize: 14,
                        lineHeight: 1.5
                      }}>
                        {issue.description?.length > 120 
                          ? issue.description.substring(0, 120) + "..."
                          : issue.description}
                      </p>
                    </div>

                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      color: "#9ca3af"
                    }}>
                      <span>
                        📅 {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "Date unknown"}
                      </span>
                      {view === 'community' && issue.reporter_name && (
                        <span>👤 {issue.reporter_name}</span>
                      )}
                    </div>

                    {issue.volunteer_note && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: "#f0f9ff",
                        borderRadius: 8,
                        border: "1px solid #bae6fd"
                      }}>
                        <div style={{ fontSize: 12, color: "#0369a1", fontWeight: 600, marginBottom: 4 }}>
                          💬 Volunteer Update:
                        </div>
                        <div style={{ fontSize: 14, color: "#0c4a6e" }}>
                          {issue.volunteer_note}
                        </div>
                      </div>
                    )}

                    {/* Resolved Photo Section */}
                    {issue.status === 'Resolved' && issue.resolved_image_url && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: "#f0fdf4",
                        borderRadius: 8,
                        border: "1px solid #bbf7d0"
                      }}>
                        <div style={{ fontSize: 12, color: "#166534", fontWeight: 600, marginBottom: 8 }}>
                          ✅ Resolution Completed:
                        </div>
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
                            transition: "all 0.2s",
                            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                          }}
                        >
                          📸 View Resolution Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
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
          }}
          onClick={() => setSelectedImage(null)}
        >
          <button 
            style={{
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
            }}
            onClick={() => setSelectedImage(null)}
            onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Full resolution"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;