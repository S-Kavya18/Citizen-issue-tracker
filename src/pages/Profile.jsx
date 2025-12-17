import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';
import Alert from '../components/ui/Alert/Alert';
import ProfileHeader from '../components/Profile/ProfileHeader/ProfileHeader';
import ProfileCompletion from '../components/Profile/ProfileCompletion/ProfileCompletion';
import ProfileCompletionBadge from '../components/Profile/ProfileCompletionBadge/ProfileCompletionBadge';
import ProfileForm from '../components/Profile/ProfileForm/ProfileForm';
import ProfileStats from '../components/Profile/ProfileStats/ProfileStats';
import LoadingSpinner from '../components/Profile/LoadingSpinner/LoadingSpinner';
import styles from './Profile.module.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      if (!token) {
        console.log('No token found, navigating to /login');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditForm(userData);
      } else if (response.status === 401) {
        console.log('Received 401 status, removing token and navigating to /login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        console.log('Response status:', response.status);
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/auth/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateMessage('');
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user);
    setUpdateMessage('');
    setError('');
  };

  const handleSave = async () => {
    // Client-side validation before submitting
    const requiredFields = getRequiredFields(user.role);
    const missingFields = requiredFields.filter(
      (field) => !editForm[field] || (typeof editForm[field] === 'string' && editForm[field].trim() === '')
    );
    if (missingFields.length > 0) {
      setError(
        'Please fill in all required fields: ' + missingFields.map(getFieldDisplayName).join(', ')
      );
      return;
    }

    // Additional validation example: phone number for volunteers
    if (user.role === 'volunteer' && editForm.phone) {
      const trimmed = String(editForm.phone).trim();
      const digits = trimmed.replace(/[^\d]/g, '');
      const phoneRegex = /^[+]?([1-9][\d\s\-()]{8,20})$/;
      if (!phoneRegex.test(trimmed) || digits.length < 10 || digits.length > 15) {
        setError('Please enter a valid phone number.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        setUpdateMessage('Profile updated successfully!');
        // Update localStorage user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to connect to server');
    }
  };

  // OTP helpers for phone verification (for existing volunteers)
  const requestOtp = async () => {
    try {
      setOtpStatus('');
      const token = localStorage.getItem('token');
      const phone = (isEditing ? editForm.phone : user?.phone) || '';
      const trimmed = String(phone).trim();
      const digits = trimmed.replace(/[^\d]/g, '');
      const phoneRegex = /^[+]?([1-9][\d\s\-()]{8,20})$/;
      if (!trimmed || !phoneRegex.test(trimmed) || digits.length < 10 || digits.length > 15) {
        setOtpStatus('Enter a valid phone number in the Profile');
        return;
      }
      const res = await fetch('http://localhost:5000/volunteers/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ channel: 'phone', destination: trimmed })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpStatus('OTP sent to your phone (valid 5 minutes).');
      } else {
        setOtpStatus(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      setOtpStatus('Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifying(true);
      setOtpStatus('');
      const token = localStorage.getItem('token');
      const phone = (isEditing ? editForm.phone : user?.phone) || '';
      const trimmed = String(phone).trim();
      const res = await fetch('http://localhost:5000/volunteers/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ channel: 'phone', destination: trimmed, code: otpCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpStatus('✅ Phone verified');
        const updated = { ...(user || {}), phone_verified: true, phone: trimmed };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } else {
        setOtpStatus(data.error || 'Invalid or expired OTP');
      }
    } catch (e) {
      setOtpStatus('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Profile completion functions
  const getRequiredFields = (role) => {
    const baseFields = ['name', 'district'];
    
    if (role === 'volunteer') {
      return [
        ...baseFields,
        'phone',
        'skills',
        'availability',
        'experience',
        'transportation'
      ];
    }
    
    return baseFields;
  };

  const checkProfileCompletion = (userData) => {
    if (!userData) return { isComplete: false, missingFields: [], completionPercentage: 0 };
    
    const requiredFields = getRequiredFields(userData.role);
    const missingFields = [];
    let filledFields = 0;

    requiredFields.forEach(field => {
      if (!userData[field] || userData[field].trim() === '') {
        missingFields.push(field);
      } else {
        filledFields++;
      }
    });

    const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    return {
      isComplete,
      missingFields,
      completionPercentage,
      totalFields: requiredFields.length,
      filledFields
    };
  };

  const getFieldDisplayName = (field) => {
    const fieldNames = {
      name: 'Full Name',
      district: 'District/Area',
      phone: 'Phone Number',
      skills: 'Skills & Expertise',
      availability: 'Availability',
      experience: 'Experience Description',
      transportation: 'Transportation Method'
    };
    return fieldNames[field] || field;
  };

  const handleCompleteProfile = () => {
    setIsEditing(true);
    setUpdateMessage('Please fill in the required fields to complete your profile.');
  };

  const profileCompletion = user ? checkProfileCompletion(user) : null;

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className={styles.profileContainer}>
        <Alert variant="error">
          Failed to load profile data
        </Alert>
      </div>
    );
  }

  const isVolunteer = user.role === 'volunteer';

  return (
    <div className={styles.profileContainer}>
      <ProfileHeader user={user} />

      <ProfileCompletionBadge
        profileCompletion={profileCompletion}
        isVolunteer={isVolunteer}
      />

      <ProfileCompletion
        profileCompletion={profileCompletion}
        isVolunteer={isVolunteer}
        onCompleteProfile={handleCompleteProfile}
        getFieldDisplayName={getFieldDisplayName}
      />

      {/* Messages */}
      {updateMessage && (
        <Alert variant="success">
          {updateMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className={styles.profileContent}>
        {/* Main Profile Information */}
        <Card className={styles.profileCard}>
          <Card.Header>
            <Card.Title>Profile Information</Card.Title>
            {!isEditing && (
              <Button onClick={handleEdit} size="small">
                ✏️ Edit Profile
              </Button>
            )}
          </Card.Header>
          
          <Card.Content>
            {user?.role === 'volunteer' && !user?.phone_verified && (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fdba74',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>
                  📱 Verify your phone number
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={requestOtp}>
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.slice(0,6))}
                    placeholder="Enter OTP"
                    style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                  />
                  <Button onClick={verifyOtp} disabled={!otpSent || verifying}>
                    {verifying ? 'Verifying...' : 'Verify'}
                  </Button>
                  {otpStatus && (
                    <span style={{ fontSize: 12, color: otpStatus.startsWith('✅') ? '#065f46' : '#9a3412' }}>{otpStatus}</span>
                  )}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#7c2d12' }}>
                  Use the Phone field below to set/update your number, then request OTP.
                </div>
              </div>
            )}
            <ProfileForm
              user={user}
              editForm={editForm}
              isEditing={isEditing}
              profileCompletion={profileCompletion}
              onInputChange={handleInputChange}
            />
          </Card.Content>

          {isEditing && (
            <Card.Actions>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </Card.Actions>
          )}
        </Card>

        {/* Profile Statistics */}
        <div className={styles.sidebar}>
          <ProfileStats user={user} userStats={userStats} />
        </div>
      </div>
    </div>
  );
};

export default Profile;