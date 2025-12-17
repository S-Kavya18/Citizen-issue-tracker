// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEm9ifn_LsWLeAYBBCAg2FoDBRre-2AZQ",
  authDomain: "civix-472418.firebaseapp.com",
  projectId: "civix-472418",
  storageBucket: "civix-472418.firebasestorage.app",
  messagingSenderId: "48220649187",
  appId: "1:48220649187:web:4dafafb0d2726bf73cb7d6",
  measurementId: "G-Y0NQ2K24C8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Check if authentication is properly configured (single, correct usage)
auth.onAuthStateChanged(
  (user) => {
    if (user) {
      console.log('✅ Firebase Auth is working properly');
    } else {
      console.log('ℹ️ No user is currently signed in');
    }
  },
  (error) => {
    if (error && error.code === 'auth/configuration-not-found') {
      console.error('❌ Firebase Authentication not configured. Enable the chosen provider in Firebase Console.');
    } else if (error) {
      console.error('❌ Firebase Auth Error:', error.code, error.message);
    }
  }
);

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add additional configuration to prevent popup issues
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Additional debugging
console.log('🔥 Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing'
});

console.log('🔍 Google Provider configured:', {
  providerId: googleProvider.providerId,
  scopes: googleProvider.getScopes()
});

export default app;
