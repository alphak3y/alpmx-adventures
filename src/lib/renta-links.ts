const SHOP_URL =
  process.env.NEXT_PUBLIC_RENTA_SHOP_URL ||
  "https://getrenta.io/shops/alpmx-test";

const BOOK_URL = `${SHOP_URL}/book`;

/**
 * Link to the shop storefront page.
 */
export function rentaShopLink(utmMedium: string, utmContent?: string): string {
  const params = new URLSearchParams({
    utm_source: "alpmx-site",
    utm_medium: utmMedium,
    utm_campaign: "rentals",
  });
  if (utmContent) params.set("utm_content", utmContent);
  return `${SHOP_URL}?${params}`;
}

/**
 * Direct booking link with optional item preselection.
 * - Single item: rentaBookLink("bike-card", "ktm-300sx")
 * - Multiple items: rentaBookLink("bike-card", "ktm-300sx,complete-gear-bag")
 * - No preselection: rentaBookLink("cta-banner")
 */
export function rentaBookLink(
  utmMedium: string,
  preSelectSlugs?: string,
  utmContent?: string
): string {
  const params = new URLSearchParams({
    utm_source: "alpmx-site",
    utm_medium: utmMedium,
    utm_campaign: "rentals",
  });
  if (preSelectSlugs) params.set("pre", preSelectSlugs);
  if (utmContent) params.set("utm_content", utmContent);
  return `${BOOK_URL}?${params}`;
}
