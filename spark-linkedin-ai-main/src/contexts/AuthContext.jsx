import { createContext, useContext, useReducer, useEffect } from "react";
import apiClient from "../services/api.js";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiClient.setToken(token);
      // Verify token and get user data
      checkAuthStatus();
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data.user,
            token: apiClient.getToken(),
          },
        });
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      apiClient.setToken(null);
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await apiClient.login(credentials);
      if (response.success) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await apiClient.register(userData);
      if (response.success) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      apiClient.setToken(null);
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.updateProfile(profileData);
      if (response.success) {
        dispatch({
          type: "UPDATE_USER",
          payload: response.data.user,
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Profile update failed");
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
