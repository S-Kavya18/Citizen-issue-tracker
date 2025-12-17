import React from 'react';
import Profile from './pages/Profile';
import './index.css';

// Mock user data for preview - Complete profile
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'volunteer',
  district: 'Downtown District',
  phone: '+1 (555) 123-4567',
  skills: 'Community organizing, event planning, first aid, environmental cleanup, youth mentoring',
  availability: 'Weekends and evenings after 6 PM. Available for emergency response 24/7.',
  experience: 'I have been volunteering in my community for over 5 years. I have experience organizing neighborhood cleanup events, coordinating food drives, and mentoring at-risk youth. I am certified in CPR and first aid.',
  transportation: 'car',
  createdAt: '2023-01-15T10:30:00Z',
  updatedAt: '2024-01-10T14:22:00Z',
  verified: true
};

// Mock user data for incomplete profile demo
const mockIncompleteUser = {
  id: 2,
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  role: 'volunteer',
  district: 'Uptown District',
  phone: '', // Missing
  skills: '', // Missing
  availability: '', // Missing
  experience: '', // Missing
  transportation: '', // Missing
  createdAt: '2024-01-01T10:30:00Z',
  updatedAt: '2024-01-15T14:22:00Z',
  verified: false
};

const mockUserStats = {
  issuesResolved: 23,
  activeIssues: 3,
  rating: 4.8,
  totalContributions: 47,
  issuesSubmitted: 8,
  feedbackGiven: 15
};

// Mock localStorage for preview
const mockLocalStorage = {
  getItem: (key) => {
    if (key === 'token') return 'mock-token-123';
    if (key === 'user') return JSON.stringify(mockUser);
    return null;
  },
  setItem: () => {},
  removeItem: () => {}
};

// Mock fetch for preview
const mockFetch = (url, options) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes('/profile/stats')) {
        resolve({
          ok: true,
          json: () => Promise.resolve(mockUserStats)
        });
      } else if (url.includes('/profile')) {
        if (options?.method === 'PUT') {
          const updatedUser = { ...mockUser, ...JSON.parse(options.body) };
          resolve({
            ok: true,
            json: () => Promise.resolve(updatedUser)
          });
        } else {
          // Use complete profile by default to show completion badge
          resolve({
            ok: true,
            json: () => Promise.resolve(mockUser)
          });
        }
      }
    }, 500);
  });
};

// Override global objects for preview
if (typeof window !== 'undefined') {
  window.localStorage = mockLocalStorage;
  window.fetch = mockFetch;
}

const App = () => {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <Profile />
    </div>
  );
};

export default App;