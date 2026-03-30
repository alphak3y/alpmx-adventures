import { RentaStorefront } from '@renta/sdk/storefront';

export const storefront = new RentaStorefront({
  apiKey: process.env.NEXT_PUBLIC_RENTA_PK!,
  baseUrl: 'https://api.getrenta.io/v1',
});
