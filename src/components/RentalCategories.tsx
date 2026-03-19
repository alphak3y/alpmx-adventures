import Image from "next/image";

const categories = [
  {
    title: "Dirt Bikes",
    price: "From $140/day",
    image: "https://www.alpmxadventures.com/media/s3-1_1772452186.jpg",
    alt: "Dirt bike rider navigating rocky Utah terrain",
  },
  {
    title: "Trailers",
    price: "Contact for pricing",
    image: "https://www.alpmxadventures.com/media/s3-2_1772452186.jpg",
    alt: "Enclosed trailer for hauling dirt bikes",
  },
  {
    title: "Gear & Equipment",
    price: "Contact for pricing",
    image: "https://www.alpmxadventures.com/media/s3-3_1772452186.jpg",
    alt: "Off-road riding gear and protective equipment",
  },
];

export default function RentalCategories() {
  return (
    <section className="bg-bg-dark py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-light uppercase tracking-[0.02em] mb-3">
          What&apos;s Your Ride?
        </h2>
        <p className="font-body text-base text-text-secondary mb-12">
          Choose your adventure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <a
              key={cat.title}
              href="#rentals"
              className="group bg-bg-dark-card rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
            >
              <div className="relative aspect-[16/9] md:aspect-[4/3] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading font-semibold text-[22px] text-text-light uppercase mb-2">
                  {cat.title}
                </h3>
                <p className="font-body text-sm text-text-secondary mb-4">
                  {cat.price}
                </p>
                <span className="font-body text-[15px] font-medium text-primary hover:underline">
                  Browse →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
