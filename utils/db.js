// Local IndexedDB Database Manager
const DB_NAME = 'WhatsAppCloneDB';
const DB_VERSION = 1;

class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Check if we're in browser environment
  isBrowser() {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  // Initialize Database
  async init() {
    // Check if already initialized
    if (this.isInitialized && this.db) {
      return this.db;
    }

    // Check if we're in browser environment
    if (!this.isBrowser()) {
      console.log('IndexedDB not available in this environment');
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Users Store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          usersStore.createIndex('username', 'username', { unique: true });
          usersStore.createIndex('email', 'email', { unique: false });
        }

        // Chats Store
        if (!db.objectStoreNames.contains('chats')) {
          const chatsStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
          chatsStore.createIndex('participants', 'participants', { unique: false, multiEntry: true });
        }

        // Messages Store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
          messagesStore.createIndex('chatId', 'chatId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Current User Store (for session management)
        if (!db.objectStoreNames.contains('currentUser')) {
          db.createObjectStore('currentUser', { keyPath: 'id' });
        }
      };
    });
  }

  // User Methods
  async createUser(username, password, email = '') {
    if (!this.db) {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');
    }
    
    const transaction = this.db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    
    const user = {
      username: username,
      password: password, // In production, this should be hashed
      email: email,
      photoURL: `https://ui-avatars.com/api/?name=${username}&background=25D366&color=fff`,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(user);
      request.onsuccess = () => resolve({ ...user, id: request.result });
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByUsername(username) {
    if (!this.db) {
      await this.init();
      if (!this.db) return null;
    }
    
    const transaction = this.db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const index = store.index('username');

    return new Promise((resolve, reject) => {
      const request = index.get(username);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers() {
    const transaction = this.db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchUsers(query) {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase())
    );
  }

  async updateUserLastSeen(userId) {
    const transaction = this.db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        if (user) {
          user.lastSeen = new Date().toISOString();
          const updateRequest = store.put(user);
          updateRequest.onsuccess = () => resolve(user);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('User not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Session Methods
  async setCurrentUser(user) {
    if (!this.db) {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');
    }
    
    const transaction = this.db.transaction(['currentUser'], 'readwrite');
    const store = transaction.objectStore('currentUser');

    return new Promise((resolve, reject) => {
      const request = store.put({ id: 'current', ...user });
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async getCurrentUser() {
    if (!this.db) {
      await this.init();
      if (!this.db) return null;
    }
    
    const transaction = this.db.transaction(['currentUser'], 'readonly');
    const store = transaction.objectStore('currentUser');

    return new Promise((resolve, reject) => {
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async logout() {
    if (!this.db) {
      await this.init();
      if (!this.db) return;
    }
    
    const transaction = this.db.transaction(['currentUser'], 'readwrite');
    const store = transaction.objectStore('currentUser');

    return new Promise((resolve, reject) => {
      const request = store.delete('current');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Chat Methods
  async createChat(userId1, userId2) {
    const transaction = this.db.transaction(['chats'], 'readwrite');
    const store = transaction.objectStore('chats');

    const chat = {
      participants: [userId1, userId2],
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: null,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(chat);
      request.onsuccess = () => resolve({ ...chat, id: request.result });
      request.onerror = () => reject(request.error);
    });
  }

  async getChatsByUserId(userId) {
    const transaction = this.db.transaction(['chats'], 'readonly');
    const store = transaction.objectStore('chats');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allChats = request.result;
        const userChats = allChats.filter(chat => 
          chat.participants.includes(userId)
        );
        resolve(userChats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getChatById(chatId) {
    const transaction = this.db.transaction(['chats'], 'readonly');
    const store = transaction.objectStore('chats');

    return new Promise((resolve, reject) => {
      const request = store.get(chatId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async chatExists(userId1, userId2) {
    const chats = await this.getChatsByUserId(userId1);
    return chats.find(chat => 
      chat.participants.includes(userId2)
    );
  }

  async updateChatLastMessage(chatId, message, timestamp) {
    const transaction = this.db.transaction(['chats'], 'readwrite');
    const store = transaction.objectStore('chats');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(chatId);
      getRequest.onsuccess = () => {
        const chat = getRequest.result;
        if (chat) {
          chat.lastMessage = message;
          chat.lastMessageTime = timestamp;
          const updateRequest = store.put(chat);
          updateRequest.onsuccess = () => resolve(chat);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Chat not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Message Methods
  async sendMessage(chatId, senderId, message) {
    const transaction = this.db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');

    const messageData = {
      chatId: chatId,
      senderId: senderId,
      message: message,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true,
    };

    return new Promise((resolve, reject) => {
      const request = store.add(messageData);
      request.onsuccess = async () => {
        const newMessage = { ...messageData, id: request.result };
        await this.updateChatLastMessage(chatId, message, messageData.timestamp);
        resolve(newMessage);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getMessagesByChatId(chatId) {
    const transaction = this.db.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const index = store.index('chatId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(chatId);
      request.onsuccess = () => {
        const messages = request.result.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markMessagesAsRead(chatId, currentUserId) {
    const messages = await this.getMessagesByChatId(chatId);
    const transaction = this.db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');

    const promises = messages
      .filter(msg => msg.senderId !== currentUserId && !msg.read)
      .map(msg => {
        return new Promise((resolve, reject) => {
          msg.read = true;
          const request = store.put(msg);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });

    return Promise.all(promises);
  }
}

// Export singleton instance
const db = new Database();
export default db;
