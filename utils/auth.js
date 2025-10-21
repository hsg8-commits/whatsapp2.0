// Local Authentication System
import db from './db';

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    try {
      await db.init();
      this.currentUser = await db.getCurrentUser();
      return this.currentUser;
    } catch (error) {
      console.error('Auth initialization error:', error);
      return null;
    }
  }

  async register(username, password, email = '') {
    try {
      // Validate username
      if (!username || username.trim().length < 3) {
        return { success: false, error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
      }

      // Validate password
      if (!password || password.length < 6) {
        return { success: false, error: 'كلمة السر يجب أن تكون 6 أحرف على الأقل' };
      }

      // Check if username already exists
      const existingUser = await db.getUserByUsername(username.trim());
      if (existingUser) {
        return { success: false, error: 'اسم المستخدم موجود بالفعل' };
      }

      // Create user
      const user = await db.createUser(username.trim(), password, email);
      
      // Set as current user
      await db.setCurrentUser(user);
      this.currentUser = user;

      console.log('User registered successfully:', username);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.' };
    }
  }

  async login(username, password) {
    try {
      // Validate inputs
      if (!username || !password) {
        return { success: false, error: 'يرجى إدخال اسم المستخدم وكلمة السر' };
      }

      // Get user by username
      const user = await db.getUserByUsername(username.trim());

      if (!user) {
        return { success: false, error: 'اسم المستخدم غير موجود' };
      }

      // Check password
      if (user.password !== password) {
        return { success: false, error: 'كلمة السر غير صحيحة' };
      }

      // Update last seen
      await db.updateUserLastSeen(user.id);

      // Set as current user
      await db.setCurrentUser(user);
      this.currentUser = user;

      console.log('User logged in successfully:', username);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.' };
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
