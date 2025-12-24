# QRON Living QR Art - System Architecture Diagrams (Textual Representation)

This document outlines the high-level system architecture for QRON, describing the key components and their interactions.

---

## 1. High-Level Stack Overview

QRON's architecture is designed for scalability, performance, and flexibility, leveraging a modern serverless-first approach where applicable, built on Next.js and Supabase.

```
+------------------+     +------------------+     +------------------+
|    Frontend      |     |     Backend      |     |      AI Layer    |
| (Next.js SPA)    |     | (Next.js API Routes)|<--->| (Fal.ai / Models)|
+------------------+     +------------------+     +------------------+
        ^                       ^      ^                   |
        |                       |      |                   |
        |                       |      |                   |
        |                       v      v                   v
+------------------+     +----------------------------------------+
| QR & Redirect    |     |               Data Layer               |
| Service (Edge)   |<--->| (Supabase: PostgreSQL, Object Storage) |
+------------------+     +----------------------------------------+
```

### Component Breakdown:

*   **Frontend (Next.js SPA Dashboard):**
    *   **Purpose:** User interface for QR generation, prompt input, asset management, campaign organization, and analytics visualization.
    *   **Technologies:** React (within Next.js), Tailwind CSS, Supabase Client SDK, Sonner for toasts, Lucide-React for icons.
    *   **Interactions:** Communicates with the Backend API (Next.js API Routes) for data operations and AI generation, and directly with Supabase for some client-side operations (e.g., user session management).

*   **Backend (Next.js API Routes):**
    *   **Purpose:** Handles user authentication, plan limits, QRON creation logic, managing redirect rules, managing living art schedules, and event tracking before persisting to the database.
    *   **Technologies:** Next.js API Routes (Edge Runtime where suitable), Supabase Admin SDK, Fal.ai Client SDK, Stripe API.
    *   **Key Endpoints:**
        *   `/api/generate`: Creates QRONs, integrates with AI Layer.
        *   `/api/checkout`: Manages Stripe Checkout sessions.
        *   `/api/webhook`: Processes Stripe webhook events.
        *   `/api/presets`: Serves AI style presets.

*   **QR & Redirect Service (Edge Runtime):**
    *   **Purpose:** Highly optimized and cached endpoints responsible for resolving QRON scans to their final destination URLs or serving the correct image for Living Art QRONs. Critically logs all scan events.
    *   **Technologies:** Next.js Edge Functions.
    *   **Key Endpoints:**
        *   `/api/track-scan/[qron_id]`: Logs scans, evaluates dynamic redirect rules, then redirects.
        *   `/api/living-art/[qron_id]`: Serves scheduled evolving images.
    *   **Interactions:** Reads redirect rules and QRON data from the Data Layer, logs scan events to the Data Layer.

*   **AI Layer (Fal.ai / Diffusion Models):**
    *   **Purpose:** External service for generating AI-powered QR artworks. Tuned for QR compositions to ensure scannability.
    *   **Technologies:** Fal.ai platform, specific diffusion-based image models (e.g., `illusion-diffusion`).
    *   **Interactions:** Called by the Backend (`/api/generate`) to transform a basic QR code image and a text prompt into an artistic QRON image.

*   **Data Layer (Supabase: PostgreSQL & Object Storage):**
    *   **Purpose:** Persistent storage for all application data, including user profiles, QRONs, scan events, redirect rules, folders, tags, and living art schedules. Also handles asset storage.
    *   **Technologies:** Supabase (PostgreSQL for relational data, Supabase Storage for object storage).
    *   **Key Tables:**
        *   `profiles`: User metadata.
        *   `qrons`: Core QRON data, linking to users, folders, schedules.
        *   `scan_events`: Detailed scan analytics.
        *   `redirect_rules`: Dynamic redirect conditions.
        *   `folders`, `tags`, `qron_tags`: Campaign organization.
        *   `living_art_schedules`: Living art evolution definitions.
    *   **Features:** Leverages Supabase's built-in Authentication, Row Level Security (RLS) for data access control, and Postgres functions/triggers for business logic (e.g., incrementing scan counts).

---

## 2. Key Components & Data Flow

### A. QRON Generation Flow
1.  **Frontend:** User inputs `targetUrl`, `prompt`, selects `mode` and `presetId`.
2.  **Frontend:** Passes data to `Backend: /api/generate`.
3.  **Backend (`/api/generate`):**
    *   Authenticates user, checks tier and generation limits.
    *   Fetches profile data, presets, and mode config.
    *   Generates a basic scannable QR code image URL (e.g., via `api.qrserver.com`).
    *   Sends prompt and basic QR image URL to **AI Layer (Fal.ai)**.
    *   Receives AI-generated image URL from Fal.ai.
    *   Determines `encodedQrUrl` (either `/api/track-scan/[qron_id]` or `/api/living-art/[qron_id]`).
    *   Inserts new QRON record into **Data Layer (`qrons` table)**, storing the Fal.ai `image_url` and `encodedQrUrl` as the tracking URL.
    *   Increments `generations_used` in user's profile.
    *   Returns final `qron` object (with `encodedQrUrl`) to Frontend.
4.  **Frontend:** Displays the generated QRON using the `encodedQrUrl`.

### B. QRON Scan & Redirect Flow
1.  **User Scans QRON:** QR code encodes `https://qron.space/api/track-scan/[qron_id]` (or `/api/living-art/[qron_id]`).
2.  **Browser Requests:** `QR & Redirect Service: /api/track-scan/[qron_id]` (or `/api/living-art/[qron_id]`).
3.  **QR & Redirect Service:**
    *   Logs scan event to **Data Layer (`scan_events` table)** (trigger increments `qrons.scan_count`).
    *   **If `/api/track-scan`:**
        *   Fetches QRON details (e.g., `target_url`, `has_dynamic_redirect`) from **Data Layer (`qrons` table)**.
        *   If `has_dynamic_redirect` is true: Fetches `redirect_rules` from **Data Layer (`redirect_rules` table)**.
        *   Evaluates rules based on request context (device type from `User-Agent`, time, A/B).
        *   Determines final `destinationUrl`.
    *   **If `/api/living-art`:**
        *   Fetches QRON details (e.g., `current_art_schedule_id`) from **Data Layer (`qrons` table)**.
        *   Fetches `living_art_schedules` from **Data Layer (`living_art_schedules` table)**.
        *   Determines the `target_image_url` based on current time and schedules.
        *   Sets `destinationUrl` to the `target_image_url`.
    *   Redirects client to `destinationUrl`.

### C. Tier Management & Billing Flow
1.  **Frontend (Pricing Page):** User clicks "Buy Lifetime for $99".
2.  **Frontend:** Calls `Backend: /api/checkout` with `priceId`.
3.  **Backend (`/api/checkout`):**
    *   Creates a Stripe Checkout Session.
    *   Includes `userId` and `priceId` in session metadata.
    *   Returns `checkoutUrl` to Frontend.
4.  **Frontend:** Redirects user to Stripe Checkout.
5.  **User Completes Payment:** Stripe processes payment.
6.  **Stripe Webhook:** Calls `Backend: /api/webhook` with `checkout.session.completed` event.
7.  **Backend (`/api/webhook`):**
    *   Verifies webhook signature.
    *   Extracts `userId`, `priceId` from session metadata.
    *   Determines `newTier` and `newGenerationsLimit` based on `priceId`.
    *   Updates user's `profiles` table in **Data Layer**.
    *   Acknowledges webhook.
