import { useState, useEffect } from "react";
import { ViewState, User } from "./types";
import LandingView from "./components/LandingView";
import AuthView from "./components/AuthView";
import DashboardView from "./components/DashboardView";
import { Loader2 } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Core app state startup check
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("kl_dev_token");
      const savedUserStr = localStorage.getItem("kl_dev_user");

      if (savedToken && savedUserStr) {
        try {
          // Verify with the Express backend
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(savedToken);
            setCurrentView("dashboard");
          } else {
            // Token was corrupt or expired
            localStorage.removeItem("kl_dev_token");
            localStorage.removeItem("kl_dev_user");
          }
        } catch (err) {
          console.error("Failed backend auth handshake startup check", err);
          // If offline/server starting, fall back gracefully to local session info or log out
          try {
            const userData = JSON.parse(savedUserStr);
            setUser(userData);
            setToken(savedToken);
            setCurrentView("dashboard");
          } catch {
            localStorage.removeItem("kl_dev_token");
            localStorage.removeItem("kl_dev_user");
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem("kl_dev_token", authToken);
    localStorage.setItem("kl_dev_user", JSON.stringify(authUser));
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kl_dev_token");
    localStorage.removeItem("kl_dev_user");
    setCurrentView("landing");
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Synchronizing Keyline Security Keys...</span>
      </div>
    );
  }

  // Render view router
  switch (currentView) {
    case "signup":
      return (
        <AuthView
          mode="signup"
          onNavigate={handleNavigate}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    case "signin":
      return (
        <AuthView
          mode="signin"
          onNavigate={handleNavigate}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    case "dashboard":
      if (user && token) {
        return (
          <DashboardView
            user={user}
            token={token}
            onLogout={handleLogout}
          />
        );
      }
      // Fail-guard redirect to landing
      return <LandingView onNavigate={handleNavigate} />;
    case "landing":
    default:
      return <LandingView onNavigate={handleNavigate} />;
  }
}
