const SHOP_URL =
  process.env.NEXT_PUBLIC_RENTA_SHOP_URL ||
  "https://getrenta.io/shops/alpmx-test";

export function rentaShopLink(utmMedium: string, utmContent?: string): string {
  const params = new URLSearchParams({
    utm_source: "alpmx-site",
    utm_medium: utmMedium,
    utm_campaign: "rentals",
  });
  if (utmContent) params.set("utm_content", utmContent);
  return `${SHOP_URL}?${params}`;
}
