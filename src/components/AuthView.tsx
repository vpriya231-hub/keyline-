import React, { useState } from "react";
import { motion } from "motion/react";
import { Key, Mail, Lock, User, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ViewState } from "../types";

interface AuthViewProps {
  mode: "signin" | "signup";
  onNavigate: (view: ViewState) => void;
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthView({ mode, onNavigate, onAuthSuccess }: AuthViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignIn = mode === "signin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = isSignIn ? { email, password } : { name, email, password };
    const url = isSignIn ? "/api/auth/signin" : "/api/auth/signup";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please check credentials.");
      }

      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setName("Vastra Tester");
    setEmail("vastratester@gmail.com");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-gray-100 font-sans flex flex-col justify-center py-12 px-6 overflow-hidden">
      
      {/* Background Dots */}
      <div className="absolute inset-0 developer-dot opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-orange-600/5 rounded-full blur-[130px] pointer-events-none orange-glow" />

      {/* Header link back to landing */}
      <div className="absolute top-8 left-6 md:left-12">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-500 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Landing
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 cursor-pointer" onClick={() => onNavigate("landing")}>
            <Key className="w-6 h-6 text-[#09090b] stroke-[2.5]" />
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white leading-9">
          {isSignIn ? "Sign in to KeyLine" : "Create developer account"}
        </h2>
        
        <p className="mt-2 text-center text-sm text-zinc-400">
          {isSignIn ? "Or " : "Already have a console account? "}
          <button
            onClick={() => onNavigate(isSignIn ? "signup" : "signin")}
            className="font-medium text-orange-500 hover:text-orange-400 underline transition-colors"
          >
            {isSignIn ? "register a new platform key" : "sign in immediately"}
          </button>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-[#121214] border border-zinc-800/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          
          {/* Quick Demo Pre-Fill Trigger */}
          <div className="mb-6 bg-zinc-900 border border-zinc-800/60 p-3 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-zinc-400">Sandbox Preview Ready</span>
            </div>
            <button
              onClick={fillDemoCredentials}
              type="button"
              className="px-2.5 py-1 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded transition-colors"
            >
              Autofill Credentials
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* NAME FIELD */}
            {!isSignIn && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Full Name
                </label>
                <div className="mt-2.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="block w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Developer Email
              </label>
              <div className="mt-2.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Access Password
                </label>
              </div>
              <div className="mt-2.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* ERROR PRESENTATION */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2.5 text-zinc-300 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={loading}
                id="auth-submit-btn"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-500/10 text-sm font-bold text-[#09090b] bg-orange-500 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Authentication...
                  </span>
                ) : isSignIn ? (
                  "Unlock Custom Dashboard"
                ) : (
                  "Create Platform Core Account"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Legal Links Footer */}
        <div className="mt-6 flex items-center justify-center gap-3 text-[10px] text-zinc-500 font-mono tracking-wider">
          <a href="https://sites.google.com/view/keylineprivacypolicy/home" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors uppercase">Privacy Policy</a>
          <span className="text-zinc-800">|</span>
          <a href="https://sites.google.com/view/keylinetermsandconditions/home" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors uppercase">Terms & Conditions</a>
        </div>
      </motion.div>
    </div>
  );
}
