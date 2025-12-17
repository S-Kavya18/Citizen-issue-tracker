import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [11.1271, 78.6569]; // Tamil Nadu center
const DEFAULT_ZOOM = 7;

const CommunityMap = () => {
  const [issues, setIssues] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [districtStats, setDistrictStats] = useState([]);

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
    fetchVolunteers();
    fetchDistrictStats();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch("/api/issues");
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await fetch("/api/volunteers");
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
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

  const getFilteredIssues = () => {
    if (selectedDistrict === "all") return issues;
    return issues.filter(issue => issue.location === selectedDistrict);
  };

  const getFilteredVolunteers = () => {
    if (selectedDistrict === "all") return volunteers;
    return volunteers.filter(volunteer => volunteer.district === selectedDistrict);
  };

  const getDistrictColor = (district) => {
    const colors = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const index = districts.indexOf(district) % colors.length;
    return colors[index];
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        background: "#fff",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        maxWidth: "300px"
      }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#1f2937" }}>District Filter</h3>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            marginBottom: "15px"
          }}
        >
          {districts.map(district => (
            <option key={district} value={district === 'All Districts' ? 'all' : district}>
              {district}
            </option>
          ))}
        </select>

        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong>Issues:</strong> {getFilteredIssues().length}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Volunteers:</strong> {getFilteredVolunteers().length}
          </div>
          {districtStats.length > 0 && (
            <div>
              <strong>District Stats:</strong>
              <div style={{ marginTop: "5px" }}>
                {districtStats.slice(0, 3).map((stat) => (
                  <div key={stat.district} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px"
                  }}>
                    <span style={{ color: getDistrictColor(stat.district) }}>
                      {stat.district}:
                    </span>
                    <span>{stat.total_issues}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {getFilteredIssues()
          .filter(issue => issue.latitude != null && issue.longitude != null)
          .map(issue => (
            <Marker key={"issue-" + issue.id} position={[issue.latitude, issue.longitude]}>
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <strong style={{ color: "#059669" }}>{issue.title}</strong><br />
                  <span style={{
                    background: issue.status === "Resolved" ? "#c8f5d2" :
                               issue.status === "In Progress" ? "#e3efff" : "#fff3cd",
                    color: "#333",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {issue.status}
                  </span><br />
                  <strong>Category:</strong> {issue.category}<br />
                  <strong>District:</strong> {issue.location}<br />
                  <strong>Reporter:</strong> {issue.reporter_name || "Anonymous"}
                </div>
              </Popup>
            </Marker>
        ))}
        {getFilteredVolunteers()
          .filter(vol => vol.latitude != null && vol.longitude != null)
          .map(vol => (
            <Marker key={"vol-" + vol.id} position={[vol.latitude, vol.longitude]}>
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <strong style={{ color: "#059669" }}>Volunteer: {vol.name}</strong><br />
                  <strong>District:</strong> {vol.district}<br />
                  <strong>Skills:</strong> {vol.skills || "Not specified"}<br />
                  <strong>Available:</strong> {vol.availability || "Not specified"}
                </div>
              </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CommunityMap;
