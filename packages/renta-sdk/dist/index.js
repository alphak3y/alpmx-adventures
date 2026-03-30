// src/errors.ts
var RentaError = class extends Error {
  /** HTTP status code from the API response. */
  statusCode;
  /** Machine-readable error code from the API. */
  code;
  /** X-Request-Id from the API response (for support). */
  requestId;
  /** Additional error details from the API response. */
  details;
  constructor(statusCode, body, requestId) {
    super(body.error.message);
    this.name = "RentaError";
    this.statusCode = statusCode;
    this.code = body.error.code;
    this.requestId = requestId;
    this.details = body.error.details;
  }
};
var RentaAuthError = class extends RentaError {
  constructor(statusCode, body, requestId) {
    super(statusCode, body, requestId);
    this.name = "RentaAuthError";
  }
};
var RentaNotFoundError = class extends RentaError {
  constructor(body, requestId) {
    super(404, body, requestId);
    this.name = "RentaNotFoundError";
  }
};
var RentaValidationError = class extends RentaError {
  /** Array of field-level validation errors. */
  errors;
  constructor(statusCode, body, requestId) {
    super(statusCode, body, requestId);
    this.name = "RentaValidationError";
    this.errors = body.error.details?.errors ?? [];
  }
};
var RentaConflictError = class extends RentaError {
  constructor(body, requestId) {
    super(409, body, requestId);
    this.name = "RentaConflictError";
  }
};
var RentaRateLimitError = class extends RentaError {
  /** Seconds to wait before retrying. */
  retryAfter;
  constructor(body, requestId, retryAfter) {
    super(429, body, requestId);
    this.name = "RentaRateLimitError";
    this.retryAfter = retryAfter;
  }
};
var RentaInternalError = class extends RentaError {
  constructor(statusCode, body, requestId) {
    super(statusCode, body, requestId);
    this.name = "RentaInternalError";
  }
};
function throwApiError(status, body, requestId, retryAfter) {
  switch (status) {
    case 401:
    case 403:
      throw new RentaAuthError(status, body, requestId);
    case 404:
      throw new RentaNotFoundError(body, requestId);
    case 400:
    case 422:
      throw new RentaValidationError(status, body, requestId);
    case 409:
      throw new RentaConflictError(body, requestId);
    case 429:
      throw new RentaRateLimitError(body, requestId, retryAfter ?? 0);
    default:
      if (status >= 500) {
        throw new RentaInternalError(status, body, requestId);
      }
      throw new RentaError(status, body, requestId);
  }
}

// src/version.ts
var VERSION = true ? "0.2.0" : "0.0.0-dev";

// src/transport.ts
function getUserAgent() {
  if (typeof process !== "undefined" && process.versions?.node) {
    return `renta-sdk-node/${VERSION} node/${process.versions.node}`;
  }
  if (typeof window !== "undefined") {
    return `renta-sdk-browser/${VERSION}`;
  }
  return `renta-sdk/${VERSION}`;
}
function buildQueryString(params) {
  const entries = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0) continue;
    if (Array.isArray(value)) {
      entries.push(
        `${encodeURIComponent(key)}=${value.map(encodeURIComponent).join(",")}`
      );
    } else {
      entries.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      );
    }
  }
  return entries.length ? `?${entries.join("&")}` : "";
}
function parseRateLimit(headers) {
  return {
    limit: parseInt(headers.get("x-ratelimit-limit") ?? "0", 10),
    remaining: parseInt(headers.get("x-ratelimit-remaining") ?? "0", 10),
    reset: parseInt(headers.get("x-ratelimit-reset") ?? "0", 10)
  };
}
function parseRetryAfter(headers) {
  const value = headers.get("retry-after");
  if (!value) return null;
  const seconds = parseInt(value, 10);
  if (!isNaN(seconds)) return seconds * 1e3;
  const date = Date.parse(value);
  if (!isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}
function jitter(maxMs) {
  return Math.random() * maxMs;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var Transport = class {
  baseUrl;
  timeout;
  maxRetries;
  retryDelay;
  apiKey;
  _fetch;
  logger;
  userAgent;
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://api.getrenta.io/v1").replace(/\/$/, "");
    this.timeout = config.timeout ?? 3e4;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 1e3;
    this._fetch = config.fetch ?? globalThis.fetch;
    this.logger = config.logger;
    this.userAgent = getUserAgent();
  }
  async request(method, path, options) {
    const url = this.baseUrl + path + (options?.query ? buildQueryString(options.query) : "");
    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "User-Agent": this.userAgent,
      "Accept": "application/json"
    };
    if (options?.body !== void 0) {
      headers["Content-Type"] = "application/json";
    }
    if (options?.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }
    const bodyStr = options?.body !== void 0 ? JSON.stringify(options.body) : void 0;
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      let response;
      try {
        response = await this._fetch(url, {
          method,
          headers,
          body: bodyStr,
          signal: AbortSignal.timeout(this.timeout)
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "TimeoutError") {
          throw new RentaError(
            0,
            { error: { code: "timeout", message: `Request timed out after ${this.timeout}ms` } },
            ""
          );
        }
        if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
          throw new RentaError(
            0,
            { error: { code: "timeout", message: `Request timed out after ${this.timeout}ms` } },
            ""
          );
        }
        throw err;
      }
      const requestId = response.headers.get("x-request-id") ?? "";
      const rateLimit = parseRateLimit(response.headers);
      if (response.ok) {
        const data = await response.json();
        return { data, status: response.status, requestId, rateLimit };
      }
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = {
          error: {
            code: "unknown",
            message: `HTTP ${response.status}: ${response.statusText}`
          }
        };
      }
      const retryAfterMs = parseRetryAfter(response.headers);
      if (response.status === 429 && attempt < this.maxRetries) {
        const delay = retryAfterMs ?? this.retryDelay * Math.pow(2, attempt);
        this.logger?.warn(
          `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`,
          { requestId, status: response.status }
        );
        await sleep(delay + jitter(this.retryDelay * 0.25));
        lastError = { status: response.status, body: errorBody, requestId, retryAfterMs };
        continue;
      }
      if (response.status >= 500 && attempt < this.maxRetries) {
        const delay = Math.min(
          this.retryDelay * Math.pow(2, attempt) + jitter(this.retryDelay * 0.25),
          3e4
        );
        this.logger?.warn(
          `Server error ${response.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${this.maxRetries})`,
          { requestId, status: response.status }
        );
        await sleep(delay);
        lastError = { status: response.status, body: errorBody, requestId };
        continue;
      }
      throwApiError(
        response.status,
        errorBody,
        requestId,
        retryAfterMs ? Math.ceil(retryAfterMs / 1e3) : void 0
      );
    }
    if (lastError && typeof lastError === "object" && "status" in lastError) {
      const err = lastError;
      throwApiError(
        err.status,
        err.body,
        err.requestId,
        err.retryAfterMs ? Math.ceil(err.retryAfterMs / 1e3) : void 0
      );
    }
    throw new RentaError(
      0,
      { error: { code: "unknown", message: "Request failed after retries" } },
      ""
    );
  }
};

// src/resources/base.ts
var Resource = class {
  constructor(transport) {
    this.transport = transport;
  }
};

// src/pagination.ts
var Paginated = class _Paginated {
  /** Items in the current page. */
  data;
  /** Whether more pages exist. */
  hasMore;
  /** Cursor to fetch the next page (null if no more pages). */
  nextCursor;
  fetchPage;
  constructor(response, fetchPage) {
    this.data = response.data;
    this.hasMore = response.has_more;
    this.nextCursor = response.next_cursor;
    this.fetchPage = fetchPage;
  }
  /**
   * Async iterator that automatically fetches subsequent pages.
   * Yields individual items, not pages.
   */
  async *[Symbol.asyncIterator]() {
    let page = {
      data: this.data,
      has_more: this.hasMore,
      next_cursor: this.nextCursor
    };
    while (true) {
      for (const item of page.data) {
        yield item;
      }
      if (!page.has_more || !page.next_cursor) break;
      page = await this.fetchPage(page.next_cursor);
    }
  }
  /**
   * Collect ALL items across all pages into a single array.
   * ⚠️ Use with caution on large datasets.
   */
  async toArray() {
    const items = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
  /**
   * Fetch the next page. Returns null if no more pages.
   */
  async nextPage() {
    if (!this.hasMore || !this.nextCursor) return null;
    const response = await this.fetchPage(this.nextCursor);
    return new _Paginated(response, this.fetchPage);
  }
  /**
   * Create a Paginated<T> from a promise that resolves to the first page.
   * Returns a PaginatedPromise that is both PromiseLike<Paginated<T>> and AsyncIterable<T>.
   */
  static from(initialPromise, fetchPage) {
    return new PaginatedPromise(initialPromise, fetchPage);
  }
};
var PaginatedPromise = class {
  _initialPromise;
  _fetchPage;
  _resolved = null;
  constructor(initialPromise, fetchPage) {
    this._initialPromise = initialPromise;
    this._fetchPage = fetchPage;
  }
  async _resolve() {
    if (!this._resolved) {
      const response = await this._initialPromise;
      this._resolved = new Paginated(response, this._fetchPage);
    }
    return this._resolved;
  }
  then(onfulfilled, onrejected) {
    return this._resolve().then(onfulfilled, onrejected);
  }
  async *[Symbol.asyncIterator]() {
    const paginated = await this._resolve();
    yield* paginated;
  }
  /**
   * Collect ALL items across all pages into a single array.
   */
  async toArray() {
    const paginated = await this._resolve();
    return paginated.toArray();
  }
};

// src/resources/fleet.ts
var FleetCategoriesResource = class extends Resource {
  /**
   * List fleet categories.
   * GET /fleet/categories
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/fleet/categories", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/fleet/categories", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Get a single fleet category by ID.
   * GET /fleet/categories/:id
   */
  async get(id) {
    const response = await this.transport.request(
      "GET",
      `/fleet/categories/${id}`
    );
    return response.data;
  }
  /**
   * Create a new fleet category.
   * POST /fleet/categories
   */
  async create(input) {
    const response = await this.transport.request(
      "POST",
      "/fleet/categories",
      { body: input }
    );
    return response.data;
  }
  /**
   * Update a fleet category.
   * PATCH /fleet/categories/:id
   */
  async update(id, input) {
    const response = await this.transport.request(
      "PATCH",
      `/fleet/categories/${id}`,
      { body: input }
    );
    return response.data;
  }
  /**
   * Delete a fleet category.
   * DELETE /fleet/categories/:id
   */
  async del(id) {
    const response = await this.transport.request(
      "DELETE",
      `/fleet/categories/${id}`
    );
    return response.data;
  }
};
var FleetItemsResource = class extends Resource {
  /**
   * List fleet items with optional filters.
   * GET /fleet/items
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/fleet/items", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/fleet/items", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Get a single fleet item by ID.
   * GET /fleet/items/:id
   */
  async get(id) {
    const response = await this.transport.request(
      "GET",
      `/fleet/items/${id}`
    );
    return response.data;
  }
  /**
   * Create a new fleet item.
   * POST /fleet/items
   */
  async create(input) {
    const response = await this.transport.request(
      "POST",
      "/fleet/items",
      { body: input }
    );
    return response.data;
  }
  /**
   * Update a fleet item (partial update).
   * PATCH /fleet/items/:id
   */
  async update(id, input) {
    const response = await this.transport.request(
      "PATCH",
      `/fleet/items/${id}`,
      { body: input }
    );
    return response.data;
  }
  /**
   * Delete (soft-delete) a fleet item.
   * DELETE /fleet/items/:id
   */
  async del(id) {
    const response = await this.transport.request(
      "DELETE",
      `/fleet/items/${id}`
    );
    return response.data;
  }
};

// src/resources/bookings.ts
var BookingsResource = class extends Resource {
  /**
   * List bookings with optional filters.
   * GET /bookings
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/bookings", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/bookings", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Get a single booking by ID.
   * GET /bookings/:id
   */
  async get(id) {
    const response = await this.transport.request(
      "GET",
      `/bookings/${id}`
    );
    return response.data;
  }
  /**
   * Create a new booking.
   * POST /bookings
   */
  async create(input) {
    const response = await this.transport.request(
      "POST",
      "/bookings",
      { body: input }
    );
    return response.data;
  }
  /**
   * Update booking metadata.
   * PATCH /bookings/:id
   */
  async update(id, input) {
    const response = await this.transport.request(
      "PATCH",
      `/bookings/${id}`,
      { body: input }
    );
    return response.data;
  }
  /**
   * Cancel a booking.
   * POST /bookings/:id/cancel
   */
  async cancel(id, input) {
    const response = await this.transport.request(
      "POST",
      `/bookings/${id}/cancel`,
      { body: input }
    );
    return response.data;
  }
  /**
   * Extend a booking's return date.
   * POST /bookings/:id/extend
   */
  async extend(id, input) {
    const response = await this.transport.request(
      "POST",
      `/bookings/${id}/extend`,
      { body: input }
    );
    return response.data;
  }
  /**
   * Swap a line item for a different fleet item.
   * POST /bookings/:id/swap-item
   */
  async swapItem(id, input) {
    const response = await this.transport.request(
      "POST",
      `/bookings/${id}/swap-item`,
      { body: input }
    );
    return response.data;
  }
};

// src/resources/customers.ts
var CustomersResource = class extends Resource {
  /**
   * List customers with optional search and tag filters.
   * GET /customers
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/customers", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/customers", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Get a single customer by ID.
   * GET /customers/:id
   */
  async get(id) {
    const response = await this.transport.request("GET", `/customers/${id}`);
    return response.data;
  }
  /**
   * Create a new customer.
   * POST /customers
   */
  async create(input) {
    const response = await this.transport.request("POST", "/customers", {
      body: input
    });
    return response.data;
  }
  /**
   * Update a customer (partial update).
   * PATCH /customers/:id
   */
  async update(id, input) {
    const response = await this.transport.request("PATCH", `/customers/${id}`, {
      body: input
    });
    return response.data;
  }
};

// src/resources/addons.ts
var AddonsResource = class extends Resource {
  /**
   * List add-ons.
   * GET /addons
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/addons", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/addons", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Get a single add-on by ID.
   * GET /addons/:id
   */
  async get(id) {
    const response = await this.transport.request("GET", `/addons/${id}`);
    return response.data;
  }
  /**
   * Create a new add-on.
   * POST /addons
   */
  async create(input) {
    const response = await this.transport.request("POST", "/addons", {
      body: input
    });
    return response.data;
  }
  /**
   * Update an add-on (partial update).
   * PATCH /addons/:id
   */
  async update(id, input) {
    const response = await this.transport.request("PATCH", `/addons/${id}`, {
      body: input
    });
    return response.data;
  }
  /**
   * Delete an add-on.
   * DELETE /addons/:id
   */
  async del(id) {
    const response = await this.transport.request("DELETE", `/addons/${id}`);
    return response.data;
  }
};

// src/resources/coupons.ts
var CouponsResource = class extends Resource {
  /**
   * List coupons with optional active filter.
   * GET /coupons
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/coupons", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/coupons", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Get a single coupon by ID.
   * GET /coupons/:id
   */
  async get(id) {
    const response = await this.transport.request("GET", `/coupons/${id}`);
    return response.data;
  }
  /**
   * Create a new coupon.
   * POST /coupons
   */
  async create(input) {
    const response = await this.transport.request("POST", "/coupons", {
      body: input
    });
    return response.data;
  }
  /**
   * Update a coupon (partial update).
   * PATCH /coupons/:id
   */
  async update(id, input) {
    const response = await this.transport.request("PATCH", `/coupons/${id}`, {
      body: input
    });
    return response.data;
  }
  /**
   * Delete a coupon.
   * DELETE /coupons/:id
   */
  async del(id) {
    const response = await this.transport.request("DELETE", `/coupons/${id}`);
    return response.data;
  }
  /**
   * Validate a coupon code without applying it.
   * POST /coupons/validate
   */
  async validate(input) {
    const response = await this.transport.request(
      "POST",
      "/coupons/validate",
      { body: input }
    );
    return response.data;
  }
};

// src/resources/waivers.ts
var WaiversResource = class extends Resource {
  /**
   * List active waiver templates.
   * GET /waivers/templates
   */
  templates(params) {
    const initialPromise = this.transport.request("GET", "/waivers/templates", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/waivers/templates", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Sign a waiver for a booking.
   * POST /waivers/sign
   */
  async sign(input) {
    const response = await this.transport.request(
      "POST",
      "/waivers/sign",
      { body: input }
    );
    return response.data;
  }
  /**
   * Get waiver signing status for a booking.
   * GET /waivers/status/:bookingId
   */
  async status(bookingId) {
    const response = await this.transport.request(
      "GET",
      `/waivers/status/${bookingId}`
    );
    return response.data;
  }
};

// src/resources/payments.ts
var PaymentsResource = class extends Resource {
  /**
   * Create a Stripe PaymentIntent for a booking.
   * POST /payments/create-intent
   */
  async createIntent(input) {
    const response = await this.transport.request(
      "POST",
      "/payments/create-intent",
      { body: input }
    );
    return response.data;
  }
};

// src/resources/deposits.ts
var DepositsResource = class extends Resource {
  /**
   * Place an authorization hold on a customer's card.
   * POST /deposits/hold
   */
  async hold(input) {
    const response = await this.transport.request(
      "POST",
      "/deposits/hold",
      { body: input }
    );
    return response.data;
  }
  /**
   * Capture all or part of a held deposit.
   * POST /deposits/capture
   */
  async capture(input) {
    const response = await this.transport.request(
      "POST",
      "/deposits/capture",
      { body: input }
    );
    return response.data;
  }
  /**
   * Release a held deposit back to the customer.
   * POST /deposits/release
   */
  async release(input) {
    const response = await this.transport.request(
      "POST",
      "/deposits/release",
      { body: input }
    );
    return response.data;
  }
};

// src/resources/availability.ts
var AvailabilityResource = class extends Resource {
  /**
   * Check fleet item availability for a date range.
   * POST /availability/check
   */
  async check(input) {
    const response = await this.transport.request(
      "POST",
      "/availability/check",
      { body: input }
    );
    return response.data;
  }
};

// src/resources/pricing.ts
var PricingResource = class extends Resource {
  /**
   * Calculate full pricing breakdown without creating a booking.
   * POST /pricing/calculate
   */
  async calculate(input) {
    const response = await this.transport.request(
      "POST",
      "/pricing/calculate",
      { body: input }
    );
    return response.data;
  }
};

// src/resources/webhooks-resource.ts
var WebhooksResource = class extends Resource {
  /**
   * List registered webhooks.
   * GET /webhooks
   */
  list(params) {
    const initialPromise = this.transport.request("GET", "/webhooks", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/webhooks", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /**
   * Register a new webhook endpoint.
   * POST /webhooks
   */
  async create(input) {
    const response = await this.transport.request(
      "POST",
      "/webhooks",
      { body: input }
    );
    return response.data;
  }
  /**
   * Delete a webhook endpoint.
   * DELETE /webhooks/:id
   */
  async del(id) {
    const response = await this.transport.request("DELETE", `/webhooks/${id}`);
    return response.data;
  }
};

// src/webhooks.ts
function parseSignature(signature) {
  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key, rest.join("=")];
    })
  );
  const timestamp = parts["t"];
  const hmac = parts["v1"];
  if (!timestamp || !hmac) {
    throw new RentaError(
      400,
      {
        error: {
          code: "webhook_signature_invalid",
          message: "Invalid signature format"
        }
      },
      ""
    );
  }
  return { timestamp, hmac };
}
async function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  try {
    const crypto = await import("crypto");
    if (crypto.timingSafeEqual) {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }
  } catch {
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
async function hmacSha256Hex(secret, payload) {
  try {
    const crypto = await import("crypto");
    if (crypto.createHmac) {
      return crypto.createHmac("sha256", secret).update(payload).digest("hex");
    }
  } catch {
  }
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(payload);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = new Uint8Array(signature);
  return Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var webhookVerifier = {
  /**
   * Verify a webhook signature and return the parsed event.
   *
   * @param rawBody - The raw request body as a string or Buffer
   * @param signature - The Renta-Signature header value
   * @param secret - The webhook signing secret
   * @returns The parsed WebhookEvent
   * @throws RentaError if verification fails
   */
  async verify(rawBody, signature, secret) {
    const { timestamp, hmac: expectedSig } = parseSignature(signature);
    const timestampAge = Math.floor(Date.now() / 1e3) - parseInt(timestamp, 10);
    if (timestampAge > 300) {
      throw new RentaError(
        400,
        {
          error: {
            code: "webhook_timestamp_expired",
            message: "Webhook timestamp too old (>5 minutes)"
          }
        },
        ""
      );
    }
    const bodyStr = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    const signedPayload = `${timestamp}.${bodyStr}`;
    const computedSig = await hmacSha256Hex(secret, signedPayload);
    const isValid = await timingSafeEqual(computedSig, expectedSig);
    if (!isValid) {
      throw new RentaError(
        400,
        {
          error: {
            code: "webhook_signature_invalid",
            message: "Signature verification failed"
          }
        },
        ""
      );
    }
    const event = JSON.parse(bodyStr);
    return event;
  }
};

// src/client.ts
var Renta = class {
  /** Static webhook verification utility. */
  static webhooks = webhookVerifier;
  fleet;
  bookings;
  customers;
  addons;
  coupons;
  waivers;
  payments;
  deposits;
  availability;
  pricing;
  webhooks;
  constructor(config) {
    const transport = new Transport(config);
    this.fleet = {
      categories: new FleetCategoriesResource(transport),
      items: new FleetItemsResource(transport)
    };
    this.bookings = new BookingsResource(transport);
    this.customers = new CustomersResource(transport);
    this.addons = new AddonsResource(transport);
    this.coupons = new CouponsResource(transport);
    this.waivers = new WaiversResource(transport);
    this.payments = new PaymentsResource(transport);
    this.deposits = new DepositsResource(transport);
    this.availability = new AvailabilityResource(transport);
    this.pricing = new PricingResource(transport);
    this.webhooks = new WebhooksResource(transport);
  }
};
export {
  Paginated,
  PaginatedPromise,
  Renta,
  RentaAuthError,
  RentaConflictError,
  RentaError,
  RentaInternalError,
  RentaNotFoundError,
  RentaRateLimitError,
  RentaValidationError
};
//# sourceMappingURL=index.js.map