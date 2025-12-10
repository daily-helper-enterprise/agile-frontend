/**
 * =============================================================================
 * API SERVICE LAYER
 * =============================================================================
 * Centralized API service for all backend communications.
 *
 * This file provides a clean abstraction layer between the UI components and
 * the backend API. All API calls should go through this service to ensure:
 * - Consistent error handling
 * - Centralized authentication token management
 * - Easy migration between mock data and real API
 * - Type-safe request/response handling
 *
 * INTEGRATION GUIDE:
 * 1. Update API_BASE_URL with your actual API endpoint
 * 2. Implement each method's TODO section with actual API calls
 * 3. Ensure response data matches the expected types or add mappers
 * 4. Handle authentication token refresh if needed
 * =============================================================================
 */

import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  Board,
  CreateBoardPayload,
  Card,
  CreateCardPayload,
  UpdateCardPayload,
  BoardData,
  TeamMember,
  AddMemberPayload,
  PerformanceMetrics,
  BlockerStats,
} from "./types";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

/**
 * Base URL for API requests
 * TODO: Replace with your actual API endpoint
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Storage keys for localStorage
 * These can be used to customize where auth data is stored
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  BOARDS: "boards",
  BOARD_DATA_PREFIX: "board_data_",
} as const;

// -----------------------------------------------------------------------------
// HTTP Client Utilities
// -----------------------------------------------------------------------------

/**
 * Gets the authentication token from localStorage
 * @returns The stored auth token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Creates headers for authenticated API requests
 * Automatically includes the Authorization header if a token exists
 * @returns Headers object for fetch requests
 */
function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Generic API request handler with error handling
 * @param endpoint - API endpoint (relative to API_BASE_URL)
 * @param options - Fetch options (method, body, etc.)
 * @returns Parsed JSON response
 * @throws Error with message from API or generic error message
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Attempt to parse error message from response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle 204 No Content responses
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    // Re-throw API errors, wrap network errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
}

// -----------------------------------------------------------------------------
// Authentication API
// -----------------------------------------------------------------------------

/**
 * Authentication-related API methods
 */
export const authApi = {
  /**
   * Authenticates a user with email and password
   *
   * TODO: Replace mock implementation with actual API call:
   * ```typescript
   * return apiRequest<AuthResponse>('/auth/login', {
   *   method: 'POST',
   *   body: JSON.stringify(credentials),
   * })
   * ```
   *
   * @param credentials - Login credentials (email, password)
   * @returns Authentication response with token and user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Registers a new user account
   *
   * TODO: Replace mock implementation with actual API call:
   * ```typescript
   * return apiRequest<AuthResponse>('/auth/register', {
   *   method: 'POST',
   *   body: JSON.stringify(payload),
   * })
   * ```
   *
   * @param payload - Registration data (name, email, password)
   * @returns Authentication response with token and user data
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Validates an existing token and returns user data
   *
   * TODO: Implement token validation with your API:
   * ```typescript
   * return apiRequest<User>('/auth/me')
   * ```
   *
   * @returns User data if token is valid
   */
  async validateToken(): Promise<User | null> {
    try {
      return await apiRequest<User>("/members/me");
    } catch {
      return null;
    }
  },

  /**
   * Logs out the current user
   *
   * TODO: If your API requires logout notification:
   * ```typescript
   * await apiRequest('/auth/logout', { method: 'POST' })
   * ```
   */
  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },
};

// -----------------------------------------------------------------------------
// Boards API
// -----------------------------------------------------------------------------

/**
 * Board-related API methods
 */
export const boardsApi = {
  /**
   * Gets a single board by ID
   *
   * @param boardId - The board's unique identifier
   * @returns Board data or null if not found
   */
  async getBoard(boardId: string): Promise<Board | null> {
    try {
      return await apiRequest<Board>(`/teams/${boardId}`);
    } catch {
      return null;
    }
  },

  /**
   * Creates a new board with the current user as Scrum Master
   *
   * TODO: Replace with actual API call:
   * ```typescript
   * return apiRequest<Board>('/boards', {
   *   method: 'POST',
   *   body: JSON.stringify(payload),
   * })
   * ```
   *
   * @param payload - Board creation data
   * @param user - Current user (will be set as Scrum Master)
   * @returns The newly created board
   */
  async createBoard(payload: CreateBoardPayload): Promise<Board> {
    return apiRequest<Board>("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Deletes a board (Scrum Master only)
   *
   * TODO: Replace with actual API call:
   * ```typescript
   * await apiRequest(`/boards/${boardId}`, { method: 'DELETE' })
   * ```
   *
   * @param boardId - The board to delete
   */
  async deleteBoard(boardId: string): Promise<void> {
    await apiRequest(`/boards/${boardId}`, {
      method: "DELETE",
    });
  },
};

// -----------------------------------------------------------------------------
// Cards API
// -----------------------------------------------------------------------------

/**
 * Card/task-related API methods
 */
export const cardsApi = {
  /**
   * Fetches all cards for a specific board within a date range
   *
   * @param boardId - The board to fetch cards for
   * @param startDate - Start date for filtering (ISO string)
   * @param endDate - End date for filtering (ISO string)
   * @returns Board data with cards organized by column
   */
  async getCards(
    boardId: string,
    startDate: string,
    endDate: string
  ): Promise<BoardData> {
    const cards = await apiRequest<Card[]>(`/teams/${boardId}/entries`, {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
      }),
    });
    console.log(cards);
    // Transform flat array into BoardData structure based on status
    return {
      done: cards.filter((card) => card.type === "WHAT_I_DID_YESTERDAY"),
      willDo: cards.filter((card) => card.type === "WHAT_I_PRETEND_TO_DO"),
      blockers: cards.filter((card) => card.type === "WHAT_I_DID_TODAY"),
    };
  },

  /**
   * Creates a new card on the board
   *
   * TODO: Replace with actual API call:
   * ```typescript
   * return apiRequest<Card>(`/boards/${payload.boardId}/cards`, {
   *   method: 'POST',
   *   body: JSON.stringify(payload),
   * })
   * ```
   *
   * @param payload - Card creation data
   * @param user - Current user (card creator)
   * @returns The newly created card
   */
  async createCard(payload: CreateCardPayload, user: User): Promise<Card> {
    return apiRequest<Card>("/entries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Updates an existing card
   *
   * @param boardId - The board containing the card
   * @param column - The column containing the card
   * @param payload - Update data
   * @returns The updated card
   */
  async updateCard(cardId: number, payload: UpdateCardPayload): Promise<Card> {
    return apiRequest<Card>(`/entries/${cardId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Deletes a card from the board
   *
   * TODO: Replace with actual API call:
   * ```typescript
   * await apiRequest(`/cards/${cardId}`, { method: 'DELETE' })
   * ```
   *
   * @param boardId - The board containing the card
   * @param column - The column containing the card
   * @param cardId - The card to delete
   */
  async deleteCard(
    boardId: string,
    column: string,
    cardId: number
  ): Promise<void> {
    await apiRequest(`/entries/${cardId}`, {
      method: "DELETE",
    });
  },
};

// -----------------------------------------------------------------------------
// Team API
// -----------------------------------------------------------------------------

/**
 * Team member management API methods
 */
export const teamApi = {
  /**
   * Gets all members of a board
   *
   * @param boardId - The board to get members for
   * @returns Array of team members
   */
  async getMembers(boardId: string): Promise<TeamMember[]> {
    return apiRequest<TeamMember[]>(`/teams/${boardId}`);
  },

  /**
   * Adds a new member to a board (Scrum Master only)
   *
   * @param payload - Member addition data
   * @returns The newly added team member
   */
  async addMember(payload: AddMemberPayload): Promise<TeamMember> {
    return apiRequest<TeamMember>(
      `/teams/${payload.boardId}/members/${payload.memberId}`,
      {
        method: "POST",
      }
    );
  },

  /**
   * Removes a member from a board (Scrum Master only)
   *
   * @param boardId - The board to remove the member from
   * @param memberId - ID of the member to remove
   */
  async removeMember(boardId: number, memberId: number): Promise<void> {
    await apiRequest(`/teams/${boardId}/members/${memberId}`, {
      method: "DELETE",
    });
  },
};

// -----------------------------------------------------------------------------
// Analytics API
// -----------------------------------------------------------------------------

/**
 * Performance and analytics API methods
 */
export const analyticsApi = {
  /**
   * Gets blocker statistics for a board within a date range
   *
   * TODO: Replace with actual API call:
   * ```typescript
   * return apiRequest<BlockerStats>(`/boards/${boardId}/analytics/blockers`, {
   *   method: 'POST',
   *   body: JSON.stringify({ startDate, endDate }),
   * })
   * ```
   *
   * @param boardId - The board to get stats for
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Blocker statistics
   */
  async getBlockerStats(
    boardId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BlockerStats> {
    // MOCK IMPLEMENTATION
    return {
      total: 10,
      resolved: 7,
      unresolved: 3,
    };
  },

  /**
   * Gets performance metrics for a board within a date range
   *
   * TODO: Replace with actual API call:
   * ```typescript
   * return apiRequest<PerformanceMetrics>(`/boards/${boardId}/analytics/performance`, {
   *   method: 'POST',
   *   body: JSON.stringify({ startDate, endDate }),
   * })
   * ```
   *
   * @param boardId - The board to get metrics for
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Performance metrics including tasks per day and blocker stats
   */
  async getPerformanceMetrics(
    boardId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceMetrics> {
    // MOCK IMPLEMENTATION
    const tasksPerDay = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      tasksPerDay.push({
        date: new Date(currentDate),
        completed: Math.floor(Math.random() * 8) + 1,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalTasksCompleted = tasksPerDay.reduce(
      (acc, item) => acc + item.completed,
      0
    );

    return {
      tasksPerDay,
      blockerStats: {
        total: 10,
        resolved: 7,
        unresolved: 3,
      },
      totalTasksCompleted,
      averageTasksPerDay:
        tasksPerDay.length > 0 ? totalTasksCompleted / tasksPerDay.length : 0,
    };
  },
};

// -----------------------------------------------------------------------------
// Unified API Export
// -----------------------------------------------------------------------------

/**
 * Unified API service object
 * Import this to access all API methods in a single object
 *
 * @example
 * import { api } from '@/lib/api'
 *
 * const boards = await api.boards.getBoards()
 * const user = await api.auth.login({ email, password })
 */
export const api = {
  auth: authApi,
  boards: boardsApi,
  cards: cardsApi,
  team: teamApi,
  analytics: analyticsApi,
};

export default api;
