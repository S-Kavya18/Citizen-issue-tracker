import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Feedback from "./pages/Feedback";
import Issues from "./pages/Issues";
import AddIssue from "./pages/AddIssue";
import Register from "./pages/Register";
import CitizenRegister from "./pages/CitizenRegister";
import VolunteerRegister from "./pages/VolunteerRegister";
import VolunteerProfileSetup from "./pages/VolunteerProfileSetup";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
// import CommunityMap from "./pages/CommunityMap";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            {/* Landing page for new visitors */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Home page for logged-in users */}
            <Route path="/home" element={<Home />} />
            
            {/* Role-specific registration */}
            <Route path="/citizen/register" element={<CitizenRegister />} />
            <Route path="/volunteer/register" element={<VolunteerRegister />} />
            <Route path="/volunteer/profile-setup" element={<VolunteerProfileSetup />} />
            
            {/* General pages */}
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/add-issue" element={<AddIssue />} />
            <Route path="/submit-issue" element={<AddIssue />} />
            
            {/* Authentication */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            
            {/* Dashboards */}
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* <Route path="/community-map" element={<CommunityMap />} /> */}
          </Routes>
        </main>
        <Chatbot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
