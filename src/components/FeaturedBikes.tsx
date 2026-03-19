"use client";

import Image from "next/image";
import { useState } from "react";

const bikes = [
  {
    name: "Husqvarna TC250",
    cc: "250cc",
    level: "Intermediate",
    price: "$230",
    image: "https://www.alpmxadventures.com/media/1771389843_2023_Husqvarna_TC250.jpg",
    alt: "2023 Husqvarna TC250 dirt bike side profile",
    featured: true,
    badge: "Most Popular",
    category: "Intermediate",
  },
  {
    name: "KTM 300SX",
    cc: "300cc",
    level: "Advanced",
    price: "$240",
    image: "https://www.alpmxadventures.com/media/1771390181_2023_KTM_300SX.png",
    alt: "2023 KTM 300SX dirt bike side profile",
    featured: true,
    category: "Advanced",
  },
  {
    name: "Honda CRF 250F",
    cc: "250cc",
    level: "Beginner",
    price: "$180",
    image: "https://www.alpmxadventures.com/media/1771390643_2020_Honda_CRF_250F.jpg",
    alt: "2020 Honda CRF 250F dirt bike side profile",
    category: "Beginner",
  },
  {
    name: "Honda CRF 125F",
    cc: "125cc",
    level: "Beginner",
    price: "$140",
    image: "https://www.alpmxadventures.com/media/1771390891_2021_Honda_CRF_125F.jpg",
    alt: "2021 Honda CRF 125F dirt bike side profile",
    category: "Beginner",
  },
  {
    name: "GasGas EX250",
    cc: "250cc",
    level: "Intermediate",
    price: null,
    image: "https://www.alpmxadventures.com/media/1771392134_2023_GASGAS_EX250.jpg",
    alt: "2023 GasGas EX250 dirt bike side profile",
    category: "Intermediate",
  },
];

const filters = ["All", "Beginner", "Intermediate", "Advanced"];

export default function FeaturedBikes() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = bikes.filter((b) => {
    if (activeFilter === "All") return true;
    return b.category === activeFilter;
  });

  const featured = filtered.filter((b) => b.featured);
  const rest = filtered.filter((b) => !b.featured);

  return (
    <section id="rentals" className="bg-bg-light py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-primary uppercase tracking-[0.02em] mb-3">
          Our Fleet
        </h2>
        <p className="font-body text-base text-text-secondary mb-8">
          Premium machines for every skill level
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-heading text-sm font-semibold px-6 py-2.5 rounded-[4px] whitespace-nowrap transition-all duration-200 ${
                activeFilter === f
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(196,68,42,0.35)]"
                  : "bg-bg-white border border-border text-text-primary hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Featured Row */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {featured.map((bike) => (
              <BikeCard key={bike.name} bike={bike} large />
            ))}
          </div>
        )}

        {/* Rest */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {rest.map((bike) => (
              <BikeCard key={bike.name} bike={bike} />
            ))}
          </div>
        )}

        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 font-body text-base font-medium text-primary hover:underline group"
          >
            View All Rentals
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function BikeCard({
  bike,
  large,
}: {
  bike: (typeof bikes)[0];
  large?: boolean;
}) {
  return (
    <div className="group bg-bg-white border-2 border-border rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(196,68,42,0.2)] hover:border-primary">
      {/* Image */}
      <div className={`relative ${large ? "aspect-[4/3]" : "aspect-[4/3]"} bg-white p-4 lg:p-6 overflow-hidden`}>
        {bike.badge && (
          <span className="absolute top-4 left-4 z-10 bg-primary text-white font-heading text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1.5 rounded-[4px]">
            ★ {bike.badge}
          </span>
        )}
        <div className="relative w-full h-full transition-transform duration-[400ms] ease-out group-hover:translate-x-2">
          <Image
            src={bike.image}
            alt={bike.alt}
            fill
            className="object-contain"
            loading="lazy"
            sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className={`font-heading font-semibold ${
            large ? "text-[22px]" : "text-lg"
          } text-bg-dark uppercase mb-2`}
        >
          {bike.name}
        </h3>
        <p className="font-body text-sm text-text-secondary mb-3">
          {bike.cc} • {bike.level}
        </p>
        {bike.price ? (
          <p className="mb-4">
            <span className={`font-heading font-bold ${large ? "text-2xl" : "text-xl"} text-bg-dark`}>
              {bike.price}
            </span>
            <span className="font-body text-sm text-text-secondary"> /day</span>
          </p>
        ) : (
          <p className="font-body text-sm text-text-secondary mb-4">
            Contact for pricing
          </p>
        )}
        <a
          href="#"
          className={`block text-center bg-bg-dark text-white font-heading font-semibold text-[15px] ${
            large ? "py-3.5" : "py-3"
          } rounded-[4px] hover:bg-primary transition-colors duration-200`}
        >
          {bike.price ? "VIEW DETAILS" : "INQUIRE"}
        </a>
      </div>
    </div>
  );
}
