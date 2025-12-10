/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 * Central type definitions for the Kanban Board application.
 * These types are used across the application for type safety and consistency.
 *
 * When integrating with an external API, ensure the API responses match these
 * types or create mapper functions to transform API responses.
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// User Types
// -----------------------------------------------------------------------------

/**
 * Team information associated with a user
 */
export interface UserTeam {
  /** Team ID */
  id: number;
  /** Team name */
  name: string;
  /** Team description */
  description: string | null;
  /** Whether the user is the scrum master of this team */
  scrumMaster: boolean;
}

/**
 * Represents a user in the system.
 * The role is determined per-board, not account-wide.
 */
export interface User {
  /** Unique identifier for the user */
  id: number;
  /** Display name of the user */
  name: string;
  /** Email address - used for authentication and board role determination */
  email: string;
  /** Username for login */
  username: string;
  /** List of teams the user belongs to */
  teams: UserTeam[];
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
  /** JWT or session token for authenticated requests */
  token: string;
}

/**
 * Login credentials payload
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Registration payload
 */
export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

// -----------------------------------------------------------------------------
// Board Types
// -----------------------------------------------------------------------------

/**
 * Represents a Kanban board.
 * A user can be a member of multiple boards with different roles on each.
 */
export interface Board {
  /** Unique identifier for the board */
  id: number;
  /** Display name of the board */
  name: string;
  /** Board description */
  description: string | null;
  /** Name of the Scrum Master */
  scrumMaster: string;
  /** Array of member names */
  members: string[];
}

/**
 * Payload for creating a new board
 */
export interface CreateBoardPayload {
  name: string;
}

/**
 * Payload for adding a member to a board
 */
export interface AddMemberPayload {
  boardId: number;
  memberId: number;
}

// -----------------------------------------------------------------------------
// Card Types
// -----------------------------------------------------------------------------

/**
 * Card status types from API
 */
export type CardType =
  | "WHAT_I_DID_TODAY"
  | "WHAT_I_DID_YESTERDAY"
  | "WHAT_I_PRETEND_TO_DO";

/**
 * Represents a card/task on the Kanban board.
 */
export interface Card {
  /** Unique identifier for the card */
  id: number;
  /** Member ID who created the card */
  memberId: number;
  /** Display name of the card creator */
  memberName: string;
  title: string;
  /** Card type/status from API */
  type: CardType;
  /** Card description */
  description: string;
  /** Whether the card is resolved */
  resolved: boolean;
  /** Card creation date (DD-MM-YYYY format) */
  creationDate: string;
}

/**
 * Column types for the Kanban board (mapped from CardStatus)
 */
export type Column = "done" | "willDo" | "blockers";

/**
 * Complete board data structure with all columns
 */
export interface BoardData {
  done: Card[];
  willDo: Card[];
  blockers: Card[];
}

/**
 * API response structure for cards (flat array)
 */
export type CardsApiResponse = Card[];

/**
 * Payload for creating a new card
 */
export interface CreateCardPayload {
  title: string;
  description?: string;
  type: CardType;
  resolved: boolean;
}

/**
 * Payload for updating a card
 */
export interface UpdateCardPayload {
  title?: string;
  description?: string;
  resolved?: boolean;
}

// -----------------------------------------------------------------------------
// Team Member Types
// -----------------------------------------------------------------------------

/**
 * Represents a team member on a specific board
 */
export interface TeamMember {
  /** Unique identifier for the member */
  id: string;
  /** Display name */
  name: string;
  /** Email address */
  email: string;
  /** When the member was added to the board */
  addedAt: Date;
}

// -----------------------------------------------------------------------------
// Filter Types
// -----------------------------------------------------------------------------

/**
 * Date range for filtering
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Filter state for the task board
 */
export interface FilterState {
  dateRange: DateRange | undefined;
  authors: string[];
}

// -----------------------------------------------------------------------------
// Performance/Analytics Types
// -----------------------------------------------------------------------------

/**
 * Task completion data for a specific day
 */
export interface TaskCompletionData {
  date: Date;
  completed: number;
}

/**
 * Blocker statistics
 */
export interface BlockerStats {
  total: number;
  resolved: number;
  unresolved: number;
}

/**
 * Performance metrics response
 */
export interface PerformanceMetrics {
  tasksPerDay: TaskCompletionData[];
  blockerStats: BlockerStats;
  totalTasksCompleted: number;
  averageTasksPerDay: number;
}
