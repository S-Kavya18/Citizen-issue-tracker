import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddIssue = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("No file chosen");
  const [fileObj, setFileObj] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  // Input style for all fields
  const inputStyle = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #bcdffb",
    fontSize: 16,
    fontWeight: 500,
    outline: "none",
    background: "#f7fbff",
    color: "#2d6cdf",
    boxShadow: "0 2px 8px rgba(44,62,80,0.07)",
    transition: "border 0.2s, box-shadow 0.2s",
    width: "100%"
  };

  // Validation functions
  const validateTitle = (title) => {
    if (!title.trim()) return "Title is required";
    if (title.trim().length < 5) return "Title must be at least 5 characters";
    if (title.trim().length > 100) return "Title must be less than 100 characters";
    return "";
  };

  const validateDescription = (description) => {
    if (!description.trim()) return "Description is required";
    if (description.trim().length < 20) return "Description must be at least 20 characters";
    if (description.trim().length > 1000) return "Description must be less than 1000 characters";
    return "";
  };

  const validateCategory = (category) => {
    if (!category) return "Please select a category";
    return "";
  };

  const validateLocation = (location) => {
    if (!location) return "Please select a district";
    return "";
  };

  const validateImageUrl = (url) => {
    // Image URL is optional, but if provided, validate it
    if (url) {
      try {
        new URL(url);
        // Check if it's an image URL
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const hasImageExtension = imageExtensions.some(ext => 
          url.toLowerCase().includes(ext)
        );
        if (!hasImageExtension && !url.includes('googleapis.com') && !url.includes('cloudinary.com')) {
          return "Please provide a valid image URL";
        }
      } catch {
        return "Please provide a valid URL";
      }
    }
    return "";
  };

  const validateFileUpload = () => {
    if (!fileObj) return "Please upload an image file";
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      title: validateTitle(title),
      description: validateDescription(description),
      category: validateCategory(category),
      location: validateLocation(location),
      imageUrl: validateImageUrl(imageUrl),
      fileUpload: validateFileUpload()
    };

    setErrors(newErrors);
    setTouched({
      title: true,
      description: true,
      category: true,
      location: true,
      imageUrl: true,
      fileUpload: true
    });

    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleFieldChange = (field, value, validator) => {
    // Update the field value
    switch (field) {
      case 'title': setTitle(value); break;
      case 'description': setDescription(value); break;
      case 'category': setCategory(value); break;
      case 'location': setLocation(value); break;
      case 'imageUrl': setImageUrl(value); break;
    }

    // Validate the field if it has been touched
    if (touched[field]) {
      const error = validator(value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field, validator) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = { title, description, category, location, imageUrl }[field];
    const error = validator(value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    // Validate form before submission
    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }
    
    setSubmitting(true);
    let user = null;
    try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { user = null; }
    // Always use file upload route since file upload is required
    const form = new FormData();
    form.append("image", fileObj);
    form.append("title", title);
    form.append("description", description);
    form.append("category", category);
    form.append("location", location);
    form.append("user_id", user?.id || "");
    form.append("latitude", coords.lat ?? "");
    form.append("longitude", coords.lon ?? "");
    
    // Add image URL if provided (optional)
    if (imageUrl) {
      form.append("image_url", imageUrl);
    }
    
    const res = await fetch("/api/issues/upload", { method: "POST", body: form });
    if (res.ok) {
      alert("Issue submitted successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setImageUrl("");
      setFileObj(null);
      setFileName("No file chosen");
      setPreviewUrl("");
      setFileError("");
      setErrors({});
      setTouched({});
      navigate("/issues");
    } else {
      let errorMsg = "Submission failed";
      let validationErrors = [];
      
      try {
        const data = await res.json();
        if (data.error) {
          errorMsg = data.error;
        }
        if (data.details && Array.isArray(data.details)) {
          validationErrors = data.details;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }
      
      // Show validation errors if any
      if (validationErrors.length > 0) {
        alert("Please fix the following errors:\n• " + validationErrors.join("\n• "));
      } else {
        alert(errorMsg);
      }
      
      console.error("/api/issues error", errorMsg, validationErrors);
    }
    setSubmitting(false);
  };

  return (
    <div className="page">
      <h2>Report a New Issue</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
            Title <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input 
            type="text" 
            placeholder="e.g., Large pothole on Elm Street" 
            value={title} 
            onChange={(e) => handleFieldChange('title', e.target.value, validateTitle)}
            onBlur={() => handleFieldBlur('title', validateTitle)}
            style={{
              ...inputStyle,
              borderColor: errors.title ? '#dc2626' : '#bcdffb'
            }}
            required 
          />
          {errors.title && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.title}</div>}
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
            Description <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea 
            placeholder="Provide a detailed description of the issue." 
            value={description} 
            onChange={(e) => handleFieldChange('description', e.target.value, validateDescription)}
            onBlur={() => handleFieldBlur('description', validateDescription)}
            style={{
              ...inputStyle,
              borderColor: errors.description ? '#dc2626' : '#bcdffb',
              minHeight: '120px',
              resize: 'vertical'
            }}
            rows={6} 
            required 
          />
          {errors.description && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.description}</div>}
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {description.length}/1000 characters
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
              Category <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select 
              value={category} 
              onChange={(e) => handleFieldChange('category', e.target.value, validateCategory)}
              onBlur={() => handleFieldBlur('category', validateCategory)}
              style={{
                ...inputStyle,
                borderColor: errors.category ? '#dc2626' : '#bcdffb'
              }}
              required
            >
              <option value="">Select a category</option>
              <option>Roads & Potholes</option>
              <option>Public Lighting</option>
              <option>Sanitation</option>
              <option>Parks & Recreation</option>
              <option>Other</option>
            </select>
            {errors.category && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.category}</div>}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
              District <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select 
              value={location} 
              onChange={(e) => handleFieldChange('location', e.target.value, validateLocation)}
              onBlur={() => handleFieldBlur('location', validateLocation)}
              style={{
                ...inputStyle,
                borderColor: errors.location ? '#dc2626' : '#bcdffb'
              }}
              required
            >
            <option value="">Select District</option>
            <option value="Ariyalur">Ariyalur</option>
            <option value="Chengalpattu">Chengalpattu</option>
            <option value="Chennai">Chennai</option>
            <option value="Coimbatore">Coimbatore</option>
            <option value="Cuddalore">Cuddalore</option>
            <option value="Dharmapuri">Dharmapuri</option>
            <option value="Dindigul">Dindigul</option>
            <option value="Erode">Erode</option>
            <option value="Kallakurichi">Kallakurichi</option>
            <option value="Kancheepuram">Kancheepuram</option>
            <option value="Karur">Karur</option>
            <option value="Krishnagiri">Krishnagiri</option>
            <option value="Madurai">Madurai</option>
            <option value="Mayiladuthurai">Mayiladuthurai</option>
            <option value="Nagapattinam">Nagapattinam</option>
            <option value="Namakkal">Namakkal</option>
            <option value="Nilgiris">Nilgiris</option>
            <option value="Perambalur">Perambalur</option>
            <option value="Pudukkottai">Pudukkottai</option>
            <option value="Ramanathapuram">Ramanathapuram</option>
            <option value="Ranipet">Ranipet</option>
            <option value="Salem">Salem</option>
            <option value="Sivaganga">Sivaganga</option>
            <option value="Tenkasi">Tenkasi</option>
            <option value="Thanjavur">Thanjavur</option>
            <option value="Theni">Theni</option>
            <option value="Thiruvallur">Thiruvallur</option>
            <option value="Thiruvarur">Thiruvarur</option>
            <option value="Thoothukudi">Thoothukudi</option>
            <option value="Tiruchirappalli">Tiruchirappalli</option>
            <option value="Tirunelveli">Tirunelveli</option>
            <option value="Tirupathur">Tirupathur</option>
            <option value="Tiruppur">Tiruppur</option>
            <option value="Tiruvannamalai">Tiruvannamalai</option>
            <option value="Vellore">Vellore</option>
            <option value="Viluppuram">Viluppuram</option>
            <option value="Virudhunagar">Virudhunagar</option>
            </select>
            {errors.location && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.location}</div>}
          </div>
        </div>
        {/* File upload section */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
            Upload Image <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ 
              padding: "8px 12px", 
              border: `1px solid ${errors.fileUpload ? '#dc2626' : '#cbd5e1'}`, 
              borderRadius: 6, 
              background: "#f8fafc", 
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}>
              Choose File
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { 
                const f = e.target.files?.[0]; 
                if (!f) { 
                  setFileObj(null); 
                  setFileName("No file chosen"); 
                  setPreviewUrl(""); 
                  setFileError(""); 
                  // Clear file upload error when no file selected
                  setErrors(prev => ({ ...prev, fileUpload: "" }));
                  return; 
                } 
                if (!f.type.startsWith("image/")) { 
                  setFileError("Please select an image file"); 
                  return; 
                } 
                if (f.size > 5 * 1024 * 1024) { 
                  setFileError("Max size 5MB"); 
                  return; 
                } 
                setFileError(""); 
                setFileObj(f); 
                setFileName(f.name); 
                const url = URL.createObjectURL(f); 
                setPreviewUrl(url); 
                // Clear file upload error when file is selected
                setErrors(prev => ({ ...prev, fileUpload: "" }));
                // Re-validate image URL field when file is uploaded
                if (touched.imageUrl) {
                  const error = validateImageUrl(imageUrl);
                  setErrors(prev => ({ ...prev, imageUrl: error }));
                }
              }} />
            </label>
            <span style={{ color: "#6b7280" }}>{fileName}</span>
          </div>
          {errors.fileUpload && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.fileUpload}</div>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
            Image URL (Optional)
          </label>
          <input 
            type="url" 
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)" 
            value={imageUrl} 
            onChange={(e) => { 
              handleFieldChange('imageUrl', e.target.value, validateImageUrl);
              setPreviewUrl(e.target.value || previewUrl); 
            }}
            onBlur={() => handleFieldBlur('imageUrl', validateImageUrl)}
            style={{
              ...inputStyle,
              borderColor: errors.imageUrl ? '#dc2626' : '#bcdffb'
            }}
          />
          {errors.imageUrl && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.imageUrl}</div>}
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Note: File upload above is required. Image URL is optional for additional reference.
          </div>
        </div>
        {fileError && <div style={{ color: "#b91c1c" }}>{fileError}</div>}
        {previewUrl && (
          <div style={{ marginTop: 8 }}>
            <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 8 }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" className="ghost" onClick={() => {
            if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lon: longitude });
                if (!location) setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
              },
              (err) => alert(err.message),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}>Use My Location</button>
          {coords.lat && <span style={{ color: "#566" }}>📍 {coords.lat.toFixed(5)}, {coords.lon?.toFixed(5)}</span>}
        </div>
        <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", padding: "10px 16px", background: submitting ? "#6b7280" : "#2f6f44", color: "#fff", border: 0, borderRadius: 6 }}>{submitting ? "Submitting..." : "Submit Issue"}</button>
      </form>
    </div>
  );
};

export default AddIssue;
