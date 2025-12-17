import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TNDistricts from "../utils/tnDistricts";

const VolunteerProfileSetup = () => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);


  const [formData, setFormData] = useState({
    district: "",
    phone: "",
    skills: "",
    availability: "weekdays",
    experience: "",
    transportation: "own_vehicle",
    emergency_contact: "",
    emergency_phone: ""
  });
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/volunteer/register");
      return;
    }
    setUser(userData);
    setPhoneVerified(!!userData?.phone_verified);
    setIsUserLoading(false);
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    const sanitized = {
      district: formData.district.trim(),
      phone: formData.phone.trim(),
      skills: formData.skills.trim(),
      availability: String(formData.availability || '').trim(),
      experience: formData.experience.trim(),
      transportation: String(formData.transportation || '').trim(),
      emergency_contact: formData.emergency_contact.trim(),
      emergency_phone: formData.emergency_phone.trim()
    };
    
    // District validation
    if (!sanitized.district) {
      newErrors.district = "District is required";
    } else if (sanitized.district.length < 2) {
      newErrors.district = "District must be at least 2 characters";
    } else if (!/^[a-zA-Z0-9 ,.'-]{2,60}$/.test(sanitized.district)) {
      newErrors.district = "Use letters, numbers, spaces and ,.'- only";
    }
    
  // Phone validation
  const phoneDigits = sanitized.phone.replace(/[^\d]/g, '');
  const phoneRegex = /^[+]?([1-9][\d\s\-()]{8,20})$/;
    if (!sanitized.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(sanitized.phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    // Skills validation
    if (!sanitized.skills) {
      newErrors.skills = "Skills are required";
    } else if (sanitized.skills.length < 30) {
      newErrors.skills = "Please describe your skills (min 30 characters)";
    } else if (sanitized.skills.length > 600) {
      newErrors.skills = "Keep it under 600 characters";
    } else if (!/^[a-zA-Z0-9 ,.';:\n-]+$/.test(sanitized.skills)) {
      newErrors.skills = "Only letters, numbers, spaces and ,.';- are allowed";
    }
    
    // Experience length
    if (sanitized.experience && sanitized.experience.length > 800) {
      newErrors.experience = "Keep experience under 800 characters";
    }

    // Availability validation
    const allowedAvailability = ['weekdays', 'weekends', 'both', 'evenings', 'flexible'];
    if (!allowedAvailability.includes(sanitized.availability)) {
      newErrors.availability = "Please select a valid availability option";
    }

    // Transportation validation
    const allowedTransportation = ['own_vehicle', 'public_transport', 'bicycle', 'walking', 'no_transport'];
    if (!allowedTransportation.includes(sanitized.transportation)) {
      newErrors.transportation = "Please select a valid transportation option";
    }

    // Emergency contact validation (if provided)
    if (sanitized.emergency_contact && !sanitized.emergency_phone) {
      newErrors.emergency_phone = "Emergency phone is required when contact is provided";
    }
    if (sanitized.emergency_phone && !sanitized.emergency_contact) {
      newErrors.emergency_contact = "Emergency contact name is required when phone is provided";
    }
    if (sanitized.emergency_phone) {
      const emDigits = sanitized.emergency_phone.replace(/[^\d]/g, '');
      if (!phoneRegex.test(sanitized.emergency_phone) || emDigits.length < 10 || emDigits.length > 15) {
        newErrors.emergency_phone = "Enter a valid emergency phone";
      }
    }
    if (sanitized.emergency_contact) {
      if (!/^[a-zA-Z ,.'-]{2,80}$/.test(sanitized.emergency_contact)) {
        newErrors.emergency_contact = "Use 2-80 letters and ,.'- only";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const limits = {
      district: 60,
      phone: 25,
      skills: 600,
      experience: 800,
      emergency_contact: 80,
      emergency_phone: 25
    };
    const max = limits[name] || 200;
    const nextValue = String(value).slice(0, max);
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form
    if (!validateForm()) {
      return;
    }
    if (!phoneVerified) {
      alert("Please verify your phone number before continuing.");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token");
    console.log("[VolunteerProfileSetup] Using token:", token);
    if (!token || token.length < 10) {
      alert("No valid token found. Please log in again.");
      navigate("/login");
      setIsLoading(false);
      return;
    }
    try {
      const payload = {
        district: formData.district.trim().replace(/\s+/g, ' '),
        phone: formData.phone.trim(),
        skills: formData.skills.trim(),
        availability: formData.availability,
        experience: formData.experience.trim(),
        transportation: formData.transportation,
        emergency_contact: formData.emergency_contact.trim(),
        emergency_phone: formData.emergency_phone.trim()
      };
      const response = await fetch('http://localhost:5000/volunteers/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile completed successfully:', data);
        // Update user data in localStorage
        const updatedUser = { ...user, ...formData, profile_completed: true, phone_verified: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Redirect to volunteer dashboard
        navigate("/volunteer/dashboard");
      } else {
        const errorData = await response.json();
        console.error('❌ Profile completion failed:', errorData);
        alert(errorData.error || "Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error('❌ Profile completion error:', error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
};

  const requestOtp = async () => {
    setOtpStatus("");
    // Basic phone validation reuse
    const phone = formData.phone.trim();
    const digits = phone.replace(/[^\d]/g, '');
    const phoneRegex = /^[+]?([1-9][\d\s\-()]{8,20})$/;
    if (!phone || !phoneRegex.test(phone) || digits.length < 10 || digits.length > 15) {
      setErrors(prev => ({ ...prev, phone: "Enter a valid phone number" }));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/volunteers/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ channel: 'phone', destination: phone })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpStatus('OTP sent to your phone (valid for 5 minutes).');
      } else {
        setOtpStatus(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpStatus('Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    setVerifying(true);
    setOtpStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/volunteers/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ channel: 'phone', destination: formData.phone.trim(), code: otpCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setPhoneVerified(true);
        setOtpStatus('✅ Phone number verified');
        const curr = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...curr, phone_verified: true, phone: formData.phone.trim() }));
      } else {
        setOtpStatus(data.error || 'Invalid or expired OTP');
      }
    } catch (err) {
      setOtpStatus('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Style definitions
  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(44,62,80,0.13)",
    padding: "40px 32px",
    maxWidth: 600,
    width: "100%",
    margin: "32px 0"
  };

  const getInputStyle = (fieldName) => ({
    width: "100%",
    padding: "12px 16px",
    border: `2px solid ${errors[fieldName] ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 8,
    fontSize: 16,
    transition: "border-color 0.2s",
    marginBottom: 4,
    outline: "none"
  });

  const errorStyle = {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
    marginTop: 4
  };

  const labelStyle = {
    display: "block",
    color: "#374151",
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 14
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #059669 0%, #10b981 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 16,
    padding: "16px 32px",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    width: "100%",
    marginTop: 24,
    opacity: isLoading ? 0.7 : 1
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(120deg, #ecfdf5 0%, #d1fae5 100%)",
      padding: "20px"
    }}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
          <h2 style={{ 
            color: "#059669", 
            fontWeight: 800, 
            fontSize: 28, 
            marginBottom: 8 
          }}>
            {isUserLoading ? "Loading..." : `Welcome, ${user?.name || "Volunteer"}!`}
          </h2>
          <p style={{ 
            color: "#6b7280", 
            fontSize: 16, 
            lineHeight: 1.5,
            marginBottom: 8 
          }}>
            Let's complete your volunteer profile so we can match you with relevant community issues in your area.
          </p>
          <div style={{
            background: "#fef3c7",
            color: "#92400e",
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid #fde68a"
          }}>
            📍 This information helps us assign you to local issues that match your skills
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 16 }}>
            {/* District */}
            <div>
              <label style={labelStyle} htmlFor="district">
                District / Area *
              </label>
              <select
                style={getInputStyle("district")}
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
              >
                <option value="">Select district</option>
                {TNDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.district && <div style={errorStyle}>{errors.district}</div>}
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle} htmlFor="phone">
                Phone Number *
              </label>
              <input
                style={getInputStyle("phone")}
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +1 (555) 123-4567"
                required
              />
              {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <button type="button" onClick={requestOtp} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }} disabled={phoneVerified}>
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.slice(0,6))}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, width: 120 }}
                  disabled={!otpSent || phoneVerified}
                />
                <button type="button" onClick={verifyOtp} disabled={!otpSent || verifying || phoneVerified} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: (!otpSent || verifying || phoneVerified) ? 'not-allowed' : 'pointer' }}>
                  {phoneVerified ? 'Verified' : (verifying ? 'Verifying...' : 'Verify')}
                </button>
              </div>
              {otpStatus && <div style={{ marginTop: 6, fontSize: 12, color: otpStatus.startsWith('✅') ? '#065f46' : '#92400e' }}>{otpStatus}</div>}
            </div>

            {/* Skills */}
            <div>
              <label style={labelStyle} htmlFor="skills">
                Skills & Expertise *
              </label>
              <textarea
                style={{...getInputStyle("skills"), minHeight: 80, resize: "vertical"}}
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., Plumbing, Electrical work, Gardening, Cleaning, Community organizing, Photography..."
                required
              />
              {errors.skills && <div style={errorStyle}>{errors.skills}</div>}
              <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{formData.skills.length}/600</div>
            </div>

            {/* Availability */}
            <div>
              <label style={labelStyle} htmlFor="availability">
                Availability *
              </label>
              <select
                style={getInputStyle("availability")}
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                required
              >
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends (Sat-Sun)</option>
                <option value="both">Both weekdays and weekends</option>
                <option value="evenings">Evenings only</option>
                <option value="flexible">Flexible schedule</option>
              </select>
              {errors.availability && <div style={errorStyle}>{errors.availability}</div>}
            </div>

            {/* Transportation */}
            <div>
              <label style={labelStyle} htmlFor="transportation">
                Transportation
              </label>
              <select
                style={getInputStyle("transportation")}
                id="transportation"
                name="transportation"
                value={formData.transportation}
                onChange={handleInputChange}
              >
                <option value="own_vehicle">Own vehicle</option>
                <option value="public_transport">Public transportation</option>
                <option value="bicycle">Bicycle</option>
                <option value="walking">Walking distance only</option>
                <option value="no_transport">Need transportation help</option>
              </select>
              {errors.transportation && <div style={errorStyle}>{errors.transportation}</div>}
            </div>

            {/* Experience */}
            <div>
              <label style={labelStyle} htmlFor="experience">
                Previous Volunteer Experience
              </label>
              <textarea
                style={{...getInputStyle("experience"), minHeight: 60, resize: "vertical"}}
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Tell us about any previous volunteer work or community involvement (optional)"
              />
              <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{formData.experience.length}/800</div>
            </div>

            {/* Emergency Contact */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="emergency_contact">
                  Emergency Contact Name
                </label>
                <input
                  style={getInputStyle("emergency_contact")}
                  type="text"
                  id="emergency_contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  placeholder="Full name"
                />
                {errors.emergency_contact && <div style={errorStyle}>{errors.emergency_contact}</div>}
              </div>
              <div>
                <label style={labelStyle} htmlFor="emergency_phone">
                  Emergency Phone
                </label>
                <input
                  style={getInputStyle("emergency_phone")}
                  type="tel"
                  id="emergency_phone"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
                {errors.emergency_phone && <div style={errorStyle}>{errors.emergency_phone}</div>}
              </div>
            </div>
          </div>

          {/* Global form state hint */}
          {Object.keys(errors).length > 0 && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#7f1d1d',
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
              fontSize: 13
            }}>
              Please fix the highlighted fields before continuing.
            </div>
          )}

          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading || !phoneVerified}
          >
            {isLoading ? "Saving Profile..." : (phoneVerified ? "Complete Profile & Continue" : "Verify phone to continue")}
          </button>
        </form>

        <div style={{ 
          textAlign: "center", 
          marginTop: 24, 
          color: "#6b7280", 
          fontSize: 12 
        }}>
          Your information will be kept secure and used only for volunteer coordination
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfileSetup;