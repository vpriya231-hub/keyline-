import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, SkipForward, Sparkles, Key } from "lucide-react";

interface VideoSplashProps {
  onFinish: () => void;
}

export default function VideoSplash({ onFinish }: VideoSplashProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // 10 second timeout as the exact timer / fail-safe
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 9400); // Start fade-out slightly before 10s to hit exactly 10s total

    const endTimer = setTimeout(() => {
      onFinish();
    }, 10000); // complete phase-out

    // Progress bar animation frame handler
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 10000; // 10 seconds

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

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      onFinish();
    }, 400);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center transition-all duration-[600ms] ease-in-out ${
        isFading ? "opacity-0 scale-[1.03] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Tech Mesh and Ambient glow */}
      <div className="absolute inset-0 developer-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 developer-dot opacity-80 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Banner Branding */}
      <div className="absolute top-10 flex items-center justify-between w-full max-w-5xl px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600/10 flex items-center justify-center border border-orange-500/20">
            <Key className="w-4.5 h-4.5 text-orange-500 stroke-[2]" />
          </div>
          <div>
            <span className="font-sans font-bold text-base tracking-tight text-white flex items-center gap-1">
              Key<span className="text-orange-500 font-normal">Line</span>
            </span>
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Identity Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800/80 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Cinematic Experience</span>
        </div>
      </div>

      {/* Main Video Presentation Stage */}
      <div className="w-full max-w-4xl px-6 flex flex-col items-center relative">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-orange-500/5 group">
          {/* Ambient border overlay gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none transition-opacity duration-300 z-10" />

          <video
            ref={videoRef}
            src="/video_20260609_175149.mp4"
            autoPlay
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
            onEnded={handleSkip}
          />

          {/* Audio toggle overlay */}
          <button
            onClick={toggleMute}
            className="absolute bottom-4 left-4 z-20 p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-lg border border-zinc-800/80 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer shadow-lg"
            title={isMuted ? "Unmute Cinematic Sound" : "Mute Sound"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-orange-500" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Progress Tracker and Navigation Controls */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4 w-full">
        {/* Timeline Progress Bar */}
        <div className="flex flex-col gap-1.5 items-center w-64">
          <div className="w-full h-[2px] bg-zinc-900 border-zinc-800 overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            <span>Synchronizing</span>
            <span>{(progress / 10).toFixed(1)}s / 10.0s</span>
          </div>
        </div>

        {/* Action Skip Button */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800/50 backdrop-blur-md rounded-full text-zinc-400 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer group active:scale-[0.98]"
        >
          Skip Intro Keyframe
          <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
