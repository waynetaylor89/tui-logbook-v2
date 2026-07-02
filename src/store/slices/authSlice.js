import { hashPassword } from "../authSecurity.js";
import { registerBiometric, authenticateWithBiometric, isWebAuthnSupported } from "../webAuthn.js";

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

const isLegacyPasswordMatch = (record, password) => record?.password && record.password === password;

export const createAuthSlice = (set, get) => ({
  users: {},
  currentUser: null,
  hasHydrated: false,

  setUsers: (users) => set({ users }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setHasHydrated: (value) => set({ hasHydrated: value }),

  login: async (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      set({ currentUser: username });
      return true;
    }

    const users = get().users;
    const record = users[username];
    if (!record) return false;

    if (record.passwordHash) {
      const attemptedHash = await hashPassword(password);
      if (attemptedHash === record.passwordHash) {
        set({ currentUser: username });
        return true;
      }
      return false;
    }

    // Legacy plaintext fallback from older persisted data, upgraded immediately.
    if (isLegacyPasswordMatch(record, password)) {
      const passwordHash = await hashPassword(password);
      set({
        users: {
          ...users,
          [username]: { passwordHash },
        },
        currentUser: username,
      });
      return true;
    }

    return false;
  },

  logout: () => set({ currentUser: null }),

  register: async (username, password) => {
    const users = get().users;
    if (users[username]) return false;
    const passwordHash = await hashPassword(password);
    set({ users: { ...users, [username]: { passwordHash, notificationPreferences: { enabled: true, periodDays: 7 }, darkMode: false } } });
    return true;
  },

  recoverPassword: () => null,

  listUsernames: () => Object.keys(get().users).filter(Boolean),

  deleteUser: (username) => {
    if (!username || username === ADMIN_USERNAME) return;
    const users = get().users;
    const history = get().history;
    const updatedUsers = { ...users };
    delete updatedUsers[username];
    const updatedHistory = { ...history };
    delete updatedHistory[username];
    set({ users: updatedUsers, history: updatedHistory });
  },

  resetUserPassword: async (username, newPassword) => {
    if (!username || !newPassword) return false;
    const users = get().users;
    if (!users[username]) return false;
    const passwordHash = await hashPassword(newPassword);
    set({
      users: {
        ...users,
        [username]: { passwordHash },
      },
    });
    return true;
  },

  isBiometricSupported: () => isWebAuthnSupported(),

  registerBiometric: async (username) => {
    if (!isWebAuthnSupported()) {
      throw new Error('Biometric authentication is not supported on this device');
    }

    const users = get().users;
    if (!users[username]) {
      throw new Error('User does not exist');
    }

    try {
      const credential = await registerBiometric(username);
      set({
        users: {
          ...users,
          [username]: {
            ...users[username],
            biometricCredential: credential,
          },
        },
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  loginWithBiometric: async (username) => {
    if (!isWebAuthnSupported()) {
      throw new Error('Biometric authentication is not supported on this device');
    }

    const users = get().users;
    const record = users[username];
    if (!record || !record.biometricCredential) {
      throw new Error('No biometric credential registered for this user');
    }

    try {
      await authenticateWithBiometric(record.biometricCredential.credentialId);
      set({ currentUser: username });
      return true;
    } catch (error) {
      throw error;
    }
  },

  hasBiometricCredential: (username) => {
    const users = get().users;
    return !!(users[username] && users[username].biometricCredential);
  },

  deleteBiometricCredential: (username) => {
    const users = get().users;
    if (!users[username] || !users[username].biometricCredential) {
      return false;
    }
    const { biometricCredential, ...rest } = users[username];
    set({
      users: {
        ...users,
        [username]: rest,
      },
    });
    return true;
  },

  updateNotificationPreferences: (username, preferences) => {
    const users = get().users;
    if (!users[username]) return false;
    set({
      users: {
        ...users,
        [username]: {
          ...users[username],
          notificationPreferences: {
            ...users[username].notificationPreferences,
            ...preferences,
          },
        },
      },
    });
    return true;
  },

  getNotificationPreferences: (username) => {
    const users = get().users;
    if (!users[username]) return { enabled: true, periodDays: 7 };
    return users[username].notificationPreferences || { enabled: true, periodDays: 7 };
  },

  toggleDarkMode: (username) => {
    const users = get().users;
    if (!users[username]) return false;
    set({
      users: {
        ...users,
        [username]: {
          ...users[username],
          darkMode: !users[username].darkMode,
        },
      },
    });
    return true;
  },

  getDarkMode: (username) => {
    const users = get().users;
    if (!users[username]) return false;
    return users[username].darkMode || false;
  },

  isAdmin: (username) => {
    return username === ADMIN_USERNAME;
  },
});
