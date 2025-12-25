# QRON Living QR Art - Technical MVP Summary

This document outlines the minimum viable technical requirements for QRON, leveraging existing implementations and identifying what to prioritize for a Day 1 launch.

## 1. Supabase Tables (Implemented)

The following Supabase tables are crucial for the MVP and are currently implemented:

*   **`profiles`**: User data (tier, generation limits, referral info).
*   **`qrons`**: Stores all generated QRONs (ID, user_id, mode, target_url, image_url, prompt, style, scan_count, folder_id, current_art_schedule_id).
*   **`scan_events`**: Logs individual QR code scans (qron_id, user_agent, device_type, etc.).
*   **`redirect_rules`**: Stores rules for dynamic QRON redirection (qron_id, user_id, rule_type, configuration, priority, start_time, end_time, a_b_variant, a_b_weight).
*   **`folders`**: Organizes QRONs into user-defined folders.
*   **`tags`**: User-defined tags for QRONs.
*   **`qron_tags`**: Join table for many-to-many relationship between QRONs and Tags.
*   **`living_art_schedules`**: Defines schedules for "Living Art" QRONs (qron_id, start_time, target_image_url).

**Key Supabase Functions & Triggers:**
*   `handle_new_user()`: Creates profile on new user signup.
*   `increment_scan_count()`: Updates qrons.scan_count on new scan_event.
*   `update_updated_at()`: Auto-updates `updated_at` timestamps.
*   `check_generation_limit()`: (RPC) Checks if user has generation capacity.
*   `increment_generation_count()`: (RPC) Increments generations_used.
*   `send_conversion_email()`: (RPC) Sends conversion email to qualifying users.
*   `send_winback_email()`: (RPC) Sends win-back email to qualifying users.

## 2. API Endpoints (Implemented)

The following API endpoints are essential for Day 1 functionality and are currently implemented:

*   **`/api/generate` (POST)**: Core endpoint for generating new AI QRONs.
    *   Handles user authentication and tier-based restrictions (generation limits, mode/preset access).
    *   Calls Fal.ai for image generation.
    *   Saves QRON details to Supabase.
    *   Returns a tracking or living-art URL.
*   **`/api/presets` (GET)**: Serves a list of available style presets.
*   **`/api/track-scan/[qron_id]` (GET)**: Logs QR code scans and performs dynamic redirection based on configured rules (device, time, A/B).
*   **`/api/living-art/[qron_id]` (GET)**: Serves the current image for "Living Art" QRONs based on defined schedules.
*   **`/api/checkout` (POST)**: Initiates Stripe Checkout sessions for upgrades.
*   **`/api/webhook` (POST)**: Stripe webhook handler to process payments and update user tiers/limits in Supabase.
*   **`/api/send-email` (POST)**: Generic endpoint for sending various types of emails (welcome, conversion, win-back).

## 3. Features for Day 1 Launch

Based on the implemented work and the MVP foundation:

*   **User Authentication & Session Management:** Full signup, login, logout.
*   **QRON Generation:** Create AI-styled QRONs with various modes and presets.
*   **Tier Management:** Free/Pro/Enterprise tiers with generation limits and feature restrictions (client-side prompts, server-side enforcement).
*   **Basic QRON Dashboard:** Users can view their generated QRONs.
*   **QRON Analytics:** Basic scan tracking per QRON (total scans visible in dashboard/details).
*   **Dynamic Redirects:** Device-based, time-based, and simple A/B rules implemented in the tracking API.
*   **QRON Organization:** Folder and Tag management (CRUD UI for folders/tags, QRONs assignable to folders/tags).
*   **Living Art Controls:** Basic scheduling and image serving for "Living" mode QRONs.
*   **Email Automations:** Welcome email on signup, infrastructure for conversion and win-back emails via Supabase RPCs.
*   **Pricing Page:** Displays tiers and a $99 Lifetime Pro offer with Stripe integration.
*   **Dedicated Login/Signup Page.**

## 4. What to Skip (Post-MVP or Future Iterations)

To ensure a rapid launch and focus on core value, the following features are explicitly deferred:

*   **Advanced Dynamic Redirect Rules:** Location, language, referrer-based rules (current implementation covers device, time, A/B).
*   **Bulk Operations:** Managing multiple QRONs simultaneously (moving, tagging, deleting).
*   **Advanced Analytics UI:** Detailed graphs, conversion metrics, geographical data visualization (beyond basic counts).
*   **Full "Living Art" Evolution:** Morphing transitions, AI-driven evolution (currently only image switching based on schedule).
*   **Collaboration Features:** Sharing QRONs or folders with other users/team members.
*   **Referral System:** (Partially in DB schema, but not integrated into UI/logic).
*   **API Keys Management UI:** (DB schema exists, but no UI for users to generate/manage keys).
*   **Dedicated "Success" Page after Stripe Checkout:** Current implementation redirects to a generic `/success` page that needs content.
*   **Password Reset/Forgot Password UI:** Supabase handles it, but a custom UI might be desired.
*   **Email Notifications:** (Beyond welcome, conversion, win-back, e.g., limit warnings).
*   **Custom Domains for QRONs.**
*   **More comprehensive "Pricing" page:** Detail benefits more clearly, compare tiers.
