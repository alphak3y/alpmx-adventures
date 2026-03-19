import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[500px] flex items-start justify-center overflow-hidden" style={{ height: "93vh" }}>
      {/* Background Image */}
      <Image
        src="/images/hero-red-rock.jpg"
        alt="Dirt bike rider looking up at red rock trails in Southern Utah"
        fill
        className="object-cover object-[center_75%]"
        priority
        sizes="100vw"
      />

      {/* Top bar — solid dark for navbar, then fade */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "200px",
          background: "linear-gradient(to bottom, rgba(26,23,20,1) 0%, rgba(26,23,20,0.95) 40%, rgba(26,23,20,0.4) 75%, transparent 100%)",
        }}
      />

      {/* Bottom gradient — text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,23,20,0.9)] via-[rgba(26,23,20,0.4)] to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-10 w-full max-w-[900px] mx-auto pt-32 lg:pt-40">
        <h1
          className="font-heading font-bold text-white uppercase mb-5"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "0.03em",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Ride Utah&apos;s<br />Red Rock Country
        </h1>
        <p
          className="font-body text-white/80 mx-auto mb-10"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            lineHeight: 1.6,
            maxWidth: "560px",
            textShadow: "0 1px 10px rgba(0,0,0,0.4)",
          }}
        >
          Dirt bike rentals in Southern Utah. Premium bikes. Legendary trails.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#rentals"
            className="inline-block bg-primary text-white font-heading font-semibold text-sm lg:text-[15px] uppercase tracking-wider px-8 py-3 rounded-[4px] hover:bg-primary-hover transition-colors duration-200 w-full sm:w-auto text-center sm:max-w-[280px]"
          >
            Explore Rentals
          </a>
          <a
            href="#cabin"
            className="inline-block border border-white/70 text-white font-heading font-semibold text-sm lg:text-[15px] uppercase tracking-wider px-8 py-3 rounded-[4px] hover:bg-white/10 transition-colors duration-200 w-full sm:w-auto text-center sm:max-w-[280px]"
          >
            Book a Cabin
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce">
        <div className="w-[1px] h-8 bg-white/40" />
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-white/40">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
