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

// -----------------------------------------------------------------------------
// Context Type Definition
// -----------------------------------------------------------------------------

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
  /** True while checking authentication state on mount */
  isLoading: boolean;
}

// -----------------------------------------------------------------------------
// Context Creation
// -----------------------------------------------------------------------------

/**
 * Authentication context instance
 * Use useAuth() hook to access this context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------------------------------------
// Provider Component
// -----------------------------------------------------------------------------

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
  // State for user data and authentication token
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation hooks
  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Initialize auth state from localStorage on mount
  // ---------------------------------------------------------------------------
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
          // Token is invalid, clear it
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ---------------------------------------------------------------------------
  // Handle redirect logic based on authentication state
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === "/login" || pathname === "/register";

    // Redirect to login if accessing protected route while not authenticated
    if (!token && !isAuthPage) {
      router.push("/login");
    }
    // Redirect to boards if accessing auth pages while already authenticated
    else if (token && isAuthPage) {
      router.push("/boards");
    }
  }, [token, pathname, isLoading]);

  // ---------------------------------------------------------------------------
  // Authentication Methods
  // ---------------------------------------------------------------------------

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

    // Store authentication token
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    setToken(response.token);

    // Fetch user data
    const userData = await authApi.validateToken();
    if (userData) {
      setUser(userData);
    }

    // Navigate to boards selection
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

    // Store authentication token
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    setToken(response.token);

    // Fetch user data
    const userData = await authApi.validateToken();
    if (userData) {
      setUser(userData);
    }
    setUser(response.user);

    // Navigate to boards selection
    router.push("/boards");
  };

  /**
   * Logs out the current user
   * Clears all stored authentication data and redirects to login
   */
  const logout = () => {
    // Clear stored token
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to login page
    router.push("/login");
  };

  // ---------------------------------------------------------------------------
  // Render Provider
  // ---------------------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Hook for consuming auth context
// -----------------------------------------------------------------------------

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
