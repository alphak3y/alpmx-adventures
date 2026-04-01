import { rentaShopLink } from "@/lib/renta-links";

export default function CTABanner() {
  return (
    <section id="book" className="bg-primary py-12 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 text-center">
        <h2 className="font-heading font-bold text-[32px] lg:text-[44px] leading-tight text-white uppercase tracking-[0.02em] mb-4">
          Ready To Ride?
        </h2>
        <p className="font-body text-lg text-white/85 mb-10">
          Book your bike today. We handle the rest.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={rentaShopLink("cta-banner")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary font-heading font-semibold text-base px-10 py-4 rounded-[4px] hover:bg-bg-light transition-colors duration-200 w-full sm:w-auto text-center max-w-[320px]"
          >
            BOOK NOW
          </a>
          <a
            href="tel:3852368986"
            className="border border-white text-white font-heading font-semibold text-base px-10 py-4 rounded-[4px] hover:bg-white/10 transition-colors duration-200 w-full sm:w-auto text-center max-w-[320px]"
          >
            CALL US: 385-236-8986
          </a>
        </div>
      </div>
    </section>
  );
}
