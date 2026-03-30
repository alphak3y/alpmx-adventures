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

interface RequestOptions {
    /** JSON-serializable request body. */
    body?: unknown;
    /** URL query parameters. */
    query?: Record<string, string | number | boolean | string[] | undefined>;
    /** Optional idempotency key for write operations. */
    idempotencyKey?: string;
}
interface ApiResponse<T> {
    /** Parsed response body. */
    data: T;
    /** HTTP status code. */
    status: number;
    /** X-Request-Id from the response. */
    requestId: string;
    /** Parsed rate limit info from response headers. */
    rateLimit: RateLimitInfo;
}
interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
}
declare class Transport {
    private readonly baseUrl;
    private readonly timeout;
    private readonly maxRetries;
    private readonly retryDelay;
    private readonly apiKey;
    private readonly _fetch;
    private readonly logger?;
    private readonly userAgent;
    constructor(config: RentaConfig);
    request<T>(method: string, path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}

declare abstract class Resource {
    protected readonly transport: Transport;
    constructor(transport: Transport);
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
/** Sort direction. */
type SortOrder = 'asc' | 'desc';
/** Standard delete response. */
interface DeleteResult {
    deleted: true;
    id: string;
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

interface FleetCategory {
    id: UUID;
    name: string;
    slug: string;
    sort_order: number;
    description: string | null;
    image_url: string | null;
    created_at: DateTime;
    updated_at: DateTime;
}
interface FleetItemPhoto {
    url: string;
    alt: string;
    is_primary: boolean;
}
type FleetItemStatus = 'available' | 'maintenance' | 'retired';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
type DepositHoldTiming = 'at_booking' | 'at_pickup';
interface FleetItemCategory {
    id: UUID;
    name: string;
    slug: string;
}
interface FleetItem {
    id: UUID;
    category_id: UUID;
    name: string;
    slug: string;
    description: string | null;
    skill_level: SkillLevel;
    status: FleetItemStatus;
    photos: FleetItemPhoto[];
    price_half_day: number;
    price_full_day: number;
    price_multi_day: number | null;
    price_weekly: number | null;
    deposit_amount: number;
    deposit_hold_timing: DepositHoldTiming;
    deposit_hold_duration: string;
    deposit_auto_release: boolean;
    min_duration: number;
    max_duration: number | null;
    buffer_hours: number;
    same_day_booking: boolean;
    notice_hours: number;
    sort_order: number;
    created_at: DateTime;
    updated_at: DateTime;
    category: FleetItemCategory;
}
interface FleetCategoryListParams extends PaginationParams {
}
interface FleetItemListParams extends PaginationParams {
    category_id?: UUID;
    status?: FleetItemStatus;
    query?: string;
    skill_level?: SkillLevel;
    min_price?: number;
    max_price?: number;
    sort?: 'name' | 'price_full_day' | 'sort_order' | 'created_at';
    order?: SortOrder;
}
interface CreateFleetCategoryInput {
    name: string;
    slug: string;
    sort_order?: number;
    description?: string;
    image_url?: string;
}
interface UpdateFleetCategoryInput {
    name?: string;
    slug?: string;
    sort_order?: number;
    description?: string | null;
    image_url?: string | null;
}
interface CreateFleetItemInput {
    category_id: UUID;
    name: string;
    slug: string;
    description?: string;
    skill_level?: SkillLevel;
    status?: FleetItemStatus;
    photos?: FleetItemPhoto[];
    price_half_day: number;
    price_full_day: number;
    price_multi_day?: number;
    price_weekly?: number;
    deposit_amount: number;
    deposit_hold_timing?: DepositHoldTiming;
    deposit_hold_duration?: string;
    deposit_auto_release?: boolean;
    min_duration?: number;
    max_duration?: number;
    buffer_hours?: number;
    same_day_booking?: boolean;
    notice_hours?: number;
    sort_order?: number;
}
interface UpdateFleetItemInput {
    category_id?: UUID;
    name?: string;
    slug?: string;
    description?: string | null;
    skill_level?: SkillLevel;
    status?: FleetItemStatus;
    photos?: FleetItemPhoto[];
    price_half_day?: number;
    price_full_day?: number;
    price_multi_day?: number | null;
    price_weekly?: number | null;
    deposit_amount?: number;
    deposit_hold_timing?: DepositHoldTiming;
    deposit_hold_duration?: string;
    deposit_auto_release?: boolean;
    min_duration?: number;
    max_duration?: number | null;
    buffer_hours?: number;
    same_day_booking?: boolean;
    notice_hours?: number;
    sort_order?: number;
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

declare class FleetCategoriesResource extends Resource {
    /**
     * List fleet categories.
     * GET /fleet/categories
     */
    list(params?: FleetCategoryListParams): PaginatedPromise<FleetCategory>;
    /**
     * Get a single fleet category by ID.
     * GET /fleet/categories/:id
     */
    get(id: string): Promise<FleetCategory>;
    /**
     * Create a new fleet category.
     * POST /fleet/categories
     */
    create(input: CreateFleetCategoryInput): Promise<FleetCategory>;
    /**
     * Update a fleet category.
     * PATCH /fleet/categories/:id
     */
    update(id: string, input: UpdateFleetCategoryInput): Promise<FleetCategory>;
    /**
     * Delete a fleet category.
     * DELETE /fleet/categories/:id
     */
    del(id: string): Promise<DeleteResult>;
}
declare class FleetItemsResource extends Resource {
    /**
     * List fleet items with optional filters.
     * GET /fleet/items
     */
    list(params?: FleetItemListParams): PaginatedPromise<FleetItem>;
    /**
     * Get a single fleet item by ID.
     * GET /fleet/items/:id
     */
    get(id: string): Promise<FleetItem>;
    /**
     * Create a new fleet item.
     * POST /fleet/items
     */
    create(input: CreateFleetItemInput): Promise<FleetItem>;
    /**
     * Update a fleet item (partial update).
     * PATCH /fleet/items/:id
     */
    update(id: string, input: UpdateFleetItemInput): Promise<FleetItem>;
    /**
     * Delete (soft-delete) a fleet item.
     * DELETE /fleet/items/:id
     */
    del(id: string): Promise<DeleteResult>;
}

type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
interface BookingLineItem {
    id: UUID;
    fleet_item_id: UUID;
    quantity: number;
    unit_price: number;
    override_price: number | null;
    line_total: number;
}
interface BookingAddon {
    id: UUID;
    addon_id: UUID;
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}
interface BookingCustomerSummary {
    id: UUID;
    name: string;
    email: string;
    phone: string | null;
}
interface Booking {
    id: UUID;
    confirmation_number: string;
    customer_id: UUID;
    status: BookingStatus;
    pickup_date: DateTime;
    return_date: DateTime;
    pickup_location_id: UUID | null;
    half_day: boolean;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total: number;
    amount_paid: number;
    amount_owed: number;
    coupon_id: UUID | null;
    notes: string | null;
    cancelled_at: DateTime | null;
    created_at: DateTime;
    updated_at: DateTime;
    line_items: BookingLineItem[];
    addons: BookingAddon[];
    customer: BookingCustomerSummary;
}
interface BookingListParams extends PaginationParams {
    status?: BookingStatus;
    customer_id?: UUID;
    pickup_date_from?: DateTime;
    pickup_date_to?: DateTime;
}
interface BookingLineItemInput {
    fleet_item_id: UUID;
    quantity?: number;
}
interface BookingAddonInput {
    addon_id: UUID;
    quantity?: number;
}
interface CreateBookingInput {
    customer_id: UUID;
    pickup_date: DateTime;
    return_date: DateTime;
    pickup_location_id?: UUID;
    half_day?: boolean;
    notes?: string;
    coupon_code?: string;
    line_items: BookingLineItemInput[];
    addons?: BookingAddonInput[];
}
interface UpdateBookingInput {
    notes?: string;
    pickup_location_id?: UUID;
    status?: BookingStatus;
}
interface CancelBookingInput {
    reason?: string;
}
interface ExtendBookingInput {
    new_return_date: DateTime;
}
interface SwapItemInput {
    old_line_item_id: UUID;
    new_fleet_item_id: UUID;
    price_difference?: number;
}

declare class BookingsResource extends Resource {
    /**
     * List bookings with optional filters.
     * GET /bookings
     */
    list(params?: BookingListParams): PaginatedPromise<Booking>;
    /**
     * Get a single booking by ID.
     * GET /bookings/:id
     */
    get(id: string): Promise<Booking>;
    /**
     * Create a new booking.
     * POST /bookings
     */
    create(input: CreateBookingInput): Promise<Booking>;
    /**
     * Update booking metadata.
     * PATCH /bookings/:id
     */
    update(id: string, input: UpdateBookingInput): Promise<Booking>;
    /**
     * Cancel a booking.
     * POST /bookings/:id/cancel
     */
    cancel(id: string, input?: CancelBookingInput): Promise<Booking>;
    /**
     * Extend a booking's return date.
     * POST /bookings/:id/extend
     */
    extend(id: string, input: ExtendBookingInput): Promise<Booking>;
    /**
     * Swap a line item for a different fleet item.
     * POST /bookings/:id/swap-item
     */
    swapItem(id: string, input: SwapItemInput): Promise<Booking>;
}

interface Customer {
    id: UUID;
    name: string;
    email: string | null;
    phone: string | null;
    total_bookings: number;
    total_spent: number;
    avg_order_value: number;
    first_visit: DateTime | null;
    last_visit: DateTime | null;
    tags: string[];
    flags: string[];
    notes: string | null;
    created_at: DateTime;
    updated_at: DateTime;
    /** Only present when fetching a single customer via .get(). */
    recent_bookings?: {
        id: UUID;
        status: BookingStatus;
        pickup_date: DateTime;
        total: number;
    }[];
}
interface CustomerListParams extends PaginationParams {
    query?: string;
    tags?: string;
}
interface CreateCustomerInput {
    name: string;
    email?: string;
    phone?: string;
    tags?: string[];
    notes?: string;
}
interface UpdateCustomerInput {
    name?: string;
    email?: string | null;
    phone?: string | null;
    tags?: string[];
    notes?: string | null;
}

declare class CustomersResource extends Resource {
    /**
     * List customers with optional search and tag filters.
     * GET /customers
     */
    list(params?: CustomerListParams): PaginatedPromise<Customer>;
    /**
     * Get a single customer by ID.
     * GET /customers/:id
     */
    get(id: string): Promise<Customer>;
    /**
     * Create a new customer.
     * POST /customers
     */
    create(input: CreateCustomerInput): Promise<Customer>;
    /**
     * Update a customer (partial update).
     * PATCH /customers/:id
     */
    update(id: string, input: UpdateCustomerInput): Promise<Customer>;
}

type AddonPriceType = 'per_day' | 'flat';
interface Addon {
    id: UUID;
    name: string;
    description: string | null;
    price_type: AddonPriceType;
    price: number;
    image_url: string | null;
    sort_order: number;
    created_at: DateTime;
    updated_at: DateTime;
}
interface AddonListParams extends PaginationParams {
}
interface CreateAddonInput {
    name: string;
    description?: string;
    price_type?: AddonPriceType;
    price: number;
    image_url?: string;
    sort_order?: number;
}
interface UpdateAddonInput {
    name?: string;
    description?: string | null;
    price_type?: AddonPriceType;
    price?: number;
    image_url?: string | null;
    sort_order?: number;
}

declare class AddonsResource extends Resource {
    /**
     * List add-ons.
     * GET /addons
     */
    list(params?: AddonListParams): PaginatedPromise<Addon>;
    /**
     * Get a single add-on by ID.
     * GET /addons/:id
     */
    get(id: string): Promise<Addon>;
    /**
     * Create a new add-on.
     * POST /addons
     */
    create(input: CreateAddonInput): Promise<Addon>;
    /**
     * Update an add-on (partial update).
     * PATCH /addons/:id
     */
    update(id: string, input: UpdateAddonInput): Promise<Addon>;
    /**
     * Delete an add-on.
     * DELETE /addons/:id
     */
    del(id: string): Promise<DeleteResult>;
}

type CouponDiscountType = 'percent' | 'fixed';
interface Coupon {
    id: UUID;
    code: string;
    discount_type: CouponDiscountType;
    /** For percent: whole number (10 = 10%). For fixed: cents (1000 = $10). */
    discount_value: number;
    valid_from: DateTime | null;
    valid_to: DateTime | null;
    max_uses: number | null;
    uses_count: number;
    per_customer_limit: number;
    restrict_categories: UUID[];
    restrict_items: UUID[];
    active: boolean;
    created_at: DateTime;
    updated_at: DateTime;
}
interface CouponListParams extends PaginationParams {
    active?: boolean;
}
interface CreateCouponInput {
    code: string;
    discount_type?: CouponDiscountType;
    discount_value: number;
    valid_from?: DateTime;
    valid_to?: DateTime;
    max_uses?: number;
    per_customer_limit?: number;
    restrict_categories?: UUID[];
    restrict_items?: UUID[];
    active?: boolean;
}
interface UpdateCouponInput {
    code?: string;
    discount_type?: CouponDiscountType;
    discount_value?: number;
    valid_from?: DateTime | null;
    valid_to?: DateTime | null;
    max_uses?: number | null;
    per_customer_limit?: number;
    restrict_categories?: UUID[];
    restrict_items?: UUID[];
    active?: boolean;
}
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

declare class CouponsResource extends Resource {
    /**
     * List coupons with optional active filter.
     * GET /coupons
     */
    list(params?: CouponListParams): PaginatedPromise<Coupon>;
    /**
     * Get a single coupon by ID.
     * GET /coupons/:id
     */
    get(id: string): Promise<Coupon>;
    /**
     * Create a new coupon.
     * POST /coupons
     */
    create(input: CreateCouponInput): Promise<Coupon>;
    /**
     * Update a coupon (partial update).
     * PATCH /coupons/:id
     */
    update(id: string, input: UpdateCouponInput): Promise<Coupon>;
    /**
     * Delete a coupon.
     * DELETE /coupons/:id
     */
    del(id: string): Promise<DeleteResult>;
    /**
     * Validate a coupon code without applying it.
     * POST /coupons/validate
     */
    validate(input: ValidateCouponInput): Promise<CouponValidation>;
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
interface WaiverSignerStatus {
    signer_name: string;
    signer_email: string | null;
    signed: boolean;
    signed_at: DateTime | null;
    expires_at: DateTime | null;
}
interface WaiverStatus {
    total_required: number;
    total_signed: number;
    all_signed: boolean;
    waivers: WaiverSignerStatus[];
}

declare class WaiversResource extends Resource {
    /**
     * List active waiver templates.
     * GET /waivers/templates
     */
    templates(params?: WaiverTemplateListParams): PaginatedPromise<WaiverTemplate>;
    /**
     * Sign a waiver for a booking.
     * POST /waivers/sign
     */
    sign(input: SignWaiverInput): Promise<WaiverSignResult>;
    /**
     * Get waiver signing status for a booking.
     * GET /waivers/status/:bookingId
     */
    status(bookingId: string): Promise<WaiverStatus>;
}

interface CreatePaymentIntentInput {
    booking_id: UUID;
    amount: number;
    customer_id: UUID;
    payment_method_id?: string;
    description?: string;
}
interface PaymentIntent {
    success: true;
    payment_intent_id: string;
    client_secret: string;
    amount: number;
    application_fee: number;
}
interface DepositHoldInput {
    booking_id: UUID;
    customer_id: UUID;
    amount: number;
    payment_method_id?: string;
    auto_release_at?: DateTime;
    notes?: string;
}
interface DepositHold {
    success: true;
    deposit_hold_id: UUID;
    payment_intent_id: string;
    client_secret: string;
    amount: number;
}
interface DepositCaptureInput {
    deposit_hold_id: UUID;
    amount?: number;
    notes?: string;
}
interface DepositReleaseInput {
    deposit_hold_id: UUID;
    notes?: string;
}
interface DepositResult {
    success: true;
    captured_amount?: number;
}

declare class PaymentsResource extends Resource {
    /**
     * Create a Stripe PaymentIntent for a booking.
     * POST /payments/create-intent
     */
    createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent>;
}

declare class DepositsResource extends Resource {
    /**
     * Place an authorization hold on a customer's card.
     * POST /deposits/hold
     */
    hold(input: DepositHoldInput): Promise<DepositHold>;
    /**
     * Capture all or part of a held deposit.
     * POST /deposits/capture
     */
    capture(input: DepositCaptureInput): Promise<DepositResult>;
    /**
     * Release a held deposit back to the customer.
     * POST /deposits/release
     */
    release(input: DepositReleaseInput): Promise<DepositResult>;
}

declare class AvailabilityResource extends Resource {
    /**
     * Check fleet item availability for a date range.
     * POST /availability/check
     */
    check(input: CheckAvailabilityInput): Promise<AvailabilityResult>;
}

declare class PricingResource extends Resource {
    /**
     * Calculate full pricing breakdown without creating a booking.
     * POST /pricing/calculate
     */
    calculate(input: CalculatePricingInput): Promise<PricingBreakdown>;
}

type WebhookEventType = 'booking.created' | 'booking.confirmed' | 'booking.cancelled' | 'booking.completed' | 'booking.extended' | 'payment.received' | 'deposit.held' | 'deposit.captured' | 'deposit.released' | 'customer.created' | 'customer.updated' | 'fleet.updated' | 'waiver.signed';
interface WebhookEvent {
    id: string;
    type: WebhookEventType;
    created_at: DateTime;
    data: Record<string, unknown>;
}
interface Webhook {
    id: string;
    url: string;
    events: (WebhookEventType | '*')[];
    description: string | null;
    active: boolean;
    created_at: DateTime;
    last_delivery_at: DateTime | null;
    last_delivery_status: string | null;
}
/** Returned only on creation — includes the signing secret. */
interface WebhookWithSecret extends Webhook {
    signing_secret: string;
}
interface CreateWebhookInput {
    url: string;
    events: (WebhookEventType | '*')[];
    description?: string;
}

declare class WebhooksResource extends Resource {
    /**
     * List registered webhooks.
     * GET /webhooks
     */
    list(params?: PaginationParams): PaginatedPromise<Webhook>;
    /**
     * Register a new webhook endpoint.
     * POST /webhooks
     */
    create(input: CreateWebhookInput): Promise<WebhookWithSecret>;
    /**
     * Delete a webhook endpoint.
     * DELETE /webhooks/:id
     */
    del(id: string): Promise<DeleteResult>;
}

declare class Renta {
    /** Static webhook verification utility. */
    static webhooks: {
        verify(rawBody: string | Buffer, signature: string, secret: string): Promise<WebhookEvent>;
    };
    readonly fleet: {
        readonly categories: FleetCategoriesResource;
        readonly items: FleetItemsResource;
    };
    readonly bookings: BookingsResource;
    readonly customers: CustomersResource;
    readonly addons: AddonsResource;
    readonly coupons: CouponsResource;
    readonly waivers: WaiversResource;
    readonly payments: PaymentsResource;
    readonly deposits: DepositsResource;
    readonly availability: AvailabilityResource;
    readonly pricing: PricingResource;
    readonly webhooks: WebhooksResource;
    constructor(config: RentaConfig);
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
 * Thrown on 404 (not found).
 */
declare class RentaNotFoundError extends RentaError {
    constructor(body: ApiErrorBody, requestId: string);
}
/**
 * Thrown on 400 (bad request) or 422 (unprocessable entity).
 */
declare class RentaValidationError extends RentaError {
    /** Array of field-level validation errors. */
    readonly errors: ValidationFieldError[];
    constructor(statusCode: number, body: ApiErrorBody, requestId: string);
}
/**
 * Thrown on 409 (conflict).
 */
declare class RentaConflictError extends RentaError {
    constructor(body: ApiErrorBody, requestId: string);
}
/**
 * Thrown on 429 (rate limited).
 */
declare class RentaRateLimitError extends RentaError {
    /** Seconds to wait before retrying. */
    readonly retryAfter: number;
    constructor(body: ApiErrorBody, requestId: string, retryAfter: number);
}
/**
 * Thrown on 500+ (server error).
 */
declare class RentaInternalError extends RentaError {
    constructor(statusCode: number, body: ApiErrorBody, requestId: string);
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

export { type Addon, type AddonListParams, type AddonPriceType, type ApiErrorBody, type AvailabilityItemResult, type AvailabilityResult, type Booking, type BookingAddon, type BookingAddonInput, type BookingCustomerSummary, type BookingLineItem, type BookingLineItemInput, type BookingListParams, type BookingStatus, type CalculatePricingInput, type CancelBookingInput, type CheckAvailabilityInput, type Coupon, type CouponDiscountType, type CouponListParams, type CouponValidation, type CreateAddonInput, type CreateBookingInput, type CreateCouponInput, type CreateCustomerInput, type CreateFleetCategoryInput, type CreateFleetItemInput, type CreatePaymentIntentInput, type CreateWebhookInput, type Customer, type CustomerListParams, type DateTime, type DeleteResult, type DepositCaptureInput, type DepositHold, type DepositHoldInput, type DepositHoldTiming, type DepositReleaseInput, type DepositResult, type ExtendBookingInput, type FleetCategory, type FleetCategoryListParams, type FleetItem, type FleetItemCategory, type FleetItemListParams, type FleetItemPhoto, type FleetItemStatus, Paginated, PaginatedPromise, type PaginatedResponse, type PaginationParams, type PaymentIntent, type PickupLocation, type PricingAddonLine, type PricingBreakdown, Renta, RentaAuthError, type RentaConfig, RentaConflictError, RentaError, RentaInternalError, type RentaLogger, RentaNotFoundError, RentaRateLimitError, RentaValidationError, type ShopBrandSettings, type ShopProfile, type SignWaiverInput, type SignatureType, type SkillLevel, type SortOrder, type StorefrontBookInput, type StorefrontBookingResult, type StorefrontInventoryCategory, type StorefrontInventoryItem, type StorefrontInventoryParams, type StorefrontInventoryResult, type SwapItemInput, type UUID, type UpdateAddonInput, type UpdateBookingInput, type UpdateCouponInput, type UpdateCustomerInput, type UpdateFleetCategoryInput, type UpdateFleetItemInput, type ValidateCouponInput, type ValidationFieldError, type WaiverSignResult, type WaiverSignerStatus, type WaiverStatus, type WaiverTemplate, type WaiverTemplateListParams, type WaiverType, type Webhook, type WebhookEvent, type WebhookEventType, type WebhookWithSecret };
