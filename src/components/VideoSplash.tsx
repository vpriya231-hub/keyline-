import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, SkipForward, Sparkles, Key, Loader2 } from "lucide-react";

interface VideoSplashProps {
  onFinish: () => void;
}

export default function VideoSplash({ onFinish }: VideoSplashProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [videoState, setVideoState] = useState<"loading" | "playing" | "error">("loading");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Exactly 5 seconds total cinematic session
    const duration = 5000;
    const fadeStartTime = 4400; // Start fadeout 600ms before 5s

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, fadeStartTime);

    const endTimer = setTimeout(() => {
      onFinish();
    }, duration);

    // High fidelity progress update cycle (runs relative to 5s duration)
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [onFinish]);

  // Fallback watchdog to detect block/missing video
  useEffect(() => {
    const watchdog = setTimeout(() => {
      if (videoState === "loading") {
        console.log("[VIDEO DEBUG] Video did not fire play event in 1s. Gracefully transitioning via premium fallback.");
        setVideoState("error");
      }
    }, 1200);

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
      className={`fixed inset-0 z-[9999] bg-[#0d0e12] flex flex-col items-center justify-center transition-all duration-[550ms] cubic-bezier(0.16, 1, 0.3, 1) ${
        isFading ? "opacity-0 scale-[1.04] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Grid and Glowing Matrix Ambience - subtle */}
      <div className="absolute inset-0 developer-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 developer-dot opacity-45 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />

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
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Cinematic 5s Launch</span>
        </div>
      </div>

      {/* Main Video & Fallback Display Arena */}
      <div className="w-full max-w-4xl px-6 flex flex-col items-center relative">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-orange-500/5 group">
          
          {/* Exactly video_20260609_175149.mp4 */}
          <video
            ref={videoRef}
            src="video_20260609_175149.mp4"
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
          />

          {/* Solid premium loading background state (#0d0e12) with elegant spinner */}
          {videoState !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0e12] p-6 z-0">
              <div className="relative mb-6">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              </div>
              <h3 className="font-sans font-medium text-sm text-zinc-300 tracking-wider uppercase">
                Initializing Keyline Provider
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 text-center">
                Establishing hardware secure connection...
              </p>
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
            <span>Security Matrix</span>
            <span>{(progress / 20).toFixed(1)}s / 5.0s</span>
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
