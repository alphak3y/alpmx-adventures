"use client";

import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

export interface FeaturedBikeItem {
  fleet_item_id: string;
  name: string;
  slug: string;
  category_id: string;
  photo: string | null;
  skill_level: string;
  price: number;
  deposit_amount: number;
  rate_type: string;
  available: boolean;
  reason: string | null;
}

const filters = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];

export default function FeaturedBikes({ items }: { items: FeaturedBikeItem[] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = items.filter((item) => {
    if (activeFilter === "All") return true;
    return item.skill_level.toLowerCase() === activeFilter.toLowerCase();
  });

  // First two items are "featured" (large cards)
  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  // Only show filter tabs that have items
  const activeFilters = filters.filter(
    (f) =>
      f === "All" ||
      items.some((item) => item.skill_level.toLowerCase() === f.toLowerCase())
  );

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
          {activeFilters.map((f) => (
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
            {featured.map((item) => (
              <BikeCard key={item.fleet_item_id} item={item} large />
            ))}
          </div>
        )}

        {/* Rest */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {rest.map((item) => (
              <BikeCard key={item.fleet_item_id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center">
          <a
            href="https://getrenta.io/shops/alpmx-test?utm_source=alpmx-site&utm_medium=view-all&utm_campaign=rentals"
            target="_blank"
            rel="noopener noreferrer"
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
  item,
  large,
}: {
  item: FeaturedBikeItem;
  large?: boolean;
}) {
  const skillLabel =
    item.skill_level.charAt(0).toUpperCase() + item.skill_level.slice(1);

  return (
    <div className="group bg-bg-white border-2 border-border rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(196,68,42,0.2)] hover:border-primary">
      {/* Image */}
      <div
        className={`relative ${
          large ? "aspect-[4/3]" : "aspect-[4/3]"
        } bg-white p-4 lg:p-6 overflow-hidden`}
      >
        {large && (
          <span className="absolute top-4 left-4 z-10 bg-primary text-white font-heading text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1.5 rounded-[4px]">
            ★ Featured
          </span>
        )}
        <div className="relative w-full h-full transition-transform duration-[400ms] ease-out group-hover:translate-x-2">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={item.name}
              fill
              className="object-contain"
              loading="lazy"
              sizes={
                large
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className={`font-heading font-semibold ${
            large ? "text-[22px]" : "text-lg"
          } text-bg-dark uppercase mb-2`}
        >
          {item.name}
        </h3>
        <p className="font-body text-sm text-text-secondary mb-3">
          {skillLabel}
        </p>
        {item.price > 0 ? (
          <p className="mb-4">
            <span
              className={`font-heading font-bold ${
                large ? "text-2xl" : "text-xl"
              } text-bg-dark`}
            >
              {formatPrice(item.price)}
            </span>
            <span className="font-body text-sm text-text-secondary">
              {" "}
              /day
            </span>
          </p>
        ) : (
          <p className="font-body text-sm text-text-secondary mb-4">
            Contact for pricing
          </p>
        )}
        <a
          href="https://getrenta.io/shops/alpmx-test?utm_source=alpmx-site&utm_medium=bike-card&utm_campaign=view-details"
          target="_blank"
          rel="noopener noreferrer"
          className={`block text-center bg-bg-dark text-white font-heading font-semibold text-[15px] ${
            large ? "py-3.5" : "py-3"
          } rounded-[4px] hover:bg-primary transition-colors duration-200`}
        >
          {item.price > 0 ? "VIEW DETAILS" : "INQUIRE"}
        </a>
      </div>
    </div>
  );
}
