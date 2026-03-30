"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Rentals", href: "#rentals" },
  { label: "Cabin", href: "#cabin" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-bg-dark ${
        scrolled
          ? "shadow-lg"
          : ""
      }`}
      aria-label="Main navigation"
      suppressHydrationWarning
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 flex items-center justify-between h-16 lg:h-[72px]">
        {/* Logo */}
        <a href="/" className="relative z-10 shrink-0">
          <Image
            src="/images/logo.png"
            alt="AlpMX Adventures"
            width={48}
            height={48}
            className="h-10 lg:h-12 w-auto rounded-full drop-shadow-[0_0_8px_rgba(212,175,55,0.45)]"
            priority
          />
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-heading text-[15px] font-medium text-text-light/80 uppercase tracking-[0.02em] hover:text-text-light relative after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-6">
          <span className="text-text-secondary text-sm">385-236-8986</span>
          <a
            href="#book"
            className="bg-primary text-white font-heading font-semibold text-[15px] px-8 py-3 rounded-[4px] hover:bg-primary-hover transition-colors duration-200"
          >
            BOOK NOW
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden relative z-50 w-12 h-12 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`block h-[2px] bg-white transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block h-[2px] bg-white transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] bg-white transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-bg-dark/[0.98] z-40 flex flex-col items-center justify-center gap-8 lg:hidden">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-heading text-[28px] font-semibold text-text-light uppercase tracking-[0.02em] opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-8 flex flex-col items-center gap-4">
            <a
              href="tel:3852368986"
              className="text-text-secondary text-lg"
            >
              385-236-8986
            </a>
            <a
              href="#book"
              onClick={() => setMobileOpen(false)}
              className="bg-primary text-white font-heading font-semibold text-lg px-12 py-4 rounded-[4px] w-[280px] text-center"
            >
              BOOK NOW
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
