import { motion } from "motion/react";
import { Shield, Fingerprint, Code, ArrowRight, Lock, Key, CheckCircle } from "lucide-react";
import { ViewState } from "../types";

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
}

export default function LandingView({ onNavigate }: LandingViewProps) {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-orange-500/30 selection:text-orange-500 overflow-hidden">
      
      {/* Grid Pattern and Glow Effects */}
      <div className="absolute inset-0 developer-grid opacity-75 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none orange-glow" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("landing")}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Key className="w-5 h-5 text-[#09090b] stroke-[2.5]" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-white flex items-center gap-1">
              Key<span className="text-orange-500 font-normal">Line</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-orange-500 transition-colors">Architecture</a>
            <a href="#sdk" className="hover:text-orange-500 transition-colors">Developer SDK</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("signin")}
              className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("signup")}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-[#09090b] font-bold text-sm rounded-lg transition-all duration-200 shadow-md shadow-orange-500/15"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Custom Developer Auth Engine
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              The Secure Identity <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600">
                Platform for Modern Apps
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
              An enterprise-grade, lightweight OAuth 2.0 Identity Provider. Build application auth, manage client IDs & secrets, and integrate with our lightweight SDK in under 5 minutes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate("signup")}
                id="landing-hero-get-started"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-black font-extrabold text-base rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate("signin")}
                className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold text-base rounded-xl transition-all"
              >
                Developer Dashboard
              </button>
            </div>

            {/* Micro proof list */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-orange-500" /> Fully Custom Server
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-orange-500" /> Embedded SQLite Local Persistence
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-orange-500" /> Single-File KeyLine Base SDK
              </span>
            </div>
          </motion.div>

          {/* Visual Presentation / Code Terminal Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Terminal Card */}
            <div className="w-full bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
              <div className="h-11 bg-[#161619] px-4 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/40" />
                  <div className="w-3 h-3 rounded-full bg-[#ea580c]/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                </div>
                <div className="text-xs font-mono text-zinc-500">app_integration_suite.js</div>
                <div className="w-5" /> {/* Spacer */}
              </div>

              <div className="p-6 space-y-4 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
                <div className="text-zinc-600">// Import dynamic custom identity provider SDK</div>
                <div>
                  <span className="text-orange-500">import</span> {"{"} <span className="text-amber-400">initializeKeyLine</span> {"}"}{" "}
                  <span className="text-orange-500">from</span> <span className="text-emerald-400">"keyline-base.js"</span>;
                </div>
                
                <div className="pt-2 text-zinc-600">// Configure client identity details</div>
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">keyline</span> = <span className="text-amber-400">initializeKeyLine</span>({"{"}
                  <div className="pl-4">
                    clientId: <span className="text-emerald-400">"kl_client_8f9e2d1c"</span>,
                  </div>
                  <div className="pl-4">
                    redirectUri: <span className="text-emerald-400">"http://localhost:3000/callback"</span>
                  </div>
                  {"}"});
                </div>

                <div className="pt-2 text-zinc-600">// Trigger standard multi-protocol redirect authorization</div>
                <div>
                  <span className="text-blue-400">keyline</span>.<span className="text-amber-400">loginWithRedirect</span>();
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-orange-500/60" />
                    <span>Loaded via public API CDN</span>
                  </div>
                  <span className="text-orange-500/80 font-semibold px-2 py-0.5 rounded bg-orange-500/10">v1.0.0</span>
                </div>
              </div>
            </div>

            {/* Glowing overlap badge */}
            <div className="absolute -bottom-6 -right-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">Custom Auth API</div>
                <div className="text-xs font-bold text-white">OAuth 2.0 Auth Code flow</div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 border-t border-zinc-900 bg-[#0c0c0e] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Sleek, Fast & Developer-First Auth
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Designed specifically from scratch for developers who want supreme control, zero bloated libraries, and deep security visibility.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="p-6 bg-[#121214] border border-zinc-800/80 rounded-xl space-y-4 hover:border-orange-500/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Stateful Encrypted Secrets</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Client IDs are cryptographic identifiers backed by securely randomized Secret keys with quick refresh mechanisms.
              </p>
            </div>

            <div className="p-6 bg-[#121214] border border-zinc-800/80 rounded-xl space-y-4 hover:border-orange-500/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">KeyLine Base JavaScript SDK</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No massive npm bundles. Load a single file dynamically to trigger logins, configure origins, and receive callbacks securely.
              </p>
            </div>

            <div className="p-6 bg-[#121214] border border-zinc-800/80 rounded-xl space-y-4 hover:border-orange-500/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Secure Origin Validation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prevent origin pollution and credential hijacking. Custom validation enforces matched callback and redirect parameters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-[#09090b] text-zinc-500 text-xs py-10">
        <div className="max-w-7xl mx-auto px-6 h-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 KeyLine Inc. Elegant, high-performance developer identity provider tools.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://sites.google.com/view/keylinetermsandconditions/home" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Terms & Conditions</a>
            <a href="https://sites.google.com/view/keylineprivacypolicy/home" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="https://github.com" target="_blank" className="hover:text-orange-500">GitHub Core SDK</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
