export default function TrustBar() {
  const items = [
    "★ 5-Star Rated",
    "100+ Bikes Rented",
    "Southern & Northern Utah",
    "Mon–Sat 8AM–7PM",
  ];

  return (
    <section className="bg-bg-dark py-6 border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="font-body text-sm font-medium text-white/65 uppercase tracking-[0.05em]">
                {item}
              </span>
              {i < items.length - 1 && (
                <span className="hidden sm:inline text-white/30">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
