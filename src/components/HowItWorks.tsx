const steps = [
  {
    number: "01",
    title: "Select Bike & Gear",
    description: "Browse our fleet and pick the right machine for your skill level and trail preference.",
  },
  {
    number: "02",
    title: "Pick Your Date",
    description: "Choose your rental dates and pickup location — Southern or Northern Utah.",
  },
  {
    number: "03",
    title: "Complete Your Order",
    description: "Book online or call us. Show up, gear up, and hit the trails.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-bg-dark py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <h2 className="font-heading font-semibold text-[28px] lg:text-[44px] leading-tight text-text-light uppercase tracking-[0.02em] mb-16 text-center">
          How It Works
        </h2>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-[16.67%] right-[16.67%] h-[1px] bg-[#3D3835]" />

          <div className="grid grid-cols-3 gap-8 text-center">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="relative z-10 inline-block font-heading font-bold text-[64px] text-primary leading-none bg-bg-dark px-4">
                  {step.number}
                </span>
                <h3 className="font-heading font-semibold text-xl text-text-light uppercase mt-6 mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-[15px] text-text-secondary max-w-[280px] mx-auto leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative pl-14">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-[#3D3835]" />

          <div className="flex flex-col gap-12">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="absolute -left-14 top-0 font-heading font-bold text-[36px] text-primary leading-none bg-bg-dark pr-2">
                  {step.number}
                </span>
                <h3 className="font-heading font-semibold text-base sm:text-xl text-text-light uppercase mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="font-body text-[15px] text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
