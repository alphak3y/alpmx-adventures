/**
 * Server-side data fetching using the Renta SDK storefront client.
 */

import { storefront } from '@/lib/renta-storefront';

export interface StorefrontItem {
  fleet_item_id: string;
  name: string;
  slug: string;
  category_id: string;
  photo: string | null;
  skill_level: string;
  price: number;
  deposit_amount: number;
  rate_type: string;
  available: boolean;
  reason: string | null;
}

export interface StorefrontCategory {
  id: string;
  name: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours: Record<string, string>;
}

interface InventoryResult {
  items: StorefrontItem[];
  categories: StorefrontCategory[];
}

/**
 * Fetch inventory via the SDK's storefront.inventory() method.
 * We use a far-future date range to get all available items.
 */
export async function getInventory(): Promise<InventoryResult> {
  try {
    const pickup = new Date();
    pickup.setDate(pickup.getDate() + 30);
    const returnDate = new Date(pickup);
    returnDate.setDate(returnDate.getDate() + 2);

    const data = await storefront.inventory({
      pickup_date: pickup.toISOString(),
      return_date: returnDate.toISOString(),
    });

    return {
      items: (data.items ?? []) as StorefrontItem[],
      categories: (data.categories ?? []) as StorefrontCategory[],
    };
  } catch {
    return { items: [], categories: [] };
  }
}

/**
 * Fetch shop profile via the SDK's storefront.shop() method.
 */
export async function getShopProfile() {
  try {
    return await storefront.shop();
  } catch {
    return null;
  }
}

/**
 * Convenience: get just the pickup locations.
 */
export async function getPickupLocations(): Promise<PickupLocation[]> {
  const shop = await getShopProfile();
  return (shop?.pickup_locations ?? []) as PickupLocation[];
}
