import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, ApiError } from "@/lib/apiClient";
import { toast } from "sonner";

export type UserRole = "admin" | "organizer" | "exhibitor";
export type UserStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  designation?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; reason?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; reason?: string }>;
  isAuthenticated: boolean;
  allUsers: User[];
  updateUserStatus: (userId: string, status: UserStatus) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  address: string;
  district?: string;
  role: "exhibitor" | "organizer";
  businessName?: string;
  businessType?: string;
  designation?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

interface AuthApiUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mobile?: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  designation?: string;
}

interface AuthApiPayload {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthApiUser;
}

function getApiErrorMessage(error: ApiError) {
  const data = error.data as { message?: string; errors?: Record<string, string> } | null;
  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).filter(Boolean);
    if (messages.length > 0) return messages.join(", ");
  }
  return error.message;
}

const INITIAL_USERS: (User & { password: string })[] = [
  { id: "1", name: "Admin User", email: "admin@amrut.com", role: "admin", status: "approved", password: "admin123" },
  { id: "2", name: "Organizer User", email: "organizer@amrut.com", role: "organizer", status: "approved", password: "org123" },
  { id: "3", name: "Exhibitor User", email: "exhibitor@amrut.com", role: "exhibitor", status: "approved", password: "ex123" },
];

function loadUsers(): (User & { password: string })[] {
  const saved = localStorage.getItem("amrut_all_users");
  return saved ? JSON.parse(saved) : [...INITIAL_USERS];
}

function saveUsers(users: (User & { password: string })[]) {
  localStorage.setItem("amrut_all_users", JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<(User & { password: string })[]>(loadUsers);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("amrut_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<AuthApiPayload>>("/auth/login", {
        email,
        password,
      });

      const authData = response.data;
      if (!authData?.user || !authData.accessToken) {
        return { success: false, reason: "Login response is incomplete" };
      }

      const userData: User = {
        id: String(authData.user.id),
        name: authData.user.name,
        email: authData.user.email,
        role: authData.user.role,
        status: authData.user.status,
        mobile: authData.user.mobile,
        address: authData.user.address,
        businessName: authData.user.businessName,
        businessType: authData.user.businessType,
        designation: authData.user.designation,
      };

      setUser(userData);
      localStorage.setItem("amrut_user", JSON.stringify(userData));
      localStorage.setItem("amrut_auth_token", authData.accessToken);
      if (authData.refreshToken) {
        localStorage.setItem("amrut_refresh_token", authData.refreshToken);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, reason: error.message };
      }
      return { success: false, reason: "Login failed" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("amrut_user");
    localStorage.removeItem("amrut_auth_token");
    localStorage.removeItem("amrut_refresh_token");
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      toast.error("Your session has expired. Please log in again.");
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [logout]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await api.post<ApiResponse<unknown>>("/auth/register", {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        address: data.address,
        district: data.district,
        role: data.role.toUpperCase(),
        businessName: data.businessName,
        businessType: data.businessType,
        designation: data.designation,
      });

      return { success: response.success !== false };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, reason: getApiErrorMessage(error) };
      }
      return { success: false, reason: "Registration failed" };
    }
  }, []);

  const updateUserStatus = useCallback((userId: string, status: UserStatus) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, status } : u));
    setUsers(updated);
    saveUsers(updated);
  }, [users]);

  const allUsers: User[] = users.map(({ password: _, ...u }) => u);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user, allUsers, updateUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
