import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-950 transition-all duration-700">
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.06)_0,transparent_60%)]"></div>
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-10 space-y-6 border-t-4 border-blue-700 animate-fade-in"
        aria-label="Login Form"
        autoComplete="on"
      >
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-700/90 flex items-center justify-center shadow-lg mb-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-white"
            >
              <path
                fill="currentColor"
                d="M12 2a10 10 0 0 0-3.5 19.4c.55.1.75-.24.75-.53v-1.87c-3.09.67-3.74-1.5-3.74-1.5-.5-1.23-1.23-1.56-1.23-1.56-1-.68.08-.67.08-.67 1.1.08 1.68 1.14 1.68 1.14.99 1.7 2.6 1.21 3.24.93.1-.72.39-1.21.7-1.49-2.47-.28-5.06-1.23-5.06-5.5 0-1.21.43-2.2 1.14-2.97-.11-.28-.5-1.4.11-2.91 0 0 .94-.3 3.09 1.14a10.74 10.74 0 0 1 2.81-.38c.95 0 1.91.13 2.8.38 2.16-1.44 3.1-1.14 3.1-1.14.6 1.51.22 2.63.11 2.91.71.77 1.14 1.76 1.14 2.97 0 4.28-2.6 5.22-5.08 5.5.4.34.76 1.02.76 2.06v3.06c0 .29.2.63.76.52A10 10 0 0 0 12 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            PM2 Dashboard
          </h1>
          <div className="text-gray-400 text-sm">Sign in to your account</div>
        </div>

        {error && (
          <div
            className="bg-red-900/60 border border-red-800 text-red-200 px-3 py-2 rounded text-center animate-shake"
            role="alert"
            tabIndex={-1}
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-800 outline-none transition placeholder-gray-500 bg-gray-950/90 text-gray-100 shadow"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            autoComplete="username"
            aria-label="Username"
          />
          <input
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-800 outline-none transition placeholder-gray-500 bg-gray-950/90 text-gray-100 shadow"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-label="Password"
            minLength={4}
          />
        </div>

        <button
          className={`w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-2 rounded-lg font-semibold shadow-md hover:from-blue-800 hover:to-blue-950 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-60 disabled:cursor-not-allowed ${
            loading ? "animate-pulse" : ""
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-xs text-gray-500 mt-4">
          Made with ❤️ by{" "}
          <a
            href="https://www.anuragsawant.in"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anurag Sawant
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
