// Local Authentication System
import db from './db';

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    await db.init();
    this.currentUser = await db.getCurrentUser();
    return this.currentUser;
  }

  async register(username, password, email = '') {
    try {
      // Check if username already exists
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Validate username
      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create user
      const user = await db.createUser(username, password, email);
      
      // Set as current user
      await db.setCurrentUser(user);
      this.currentUser = user;

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async login(username, password) {
    try {
      // Get user by username
      const user = await db.getUserByUsername(username);

      if (!user) {
        throw new Error('Username not found');
      }

      // Check password
      if (user.password !== password) {
        throw new Error('Incorrect password');
      }

      // Update last seen
      await db.updateUserLastSeen(user.id);

      // Set as current user
      await db.setCurrentUser(user);
      this.currentUser = user;

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await db.logout();
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    this.currentUser = await db.getCurrentUser();
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null && this.currentUser !== undefined;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
