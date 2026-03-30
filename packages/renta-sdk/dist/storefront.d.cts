interface RentaConfig {
    /** Required. Secret key (renta_sk_) or publishable key (renta_pk_). */
    apiKey: string;
    /** API base URL. Default: 'https://api.getrenta.io/v1' */
    baseUrl?: string;
    /** Request timeout in milliseconds. Default: 30000 (30s) */
    timeout?: number;
    /** Maximum retry attempts for 429/5xx errors. Default: 3 */
    maxRetries?: number;
    /** Base delay for retry backoff in milliseconds. Default: 1000 */
    retryDelay?: number;
    /** Custom fetch implementation. Default: globalThis.fetch */
    fetch?: typeof fetch;
    /** Optional structured logger. */
    logger?: RentaLogger;
}
interface RentaLogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}

/** UUID string type alias for documentation. */
type UUID = string;
/** ISO 8601 datetime string. */
type DateTime = string;
/** Pagination parameters accepted by all list methods. */
interface PaginationParams {
    /** Max results per page (1-100). Default: 25. */
    limit?: number;
    /** Opaque cursor from a previous response. */
    cursor?: string;
}
/** Raw paginated API response shape (before wrapping in Paginated<T>). */
interface PaginatedResponse<T> {
    data: T[];
    has_more: boolean;
    next_cursor: string | null;
}
interface CheckAvailabilityInput {
    pickup_date: DateTime;
    return_date: DateTime;
    fleet_item_ids?: UUID[];
    category_id?: UUID;
}
interface AvailabilityItemResult {
    fleet_item_id: UUID;
    name: string;
    slug: string;
    category_id: UUID;
    available: boolean;
    reason: string | null;
    pricing: {
        base_price: number;
        total: number;
        rate_type: string;
    } | null;
}
interface AvailabilityResult {
    data: AvailabilityItemResult[];
}
interface CalculatePricingInput {
    fleet_item_id: UUID;
    pickup_date: DateTime;
    return_date: DateTime;
    half_day?: boolean;
    addons?: {
        addon_id: UUID;
        quantity?: number;
    }[];
    coupon_code?: string;
}
interface PricingAddonLine {
    addon_id: UUID;
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}
interface PricingBreakdown {
    base_price: number;
    multi_day_discount: number;
    seasonal_adjustment: number;
    addon_total: number;
    addon_line_items: PricingAddonLine[];
    package_savings: number;
    coupon_discount: number;
    subtotal: number;
    tax_amount: number;
    total: number;
    deposit_hold_amount: number;
    renta_fee_amount: number;
    rate_type: string;
    rental_days: number;
}

type CouponDiscountType = 'percent' | 'fixed';
interface ValidateCouponInput {
    code: string;
    customer_id?: UUID;
    fleet_item_ids?: UUID[];
    category_id?: UUID;
}
interface CouponValidation {
    valid: boolean;
    coupon: {
        id: UUID;
        code: string;
        discount_type: CouponDiscountType;
        discount_value: number;
    } | null;
    message: string;
}

type WaiverType = 'single' | 'group';
type SignatureType = 'typed' | 'drawn';
interface WaiverTemplate {
    id: UUID;
    name: string;
    content: string;
    type: WaiverType;
    expiration_days: number;
    active: boolean;
    created_at: DateTime;
    updated_at: DateTime;
}
interface WaiverTemplateListParams extends PaginationParams {
    active?: boolean;
}
interface SignWaiverInput {
    booking_id: UUID;
    waiver_template_id: UUID;
    signer_name: string;
    signer_email?: string;
    signature_data: {
        type: SignatureType;
        value: string;
    };
}
interface WaiverSignResult {
    success: true;
    waiver_id: UUID;
    pdf_url: string;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface BookingLineItemInput {
    fleet_item_id: UUID;
    quantity?: number;
}
interface BookingAddonInput {
    addon_id: UUID;
    quantity?: number;
}

interface ShopBrandSettings {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    hero_image_url: string | null;
    hero_headline: string | null;
    hero_subheadline: string | null;
    footer_text: string | null;
}
interface PickupLocation {
    id: UUID;
    name: string;
    address: string;
    phone: string | null;
    hours: Record<string, string>;
}
interface ShopProfile {
    id: UUID;
    slug: string;
    name: string;
    brand_settings: ShopBrandSettings;
    pickup_locations: PickupLocation[];
}
interface StorefrontInventoryParams {
    pickup_date: DateTime;
    return_date: DateTime;
    half_day?: boolean;
}
interface StorefrontInventoryItem {
    fleet_item_id: UUID;
    name: string;
    slug: string;
    category_id: UUID;
    photo: string | null;
    skill_level: SkillLevel;
    price: number;
    deposit_amount: number;
    rate_type: string;
    available: boolean;
    reason: string | null;
}
interface StorefrontInventoryCategory {
    id: UUID;
    name: string;
}
interface StorefrontInventoryResult {
    items: StorefrontInventoryItem[];
    categories: StorefrontInventoryCategory[];
}
interface StorefrontBookInput {
    payment_intent_id: string;
    customer_id?: UUID;
    pickup_date: DateTime;
    return_date: DateTime;
    pickup_location_id?: UUID;
    half_day?: boolean;
    coupon_code?: string;
    line_items: BookingLineItemInput[];
    addons?: BookingAddonInput[];
}
interface StorefrontBookingResult {
    booking_id: UUID;
    confirmation_number: string;
}

/**
 * Paginated result that is both PromiseLike and AsyncIterable.
 *
 * - `await list()` → resolves to a Paginated<T> with .data, .hasMore, .nextCursor
 * - `for await (const item of list())` → iterates all items across all pages
 * - `await list().toArray()` → collects all items into an array
 */
declare class Paginated<T> implements AsyncIterable<T> {
    /** Items in the current page. */
    readonly data: T[];
    /** Whether more pages exist. */
    readonly hasMore: boolean;
    /** Cursor to fetch the next page (null if no more pages). */
    readonly nextCursor: string | null;
    private readonly fetchPage;
    constructor(response: PaginatedResponse<T>, fetchPage: (cursor: string) => Promise<PaginatedResponse<T>>);
    /**
     * Async iterator that automatically fetches subsequent pages.
     * Yields individual items, not pages.
     */
    [Symbol.asyncIterator](): AsyncIterator<T>;
    /**
     * Collect ALL items across all pages into a single array.
     * ⚠️ Use with caution on large datasets.
     */
    toArray(): Promise<T[]>;
    /**
     * Fetch the next page. Returns null if no more pages.
     */
    nextPage(): Promise<Paginated<T> | null>;
    /**
     * Create a Paginated<T> from a promise that resolves to the first page.
     * Returns a PaginatedPromise that is both PromiseLike<Paginated<T>> and AsyncIterable<T>.
     */
    static from<T>(initialPromise: Promise<PaginatedResponse<T>>, fetchPage: (cursor: string) => Promise<PaginatedResponse<T>>): PaginatedPromise<T>;
}
/**
 * A lazy wrapper that is both PromiseLike<Paginated<T>> and AsyncIterable<T>.
 * The initial fetch only happens when awaited or iterated.
 */
declare class PaginatedPromise<T> implements PromiseLike<Paginated<T>>, AsyncIterable<T> {
    private readonly _initialPromise;
    private readonly _fetchPage;
    private _resolved;
    constructor(initialPromise: Promise<PaginatedResponse<T>>, fetchPage: (cursor: string) => Promise<PaginatedResponse<T>>);
    private _resolve;
    then<TResult1 = Paginated<T>, TResult2 = never>(onfulfilled?: ((value: Paginated<T>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    [Symbol.asyncIterator](): AsyncIterator<T>;
    /**
     * Collect ALL items across all pages into a single array.
     */
    toArray(): Promise<T[]>;
}

/**
 * Browser-safe Renta client that only accepts publishable keys (renta_pk_).
 * Exposes storefront-specific endpoints for customer-facing UIs.
 */
declare class RentaStorefront {
    private readonly transport;
    constructor(config: RentaConfig);
    /** Get the shop profile. */
    shop(): Promise<ShopProfile>;
    /** Browse available inventory for given dates. */
    inventory(params: StorefrontInventoryParams): Promise<StorefrontInventoryResult>;
    /** Create a storefront booking (requires confirmed payment). */
    book(input: StorefrontBookInput): Promise<StorefrontBookingResult>;
    /** Validate a coupon code. */
    validateCoupon(input: ValidateCouponInput): Promise<CouponValidation>;
    /** Calculate pricing for items + dates. */
    calculatePricing(input: CalculatePricingInput): Promise<PricingBreakdown>;
    /** Check availability for items + dates. */
    checkAvailability(input: CheckAvailabilityInput): Promise<AvailabilityResult>;
    /** List waiver templates. */
    waiverTemplates(params?: WaiverTemplateListParams): PaginatedPromise<WaiverTemplate>;
    /** Sign a waiver. */
    signWaiver(input: SignWaiverInput): Promise<WaiverSignResult>;
}

/** Shape of the error response from the Renta API. */
interface ApiErrorBody {
    error: {
        code: string;
        message: string;
        details?: {
            errors?: ValidationFieldError[];
            [key: string]: unknown;
        };
    };
}
interface ValidationFieldError {
    field: string;
    message: string;
}
/**
 * Base error for all Renta API errors.
 */
declare class RentaError extends Error {
    /** HTTP status code from the API response. */
    readonly statusCode: number;
    /** Machine-readable error code from the API. */
    readonly code: string;
    /** X-Request-Id from the API response (for support). */
    readonly requestId: string;
    /** Additional error details from the API response. */
    readonly details?: Record<string, unknown>;
    constructor(statusCode: number, body: ApiErrorBody, requestId: string);
}
/**
 * Thrown on 401 (unauthorized) or 403 (forbidden).
 */
declare class RentaAuthError extends RentaError {
    constructor(statusCode: number, body: ApiErrorBody, requestId: string);
}
/**
 * Thrown on 400 (bad request) or 422 (unprocessable entity).
 */
declare class RentaValidationError extends RentaError {
    /** Array of field-level validation errors. */
    readonly errors: ValidationFieldError[];
    constructor(statusCode: number, body: ApiErrorBody, requestId: string);
}

export { type AvailabilityResult, type CalculatePricingInput, type CheckAvailabilityInput, type CouponValidation, Paginated, PaginatedPromise, type PickupLocation, type PricingBreakdown, RentaAuthError, type RentaConfig, RentaError, type RentaLogger, RentaStorefront, RentaValidationError, type ShopBrandSettings, type ShopProfile, type SignWaiverInput, type StorefrontBookInput, type StorefrontBookingResult, type StorefrontInventoryCategory, type StorefrontInventoryItem, type StorefrontInventoryParams, type StorefrontInventoryResult, type ValidateCouponInput, type WaiverSignResult, type WaiverTemplate, type WaiverTemplateListParams };
