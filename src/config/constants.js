/**
 * @file constants.js
 * @description Application-wide named constants.
 *
 * Centralising literals here prevents subtle bugs caused by typos
 * and makes business rules easy to locate and update in one place.
 */

// ─── Cart / Pricing ──────────────────────────────────────────────────────────

/** Minimum cart subtotal (in IDR) that qualifies for a discount. */
export const CART_DISCOUNT_THRESHOLD = 400_000;

/** Flat discount applied when subtotal meets CART_DISCOUNT_THRESHOLD. */
export const CART_DISCOUNT_AMOUNT = 20_000;

/** Flat shipping fee applied whenever the cart is non-empty. */
export const CART_SHIPPING_FEE = 18_000;

// ─── Backend / Network ───────────────────────────────────────────────────────

/** Interval (ms) between automatic backend reconnect attempts. */
export const BACKEND_RETRY_INTERVAL_MS = 10_000;

/** HTTP request timeout (ms) for all API calls. */
export const API_REQUEST_TIMEOUT_MS = 8_000;

// ─── UI / Animation ──────────────────────────────────────────────────────────

/** How long a toast notification is visible before fading out (ms). */
export const TOAST_VISIBLE_DURATION_MS = 2_400;

/** Duration (ms) of the toast fade-in animation. */
export const TOAST_FADE_IN_MS = 200;

/** Duration (ms) of the toast fade-out animation. */
export const TOAST_FADE_OUT_MS = 250;

/** Delay (ms) between mounting each background tab during preloading. */
export const TAB_PRELOAD_INTERVAL_MS = 120;

// ─── AI Stylist ───────────────────────────────────────────────────────────────

/** Maximum tokens Gemini should generate for the personal insight narrative. */
export const GEMINI_MAX_OUTPUT_TOKENS = 200;

/** Temperature for Gemini generation — higher = more creative. */
export const GEMINI_TEMPERATURE = 0.8;

/** How long the AI "analyzing" screen is shown before displaying results (ms). */
export const STYLIST_ANALYSIS_DURATION_MS = 2_200;

/** Interval (ms) between loading step transitions in the analyzing screen. */
export const STYLIST_LOADING_STEP_INTERVAL_MS = 420;

// ─── Exchange / Points ───────────────────────────────────────────────────────

/** Starting CircularPoints balance for new / reset accounts. */
export const INITIAL_CIRCULAR_POINTS = 320;

// ─── Storage ─────────────────────────────────────────────────────────────────

/** AsyncStorage key for persisted application state. */
export const APP_STORAGE_KEY = '@circulai/app-state-v3';

// ─── Tailor Chat ─────────────────────────────────────────────────────────────

/** Simulated reply delay (ms) from a tailor in offline / demo mode. */
export const TAILOR_REPLY_DELAY_MS = 700;
