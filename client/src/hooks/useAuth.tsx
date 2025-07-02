import React, { createContext, useContext, useEffect, useState } from "react";
import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL 

type User = { id: string; username: string; role: "admin" | "team" };

type AuthContextType = {
  user: User | null;
  token: string | null;
  rehydrated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  api: <T = any>(url: string, options?: AxiosRequestConfig) => Promise<T>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        setUser(user);
        setToken(token);
      } catch {
        localStorage.removeItem("auth");
      }
    }
    setRehydrated(true);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { username, password },
      { headers: { "Content-Type": "application/json" } }
    );
    const data = res.data;
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: data.user, token: data.token })
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
  };

  const api = async <T = any,>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    try {
      const config: AxiosRequestConfig = {
        ...options,
        url: url.startsWith("http") ? url : `${API_BASE_URL}${url}`,
        headers: {
          ...(options.headers || {}),
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      };
      const resp = await axios.request<T>(config);
      return resp.data;
    } catch (err: any) {
      if (err.response && err.response.status === 401) logout();
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, rehydrated, login, logout, api }}
    >
      {rehydrated ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
