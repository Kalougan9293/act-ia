"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoPlaceholder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    void video.play();
  }

  return (
    <motion.div
      id="demo"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full scroll-mt-24"
    >
      <div className="absolute -inset-3 rounded-[1.6rem] bg-blue-600/15 blur-2xl" />

      <div
        className="relative rounded-2xl overflow-hidden border-4 border-blue-600 bg-slate-900 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.45)] ring-1 ring-blue-900/20"
        style={{ aspectRatio: "16 / 9" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <video
          ref={videoRef}
          src="/conformai-demo.mp4"
          poster="/conformai-cover.jpg"
          className="absolute inset-0 h-full w-full object-cover bg-white"
          playsInline
          preload="metadata"
          controls={started}
          onPlay={() => setStarted(true)}
        />

        {!started && (
          <>
            <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />
            <button
              type="button"
              onClick={play}
              className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              aria-label="Regarder la démonstration"
            >
              <span
                className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-4 ring-white transition-transform duration-300 ${
                  hovered ? "scale-110" : "scale-100"
                }`}
              >
                <Play className="w-10 h-10 translate-x-1" fill="currentColor" strokeWidth={0} />
              </span>
            </button>

            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wide shadow-md">
                DÉMO
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
