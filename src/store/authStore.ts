import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession } from '@/types/intake';
import { userService, assignmentService } from '@/services/backendApi';
import type { RegisterRequest } from '@/types/api';

interface AuthState {
  session: UserSession | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; hasAssignments?: boolean }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      
      login: async (email, password) => {
        try {
          const response = await userService.loginUser({ email, password });
          if ((response.success || response.message === "Login successful") && response.user) {
             // Check assignments for redirection logic
             let hasAssignments = false;
             try {
                const assignments = await assignmentService.getUserAssignments(response.user.user_id);
                hasAssignments = assignments.total_assignments > 0;
             } catch (e) {
                console.warn("Failed to fetch assignments during login", e);
             }

             set({
               session: {
                 userId: response.user.user_id,
                 username: response.user.name || response.user.email,
                 isLoggedIn: true,
                 createdAt: new Date().toISOString(),
               }
             });
             return { success: true, hasAssignments };
          }
          return { success: false, error: response.message || 'Login failed' };
        } catch (error: any) {
           // Handle axios errors
           let msg = 'Login failed';
           if (error.response?.data?.detail) {
              msg = typeof error.response.data.detail === 'string' 
                ? error.response.data.detail 
                : JSON.stringify(error.response.data.detail);
           }
           return { success: false, error: msg };
        }
      },
      
      register: async (data: RegisterRequest) => {
        try {
           const response = await userService.registerUser(data);
           if ((response.success || response.message === "User registered successfully") && response.user) {
             set({
               session: {
                 userId: response.user.user_id,
                 username: response.user.name || response.user.email,
                 isLoggedIn: true,
                 createdAt: new Date().toISOString(),
               }
             });
             return { success: true };
           }
           return { success: false, error: response.message || 'Registration failed' };
        } catch (error: any) {
           let msg = 'Registration failed';
           if (error.response?.data?.detail) {
              msg = typeof error.response.data.detail === 'string' 
                ? error.response.data.detail 
                : JSON.stringify(error.response.data.detail);
           }
           return { success: false, error: msg };
        }
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
