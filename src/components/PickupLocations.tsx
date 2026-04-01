import Image from "next/image";

export interface PickupLocationData {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours: Record<string, string>;
}

// Default images for locations — API only provides address/hours, not photos
const locationImages: Record<
  string,
  { image: string; alt: string; mapUrl: string }
> = {
  "Southern Utah (Main Shop)": {
    image: "https://www.alpmxadventures.com/media/g2-1_1772521218.jpg",
    alt: "Southern Utah pickup location with red rock scenery",
    mapUrl: "https://www.google.com/maps/search/Apple+Valley+UT+84737",
  },

};

const defaultLocationImage = {
  image: "https://www.alpmxadventures.com/media/g2-1_1772521218.jpg",
  alt: "Pickup location",
  mapUrl: "#",
};

function formatHours(hours: Record<string, string>): string {
  // Find the most common schedule to display concisely
  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const entries = dayOrder
    .filter((d) => hours[d])
    .map((d) => ({ day: d, hours: hours[d] }));

  if (entries.length === 0) return "Contact for hours";

  // Check if all weekdays are the same
  const weekdays = entries.filter(
    (e) => e.day !== "saturday" && e.day !== "sunday"
  );
  const saturday = entries.find((e) => e.day === "saturday");
  const sunday = entries.find((e) => e.day === "sunday");

  const allWeekdaysSame =
    weekdays.length > 0 &&
    weekdays.every((e) => e.hours === weekdays[0].hours);

  if (allWeekdaysSame) {
    const parts: string[] = [`Mon–Fri: ${weekdays[0].hours}`];
    if (saturday) parts.push(`Sat: ${saturday.hours}`);
    if (sunday) parts.push(`Sun: ${sunday.hours}`);
    return parts.join(" · ");
  }

  return entries
    .map(
      (e) =>
        `${e.day.charAt(0).toUpperCase() + e.day.slice(1, 3)}: ${e.hours}`
    )
    .join(" · ");
}

export default function PickupLocations({
  locations,
}: {
  locations: PickupLocationData[];
}) {
  return (
    <section className="bg-bg-dark py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-light uppercase tracking-[0.02em] mb-3">
          Pickup Locations
        </h2>
        <p className="font-body text-base text-text-secondary mb-12">
          {locations.length > 0
            ? `${locations.length} location${locations.length !== 1 ? "s" : ""} in Utah`
            : "Located in Southern Utah"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const img = locationImages[loc.name] ?? defaultLocationImage;
            const mapUrl =
              img.mapUrl !== "#"
                ? img.mapUrl
                : `https://www.google.com/maps/search/${encodeURIComponent(loc.address)}`;

            return (
              <div
                key={loc.id}
                className="bg-bg-dark-card rounded-md overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={img.image}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-[22px] text-text-light uppercase mb-2">
                    {loc.name}
                  </h3>
                  <p className="font-body text-sm text-text-secondary mb-1">
                    {loc.address}
                  </p>
                  {loc.phone && (
                    <p className="font-body text-sm text-text-secondary mb-1">
                      {loc.phone}
                    </p>
                  )}
                  <p className="font-body text-xs text-text-secondary mb-4">
                    {formatHours(loc.hours)}
                  </p>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[15px] font-medium text-primary hover:underline"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
