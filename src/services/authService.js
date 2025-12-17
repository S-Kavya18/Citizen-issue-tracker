import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

class AuthService {
  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        error: error.message
      };
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password, additionalData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with additional data
      if (additionalData.displayName) {
        await userCredential.user.updateProfile({
          displayName: additionalData.displayName
        });
      }

      return {
        success: true,
        user: userCredential.user,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        error: error.message
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      console.log('🔥 Starting Google sign-in...');
      console.log('🔍 Auth object:', auth);
      console.log('🔍 Google provider:', googleProvider);
      console.log('🔍 Current user before sign-in:', auth.currentUser);
      
      // Check if user is already signed in by checking localStorage
      const existingUser = localStorage.getItem('user');
      const existingToken = localStorage.getItem('token');
      
      if (existingUser && existingToken) {
        console.log('⚠️ User already signed in (from localStorage)');
        return {
          success: false,
          user: null,
          error: 'User is already signed in. Please sign out first.'
        };
      }

      console.log('📱 Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('✅ Google sign-in successful:', user.email);
      console.log('👤 User details:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      });
      
      // Create user data object
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      };

      return {
        success: true,
        user: userData,
        firebaseUser: user, // Keep the actual Firebase user for token generation
        error: null
      };
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/configuration-not-found') {
        return {
          success: false,
          user: null,
          error: 'Firebase Authentication is not configured. Please enable it in Firebase Console.'
        };
      } else if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          user: null,
          error: 'Sign-in was cancelled. Please try again.'
        };
      } else if (error.code === 'auth/popup-blocked') {
        return {
          success: false,
          user: null,
          error: 'Popup was blocked by browser. Please allow popups and try again.'
        };
      } else if (error.code === 'auth/cancelled-popup-request') {
        return {
          success: false,
          user: null,
          error: 'Sign-in was cancelled. Please wait a moment and try again.'
        };
      } else if (error.code === 'auth/network-request-failed') {
        return {
          success: false,
          user: null,
          error: 'Network error. Please check your internet connection and try again.'
        };
      } else if (error.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          user: null,
          error: 'Google sign-in is not enabled. Please enable it in Firebase Console.'
        };
      } else if (error.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          user: null,
          error: 'This domain is not authorized for Google sign-in. Please add localhost to authorized domains in Firebase Console.'
        };
      }
      
      return {
        success: false,
        user: null,
        error: error.message || 'Google sign-in failed'
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      console.log('🚪 Signing out user...');
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      console.log('✅ User signed out successfully');
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear authentication state (for debugging)
  clearAuthState() {
    console.log('🧹 Clearing authentication state...');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ Authentication state cleared');
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get user token
  async getUserToken() {
    try {
      const user = auth.currentUser;
      if (user) {
        // Use getIdToken function with the user object
        const token = await getIdToken(user);
        return {
          success: true,
          token: token,
          error: null
        };
      } else {
        return {
          success: false,
          token: null,
          error: 'No user logged in'
        };
      }
    } catch (error) {
      console.error('Error getting user token:', error);
      return {
        success: false,
        token: null,
        error: error.message
      };
    }
  }

  // Check if user needs role selection
  async checkRoleSelection(user) {
    try {
      console.log('🔍 Checking if role selection is needed...');
      
      const response = await fetch('/api/firebase-auth/check-role-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Role check successful:', data);
        return {
          success: true,
          needsRoleSelection: data.needsRoleSelection,
          existingUser: data.user,
          error: null
        };
      } else {
        const errorData = await response.json();
        console.error('❌ Role check failed:', errorData);
        return {
          success: false,
          needsRoleSelection: false,
          existingUser: null,
          error: errorData.error || 'Failed to check role selection'
        };
      }
    } catch (error) {
      return {
        success: false,
        needsRoleSelection: false,
        existingUser: null,
        error: error.message
      };
    }
  }

  // Sync user with backend
  async syncUserWithBackend(user, selectedRole = null) {
    try {
      console.log('🔄 Syncing user with backend...');
      const token = await getIdToken(user);
      console.log('🎫 Got Firebase token');

      const response = await fetch('/api/firebase-auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          selectedRole: selectedRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend sync successful:', data);
        return {
          success: true,
          data: data,
          error: null
        };
      } else {
        const errorData = await response.json();
        console.error('❌ Backend sync failed:', errorData);
        return {
          success: false,
          data: null,
          error: errorData.error || 'Failed to sync with backend'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }
}

export default new AuthService();
