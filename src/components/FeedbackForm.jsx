import React, { useState } from "react";

// Use an explicit backend URL in development to avoid relying on the dev-proxy binding.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    rating: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          rating: ""
        });
        setTimeout(() => setSuccess(false), 5000); // Hide success message after 5 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "400px"
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    },
    label: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
      marginBottom: "4px"
    },
    input: {
      padding: "12px 14px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "border-color 0.2s ease",
      outline: "none"
    },
    textarea: {
      padding: "12px 14px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      resize: "vertical",
      minHeight: "100px",
      fontFamily: "inherit",
      transition: "border-color 0.2s ease",
      outline: "none"
    },
    select: {
      padding: "12px 14px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      backgroundColor: "white",
      cursor: "pointer",
      transition: "border-color 0.2s ease",
      outline: "none"
    },
    button: {
      padding: "14px 20px",
      background: loading ? "#9ca3af" : "#059669",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      marginTop: "8px"
    },
    successMessage: {
      padding: "12px",
      background: "#d1fae5",
      color: "#065f46",
      border: "1px solid #a7f3d0",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600
    },
    errorMessage: {
      padding: "12px",
      background: "#fef2f2",
      color: "#dc2626",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600
    }
  };

  return (
    <div>
      {success && (
        <div style={styles.successMessage}>
          ✅ Thank you for your feedback! We appreciate your input.
        </div>
      )}
      
      {error && (
        <div style={styles.errorMessage}>
          ❌ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              ...styles.input,
              borderColor: formData.name ? "#10b981" : "#e5e7eb"
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email (optional)</label>
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            style={{
              ...styles.input,
              borderColor: formData.email ? "#10b981" : "#e5e7eb"
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Subject</label>
          <input
            type="text"
            name="subject"
            placeholder="Brief subject of your feedback"
            value={formData.subject}
            onChange={handleChange}
            style={{
              ...styles.input,
              borderColor: formData.subject ? "#10b981" : "#e5e7eb"
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Rating (optional)</label>
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            style={{
              ...styles.select,
              borderColor: formData.rating ? "#10b981" : "#e5e7eb"
            }}
          >
            <option value="">Select a rating</option>
            <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
            <option value="4">⭐⭐⭐⭐ Good</option>
            <option value="3">⭐⭐⭐ Average</option>
            <option value="2">⭐⭐ Below Average</option>
            <option value="1">⭐ Poor</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Message *</label>
          <textarea
            name="message"
            placeholder="Please share your detailed feedback, suggestions, or concerns..."
            value={formData.message}
            onChange={handleChange}
            required
            style={{
              ...styles.textarea,
              borderColor: formData.message ? "#10b981" : "#e5e7eb"
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={styles.button}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.background = "#047857";
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.background = "#059669";
            }
          }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
