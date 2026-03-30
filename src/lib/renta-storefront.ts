import { RentaStorefront } from '@renta/sdk/storefront';

export const storefront = new RentaStorefront({
  apiKey: process.env.NEXT_PUBLIC_RENTA_PK!,
  baseUrl: process.env.NEXT_PUBLIC_RENTA_API_URL || 'https://api.getrenta.io/v1',
});
