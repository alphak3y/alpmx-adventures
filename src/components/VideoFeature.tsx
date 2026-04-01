"use client";

import { useState } from "react";
import Image from "next/image";

const YOUTUBE_ID = "Zv_I3f554p4";

export default function VideoFeature() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-bg-light py-16 lg:py-24">
      <div className="max-w-[900px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-primary uppercase tracking-[0.02em] mb-12 text-center">
          See Us In Action
        </h2>

        <div
          className="relative rounded-md overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(26,23,20,0.12)" }}
        >
          {playing ? (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&start=35`}
                title="AlpMX Adventures — Riding Utah"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="relative w-full block group cursor-pointer"
              aria-label="Play video"
            >
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <Image
                  src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                  alt="Video thumbnail — dirt bike riding through Utah canyons"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 900px) 100vw, 900px"
                />
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-200">
                <div className="w-20 h-20 rounded-[4px] bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg
                    width="28"
                    height="32"
                    viewBox="0 0 28 32"
                    fill="none"
                    className="ml-1"
                  >
                    <path d="M28 16L0 32V0L28 16Z" fill="white" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
