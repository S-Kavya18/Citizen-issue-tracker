import React from "react";
import FeedbackForm from "../components/FeedbackForm";

const FeedbackPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: "2.5rem 2rem 2rem 2rem",
        maxWidth: "420px",
        width: "100%",
        margin: "2rem 0"
      }}>
        <h2 style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#2d6cdf",
          fontWeight: 700,
          letterSpacing: "0.5px"
        }}>
          Share Your Feedback
        </h2>
        <FeedbackForm />
      </div>
    </div>
  );
};

export default FeedbackPage;


