/**
 * =============================================================================
 * AUTHENTICATION CONTEXT
 * =============================================================================
 * Provides authentication state and methods throughout the application.
 *
 * This context handles:
 * - User authentication state (logged in/out)
 * - Token management (storage and retrieval)
 * - Login/Register/Logout operations
 * - Automatic redirect logic for protected routes
 *
 * INTEGRATION NOTES:
 * - Replace mock implementations in lib/api.ts with actual API calls
 * - Token is stored in localStorage for persistence
 * - User data is also cached in localStorage for quick access
 * =============================================================================
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, STORAGE_KEYS } from "@/lib/api";
import type { User } from "@/lib/types";

/**
 * Authentication context type
 * Defines all available auth state and methods
 */
interface AuthContextType {
  /** Currently authenticated user or null if not logged in */
  user: User | null;
  /** JWT/session token for API requests */
  token: string | null;
  /** Authenticates user with username and password */
  login: (username: string, password: string) => Promise<void>;
  /** Creates new user account and logs in */
  register: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  /** Logs out current user and clears session */
  logout: () => void;
  /** Refreshes user data from server */
  refreshUser: () => Promise<void>;
  /** True while checking authentication state on mount */
  isLoading: boolean;
}

/**
 * Authentication context instance
 * Use useAuth() hook to access this context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wrap your app with this provider to enable authentication throughout
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authApi.validateToken();
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (!token && !isAuthPage) {
      router.push("/login");
    } else if (token && isAuthPage) {
      router.push("/boards");
    }
  }, [token, pathname, isLoading]);

  /**
   * Logs in user with username and password
   * On success: stores token and user data, redirects to boards page
   *
   * @param username - User's username
   * @param password - User's password
   * @throws Error if authentication fails
   */
  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    setToken(response.token);

    const userData = await authApi.validateToken();
    if (userData) {
      setUser(userData);
    }

    router.push("/boards");
  };

  /**
   * Registers a new user account
   * On success: automatically logs in and redirects to boards page
   *
   * @param name - User's full name
   * @param username - User's username
   * @param email - User's email address
   * @param password - User's password
   * @throws Error if registration fails
   */
  const register = async (
    name: string,
    username: string,
    email: string,
    password: string
  ) => {
    const response = await authApi.register({
      name,
      username,
      email,
      password,
    });

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    setToken(response.token);

    if (response.user) {
      setUser(response.user);
    } else {
      const userData = await authApi.validateToken();
      if (userData) {
        setUser(userData);
      }
    }

    router.push("/boards");
  };

  /**
   * Logs out the current user
   * Clears all stored authentication data and redirects to login
   */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    setToken(null);
    setUser(null);

    router.push("/login");
  };

  /**
   * Refreshes user data from the server
   * Useful when user data may have changed (e.g., after creating a board)
   */
  const refreshUser = async () => {
    try {
      const userData = await authApi.validateToken();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Erro ao refrescar usuário:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, refreshUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 *
 * @returns Authentication context with user, token, and auth methods
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * const { user, login, logout } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
