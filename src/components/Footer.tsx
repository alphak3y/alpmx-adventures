import Image from "next/image";

const footerLinks = {
  Rentals: [
    { label: "Dirt Bikes", href: "https://getrenta.io/shops/alpmx-test?utm_source=alpmx-site&utm_medium=footer&utm_campaign=rentals" },
    { label: "Trailers", href: "https://getrenta.io/shops/alpmx-test?utm_source=alpmx-site&utm_medium=footer&utm_campaign=rentals" },
    { label: "Gear", href: "https://getrenta.io/shops/alpmx-test?utm_source=alpmx-site&utm_medium=footer&utm_campaign=rentals" },
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Book a Cabin", href: "#cabin" },
  ],
  Contact: [
    { label: "385-236-8986", href: "tel:3852368986" },
    { label: "ride.alpmx@gmail.com", href: "mailto:ride.alpmx@gmail.com" },
    { label: "Apple Valley, UT", href: "#locations" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-bg-dark pt-12 sm:pt-16 pb-8 overflow-visible" role="contentinfo">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10">
        {/* Logo */}
        <div className="mb-10 flex justify-center sm:justify-start">
          <Image
            src="/images/logo.png"
            alt="AlpMX Adventures"
            width={64}
            height={64}
            className="h-12 sm:h-16 w-auto rounded-full drop-shadow-[0_0_10px_rgba(212,175,55,0.55)]"
            loading="lazy"
          />
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-sm uppercase text-text-secondary tracking-[0.08em] mb-4">
                {title}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="font-body text-[15px] text-text-light/70 hover:text-text-light transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#3D3835] mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-[13px] text-text-secondary">
            © 2026 AlpMX Adventures. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a
              href="/"
              aria-label="Instagram"
              className="text-text-secondary hover:text-primary transition-colors duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="/"
              aria-label="Facebook"
              className="text-text-secondary hover:text-primary transition-colors duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="/"
              aria-label="YouTube"
              className="text-text-secondary hover:text-primary transition-colors duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
