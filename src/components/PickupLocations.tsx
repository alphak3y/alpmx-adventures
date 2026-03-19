import Image from "next/image";

const locations = [
  {
    title: "Southern Utah",
    address: "Apple Valley, UT",
    image: "https://www.alpmxadventures.com/media/g2-1_1772521218.jpg",
    alt: "Southern Utah pickup location with red rock scenery",
    mapUrl: "https://www.google.com/maps/search/Apple+Valley+UT",
  },
  {
    title: "Northern Utah",
    address: "Contact for details",
    image: "https://www.alpmxadventures.com/media/g2-2_1772521218.jpg",
    alt: "Northern Utah pickup location",
    mapUrl: "https://www.google.com/maps/search/Northern+Utah",
  },
];

export default function PickupLocations() {
  return (
    <section className="bg-bg-dark py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-light uppercase tracking-[0.02em] mb-3">
          Pickup Locations
        </h2>
        <p className="font-body text-base text-text-secondary mb-12">
          Two locations across Utah
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.title}
              className="bg-bg-dark-card rounded-md overflow-hidden"
            >
              <div className="relative aspect-video">
                <Image
                  src={loc.image}
                  alt={loc.alt}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading font-semibold text-[22px] text-text-light uppercase mb-2">
                  {loc.title}
                </h3>
                <p className="font-body text-sm text-text-secondary mb-4">
                  {loc.address}
                </p>
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[15px] font-medium text-primary hover:underline"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
