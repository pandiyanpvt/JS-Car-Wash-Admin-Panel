// Placeholder for auth slice
// Implement with Redux Toolkit or Zustand

export interface AuthState {
  user: any | null
  token: string | null
  isAuthenticated: boolean
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

// TODO: Implement auth slice actions and reducers

