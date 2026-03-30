/**
 * Server-side data fetching using the storefront API.
 *
 * Uses direct fetch with the publishable key since the secret key
 * (RENTA_API_KEY) is not yet configured. The storefront endpoints
 * work with publishable keys for read operations.
 *
 * Once the secret key is available, this can be switched to use the
 * SDK's Renta class with renta.fleet.items.list() for richer data.
 */

const API_BASE = 'https://api.getrenta.io/v1';
const API_KEY = process.env.NEXT_PUBLIC_RENTA_PK!;

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

interface ShopProfile {
  id: string;
  slug: string;
  name: string;
  pickup_locations: PickupLocation[];
}

interface InventoryResult {
  items: StorefrontItem[];
  categories: StorefrontCategory[];
}

/**
 * Fetch inventory via the storefront endpoint.
 * We use a far-future date range to get all available items.
 */
export async function getInventory(): Promise<InventoryResult> {
  try {
    // Use a date range far enough out to get all items
    const pickup = new Date();
    pickup.setDate(pickup.getDate() + 30);
    const returnDate = new Date(pickup);
    returnDate.setDate(returnDate.getDate() + 2);

    const params = new URLSearchParams({
      pickup_date: pickup.toISOString(),
      return_date: returnDate.toISOString(),
    });

    const res = await fetch(`${API_BASE}/storefront/inventory?${params}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) return { items: [], categories: [] };
    const data = await res.json();
    return {
      items: data.items ?? [],
      categories: data.categories ?? [],
    };
  } catch {
    return { items: [], categories: [] };
  }
}

/**
 * Fetch shop profile (includes pickup locations).
 */
export async function getShopProfile(): Promise<ShopProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/storefront/shop`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Convenience: get just the pickup locations.
 */
export async function getPickupLocations(): Promise<PickupLocation[]> {
  const shop = await getShopProfile();
  return shop?.pickup_locations ?? [];
}
