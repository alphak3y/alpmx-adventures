import { Renta } from '@renta/sdk';

export const renta = new Renta({
  apiKey: process.env.RENTA_API_KEY!,
  baseUrl: 'https://api.getrenta.io/v1',
});
