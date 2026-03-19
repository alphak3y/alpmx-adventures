const testimonials = [
  {
    quote:
      "Best rental experience we've ever had. Bikes were in perfect condition and the trails in Southern Utah are unreal. Already booked our next trip.",
    name: "Jason M.",
    location: "Salt Lake City, UT",
  },
  {
    quote:
      "Rented a Husqvarna TC250 for the weekend. Pickup was easy, bike ran flawlessly. These guys know their stuff.",
    name: "Tyler R.",
    location: "Las Vegas, NV",
  },
  {
    quote:
      "Took the family on CRF 125s and 250s. The team helped us pick the right bikes for everyone's skill level. Can't recommend enough.",
    name: "Sarah K.",
    location: "St. George, UT",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-bg-dark py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-light uppercase tracking-[0.02em] mb-12 text-center">
          What Riders Say
        </h2>

        <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-bg-dark-card rounded-md p-6 sm:p-8"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="#D4714E"
                  >
                    <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.7l5.34-.78L10 1z" />
                  </svg>
                ))}
              </div>
              <blockquote className="font-body text-base text-text-light italic leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-heading text-sm font-medium text-text-secondary">
                  — {t.name}
                </p>
                <p className="font-body text-xs text-text-secondary/60">
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
