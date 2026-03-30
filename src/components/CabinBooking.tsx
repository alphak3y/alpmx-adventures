// TODO: Fetch cabin data from Renta API once cabin endpoints are built (v1.1)
import Image from "next/image";

export default function CabinBooking() {
  return (
    <section id="cabin" className="bg-bg-light py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Image — 55% */}
          <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:h-[480px] rounded-md overflow-hidden">
            <Image
              src="https://www.alpmxadventures.com/media/1772452731_1_g1.jpg"
              alt="Rider with dirt bike overlooking Utah mountains — cabin retreat"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>

          {/* Text — 45% */}
          <div className="lg:col-span-5 lg:pl-8 py-4 lg:py-12">
            <h2 className="font-heading font-semibold text-[24px] sm:text-[28px] lg:text-[44px] leading-tight text-text-primary uppercase tracking-[0.02em] mb-4">
              Stay The Night
            </h2>
            <p className="font-body text-[15px] sm:text-base lg:text-[17px] text-text-secondary leading-relaxed mb-8">
              Book our cabin and make it a weekend adventure. Located near Southern Utah&apos;s best trails, it&apos;s the perfect basecamp for a multi-day ride.
            </p>
            <a
              href="#cabin"
              className="inline-block bg-primary text-white font-heading font-semibold text-[15px] lg:text-base px-10 py-4 rounded-[4px] hover:bg-primary-hover transition-colors duration-200"
            >
              BOOK A CABIN →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
