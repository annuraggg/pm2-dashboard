import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";

const basename = import.meta.env.VITE_BASENAME || "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <App />
        <Toaster richColors theme="dark" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
