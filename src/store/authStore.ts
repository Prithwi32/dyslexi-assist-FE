import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession } from '@/types/intake';

interface AuthState {
  session: UserSession | null;
  users: Record<string, { passwordHash: string; userId: string }>;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Simple hash function for MVP (not for production!)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      users: {},
      
      login: (username: string, password: string) => {
        const { users } = get();
        const user = users[username.toLowerCase()];
        
        if (!user) {
          return { success: false, error: 'Username not found. Please check your spelling or create an account.' };
        }
        
        if (user.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'The password does not match. Please try again.' };
        }
        
        set({
          session: {
            userId: user.userId,
            username: username.toLowerCase(),
            isLoggedIn: true,
            createdAt: new Date().toISOString(),
          }
        });
        
        return { success: true };
      },
      
      register: (username: string, password: string) => {
        const { users } = get();
        const normalizedUsername = username.toLowerCase();
        
        if (users[normalizedUsername]) {
          return { success: false, error: 'This username is already taken. Please choose another.' };
        }
        
        if (username.length < 3) {
          return { success: false, error: 'Username should be at least 3 characters long.' };
        }
        
        if (password.length < 4) {
          return { success: false, error: 'Password should be at least 4 characters long.' };
        }
        
        const userId = crypto.randomUUID();
        
        set({
          users: {
            ...users,
            [normalizedUsername]: {
              passwordHash: simpleHash(password),
              userId,
            }
          },
          session: {
            userId,
            username: normalizedUsername,
            isLoggedIn: true,
            createdAt: new Date().toISOString(),
          }
        });
        
        return { success: true };
      },
      
      logout: () => {
        set({ session: null });
      },
      
      isAuthenticated: () => {
        const { session } = get();
        return session?.isLoggedIn === true;
      },
    }),
    {
      name: 'dyslexi-assist-auth',
    }
  )
);
