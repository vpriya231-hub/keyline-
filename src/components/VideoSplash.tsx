import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, SkipForward, Sparkles, Key, ShieldCheck, Cpu, Database, Activity, RefreshCw } from "lucide-react";

interface VideoSplashProps {
  onFinish: () => void;
}

export default function VideoSplash({ onFinish }: VideoSplashProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [videoState, setVideoState] = useState<"loading" | "playing" | "error">("loading");
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Security Simulation system logs for the fallback screen
  const logs = [
    "INITIALIZING KEYLINE IDENTITY CORE...",
    "HANDSHAKING WITH AUTHENTICATION GATEWAYS...",
    "CREATING SECURE HARDWARE SECURITY ENCLAVE...",
    "CALIBRATING DISCRETE KEY VECTORS...",
    "VERIFYING SESSION DECRYPTION MATRIX...",
    "ESTABLISHING CRYPTOGRAPHICALLY SECURE TUNNEL...",
    "SYNCHRONIZING SECURE KEYRING CREDENTIALS...",
    "KEYLINE ENVIRONMENT SECURED. REDIRECTING..."
  ];

  useEffect(() => {
    // Exactly 10 seconds total cinematic session
    const duration = 10000;
    const fadeStartTime = 9400; // Start fadeout 600ms before 10s

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, fadeStartTime);

    const endTimer = setTimeout(() => {
      onFinish();
    }, duration);

    // Rotate simulated developer logs every 600ms for fallback engagement
    const logInterval = setInterval(() => {
      setCurrentLogIndex((prev) => (prev + 1) % logs.length);
    }, 600);

    // High fidelity progress update cycle (runs relative to 10s duration)
    let animationFrameId: number;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const computed = Math.min((elapsed / duration) * 100, 100);
      setProgress(computed);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
      clearInterval(logInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onFinish]);

  // Fallback watchdog list to double check if video is blocked/missing
  useEffect(() => {
    const watchdog = setTimeout(() => {
      if (videoState === "loading") {
        console.log("[VIDEO DEBUG] Video did not fire play event in 1s. Defaulting gracefully to cinematic security sequence.");
        setVideoState("error");
      }
    }, 1500);

    return () => clearTimeout(watchdog);
  }, [videoState]);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      onFinish();
    }, 450);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      id="keyline-cinematic-splash"
      className={`fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center transition-all duration-[550ms] cubic-bezier(0.16, 1, 0.3, 1) ${
        isFading ? "opacity-0 scale-[1.04] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Grid and Glowing Matrix Ambience */}
      <div className="absolute inset-0 developer-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 developer-dot opacity-60 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Identity Header bar */}
      <div className="absolute top-8 flex items-center justify-between w-full max-w-5xl px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
            <Key className="w-4.5 h-4.5 text-orange-500 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-sans font-bold text-base tracking-tight text-white flex items-center gap-1">
              Key<span className="text-orange-500 font-normal">Line</span>
            </span>
            <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Authentication Provider</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/40 border border-zinc-800/60 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Cinematic 10s Launch</span>
        </div>
      </div>

      {/* Main Video & Fallback Display Arena */}
      <div className="w-full max-w-4xl px-6 flex flex-col items-center relative">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-orange-500/5 group">
          
          {/* Always render video with fallback sources to support any environment name */}
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            playsInline
            controls={false}
            className={`w-full h-full object-cover transition-opacity duration-300 absolute inset-0 z-10 ${
              videoState === "playing" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onPlay={() => setVideoState("playing")}
            onPlaying={() => setVideoState("playing")}
            onCanPlay={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {
                  setVideoState("error");
                });
              }
            }}
            onError={() => {
              setVideoState("error");
            }}
            onEnded={handleSkip}
          >
            <source src="1000386695.mp4" type="video/mp4" />
            <source src="video_20260609_175149.mp4" type="video/mp4" />
          </video>

          {/* Premium Loading / Error / Missing Video Fallback Presentation State */}
          {videoState !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] p-6 z-0">
              <div className="absolute inset-0 bg-radial-gradient from-orange-600/5 via-transparent to-transparent pointer-events-none" />
              
              {/* Spinning security gear container */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                <div className="w-16 h-16 rounded-full border border-dashed border-orange-500/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  <RefreshCw className="w-8 h-8 text-orange-500/40" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-orange-500 animate-pulse" />
                </div>
              </div>

              {/* Title identity signature */}
              <h3 className="font-sans font-semibold text-lg text-white mb-2 tracking-tight">
                Authenticating Session Key
              </h3>
              
              <p className="text-xs text-zinc-400 font-mono text-center max-w-md h-8 overflow-hidden flex items-center justify-center">
                <span className="text-orange-500 mr-2">&gt;</span>
                {logs[currentLogIndex]}
              </p>

              {/* Tech Spec Badges inside video frame */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-900 w-full max-w-md justify-center">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] uppercase tracking-wider">AES-256</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Database className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] uppercase tracking-wider">TLS 1.3</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] uppercase tracking-wider">Secure HS</span>
                </div>
              </div>
            </div>
          )}

          {/* Audio toggle overlay - only show if video is actively playing */}
          {videoState === "playing" && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 left-4 z-20 p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-lg border border-zinc-800/80 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              title={isMuted ? "Unmute Cinematic Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-orange-500" />
              )}
            </button>
          )}

          {/* Ambient corner overlay gradient inside the video border */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Bottom Progress Tracker and Navigation Controls */}
      <div className="absolute bottom-10 flex flex-col items-center gap-4 w-full">
        {/* Timeline Progress Bar */}
        <div className="flex flex-col gap-1.5 items-center w-64">
          <div className="w-full h-[3px] bg-zinc-950 border border-zinc-900 overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            <span>Progress Matrix</span>
            <span>{(progress / 10).toFixed(1)}s / 10.0s</span>
          </div>
        </div>

        {/* Action Skip Button */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/70 backdrop-blur-sm rounded-full text-zinc-400 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer group active:scale-[0.98]"
        >
          Skip Security Intro
          <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-orange-500" />
        </button>
      </div>
    </div>
  );
}
