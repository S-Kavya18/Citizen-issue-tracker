import React, { useEffect, useState } from "react";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [districtStats, setDistrictStats] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Tamil Nadu districts
  const districts = [
    'All Districts', 'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri',
    'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
    'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvarur', 'Thoothukudi', 'Tiruchirappalli',
    'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvannamalai', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  useEffect(() => {
    fetchIssues();
    fetchDistrictStats();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, selectedDistrict, selectedStatus]);

  const fetchIssues = async () => {
    try {
      const response = await fetch("/api/issues");
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      } else {
        console.error("Failed to fetch issues");
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const fetchDistrictStats = async () => {
    try {
      const response = await fetch("/api/issues/district-stats");
      if (response.ok) {
        const data = await response.json();
        setDistrictStats(data);
      }
    } catch (error) {
      console.error("Error fetching district stats:", error);
    }
  };

  const filterIssues = () => {
    let filtered = [...issues];

    // Filter by district
    if (selectedDistrict !== "all") {
      filtered = filtered.filter(issue => issue.location === selectedDistrict);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(issue => issue.status === selectedStatus);
    }

    setFilteredIssues(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "#c8f5d2";
      case "In Progress": return "#e3efff";
      default: return "#fff3cd";
    }
  };

  return (
    <div className="page" style={{ padding: "20px" }}>
      <h2>Community Issues</h2>

      {/* District Statistics */}
      {districtStats.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>District Overview</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
            {districtStats.slice(0, 6).map((stat) => (
              <div key={stat.district} style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>{stat.district}</h4>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  <div>Total: {stat.total_issues}</div>
                  <div>Pending: {stat.pending_issues}</div>
                  <div>Resolved: {stat.resolved_issues}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        gap: "20px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <div>
          <label style={{ fontWeight: "600", marginRight: "10px" }}>District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
          >
            {districts.map(district => (
              <option key={district} value={district === 'All Districts' ? 'all' : district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "600", marginRight: "10px" }}>Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ color: "#6b7280", fontSize: "14px" }}>
          Showing {filteredIssues.length} of {issues.length} issues
        </div>
      </div>

      {/* Issues Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filteredIssues.map((issue) => (
          <div key={issue.id} style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
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
            <div style={{ padding: "16px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{issue.title}</h3>
              <div style={{ color: "#6b7280", marginBottom: "8px", fontSize: "14px" }}>
                🏷️ {issue.category}
              </div>
              <div style={{ color: "#059669", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                📍 {issue.location}
              </div>
              <div style={{ color: "#4b5563", marginBottom: "12px", fontSize: "14px" }}>
                {issue.description}
              </div>
              
              {/* Resolved Photo Section */}
              {issue.status === 'Resolved' && issue.resolved_image_url && (
                <div style={{
                  marginBottom: 12,
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
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    📸 View Resolution Photo
                  </button>
                </div>
              )}
              
              <span style={{
                background: getStatusColor(issue.status),
                color: "#333",
                borderRadius: "12px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                {issue.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ color: "#1f2937", marginBottom: "8px" }}>No issues found</h3>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            {selectedDistrict !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters to see more issues."
              : "No issues have been reported yet."
            }
          </p>
        </div>
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

export default Issues;
