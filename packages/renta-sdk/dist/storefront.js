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

// src/storefront-client.ts
var RentaStorefront = class {
  transport;
  constructor(config) {
    if (!config.apiKey.startsWith("renta_pk_")) {
      throw new RentaAuthError(
        401,
        {
          error: {
            code: "invalid_key_type",
            message: "RentaStorefront requires a publishable key (renta_pk_). Secret keys (renta_sk_) must not be used in client-side code."
          }
        },
        ""
      );
    }
    this.transport = new Transport(config);
  }
  /** Get the shop profile. */
  async shop() {
    const response = await this.transport.request("GET", "/storefront/shop");
    return response.data;
  }
  /** Browse available inventory for given dates. */
  async inventory(params) {
    const response = await this.transport.request(
      "GET",
      "/storefront/inventory",
      { query: params }
    );
    return response.data;
  }
  /** Create a storefront booking (requires confirmed payment). */
  async book(input) {
    const response = await this.transport.request(
      "POST",
      "/storefront/book",
      { body: input }
    );
    return response.data;
  }
  /** Validate a coupon code. */
  async validateCoupon(input) {
    const response = await this.transport.request(
      "POST",
      "/coupons/validate",
      { body: input }
    );
    return response.data;
  }
  /** Calculate pricing for items + dates. */
  async calculatePricing(input) {
    const response = await this.transport.request(
      "POST",
      "/pricing/calculate",
      { body: input }
    );
    return response.data;
  }
  /** Check availability for items + dates. */
  async checkAvailability(input) {
    const response = await this.transport.request(
      "POST",
      "/availability/check",
      { body: input }
    );
    return response.data;
  }
  /** List waiver templates. */
  waiverTemplates(params) {
    const initialPromise = this.transport.request("GET", "/waivers/templates", {
      query: params
    }).then((r) => r.data);
    const fetchPage = (cursor) => this.transport.request("GET", "/waivers/templates", {
      query: { ...params, cursor }
    }).then((r) => r.data);
    return Paginated.from(initialPromise, fetchPage);
  }
  /** Sign a waiver. */
  async signWaiver(input) {
    const response = await this.transport.request(
      "POST",
      "/waivers/sign",
      { body: input }
    );
    return response.data;
  }
};
export {
  Paginated,
  PaginatedPromise,
  RentaAuthError,
  RentaError,
  RentaStorefront,
  RentaValidationError
};
//# sourceMappingURL=storefront.js.map