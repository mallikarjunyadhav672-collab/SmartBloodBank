import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../api";
import * as api from "../api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: "donor" | "receiver" | "admin"
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: "donor" | "receiver" | "admin"
  ) => {
    const response = await api.register(email, password, fullName, role);
    const newUser = response.user;
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const loggedInUser = response.user;
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    api.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
