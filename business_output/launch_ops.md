# QRON Living QR Art - Launch Operations Checklist

This document outlines a concise checklist for QRON's launch week, focusing on daily tasks, key metrics to track, and an initial support workflow.

---

## 1. Daily Tasks (15 minutes each, Morning & Evening Review)

### Morning (First 15 minutes of the day)
*   **Check Core Systems Status:**
    *   Verify qron.space is live and accessible.
    *   Confirm Supabase services (Auth, Database, Edge Functions) are operational.
    *   Check Fal.ai API status (if any issues reported).
    *   Verify Stripe webhook listener is active.
*   **Review Key Metrics (Quick Glance):**
    *   New Signups (Supabase Auth).
    *   New QRON Generations (Supabase `qrons` table, dashboard).
    *   New Scan Events (Supabase `scan_events` table, dashboard).
    *   Stripe Payments (new sales, checkout conversions).
*   **Scan Social Media Mentions:** Quickly check Twitter, Reddit, Product Hunt for immediate mentions or critical feedback.
*   **Prioritize Support Tickets:** Review new support inquiries.

### Evening (Last 15 minutes of the day)
*   **Daily Metric Deep Dive:**
    *   Analyze daily trends for signups, generations, scans.
    *   Review revenue against $5K weekly goal.
    *   Identify any spikes or drops.
*   **Address High-Priority Support:** Ensure critical user issues are being handled or escalated.
*   **Plan for Tomorrow:** Briefly outline focus areas for the next day based on today's observations.
*   **Prepare Brief Internal Report:** Summarize day's performance (optional, but good for internal communication).

---

## 2. Metrics to Track (Continuous Monitoring)

**Real-time / Hourly:**
*   **Website Uptime:** Ensure qron.space is always available.
*   **API Latency/Errors:** Monitor `/api/generate`, `/api/track-scan`, `/api/checkout`, `/api/webhook`, `/api/living-art`.

**Daily / Weekly:**
*   **User Acquisition:**
    *   New Signups (Total & Source: e.g., Product Hunt, Twitter, Direct).
    *   Conversion Rate (Visitor to Signup).
*   **User Engagement:**
    *   QRONs Generated (Total, Per User).
    *   Active Users (Generating QRONs, Logging In).
    *   QRON Scan Events (Total, Unique Scanners, Per QRON).
    *   Dynamic Redirects Triggered.
    *   Living Art Schedules Active/Triggered.
*   **Monetization:**
    *   Lifetime Deal Sales (Count & Revenue).
    *   Upgrade Conversion Rate (Free to Pro).
    *   Average Revenue Per User (ARPU).
*   **Product Health:**
    *   Support Ticket Volume & Resolution Time.
    *   Bug Reports.
    *   System Performance (database queries, Fal.ai calls).

**Tools:**
*   **Supabase Dashboard:** For database monitoring, RLS, functions.
*   **Vercel Analytics:** For website traffic, API call metrics.
*   **Stripe Dashboard:** For payment processing, revenue tracking.
*   **Plausible Analytics (if integrated):** For privacy-friendly website analytics.

---

## 3. Support Workflow

**Philosophy:** Rapid, empathetic, and effective issue resolution to foster user trust and loyalty.

**Channels:**
*   **Primary:** Email (hello@qron.space or a dedicated support email).
*   **Secondary:** Twitter DMs (for quick public responses or redirection).
*   **Self-Serve:** Comprehensive documentation (`qron.space/docs`) and FAQs.

**Process:**
1.  **Receive Inquiry:** User sends email or DM.
2.  **Initial Triage (within 1-2 hours):**
    *   Categorize issue (Bug, Feature Request, How-To, Billing, etc.).
    *   Check if it's a known issue or easily solvable via docs.
    *   Prioritize (Critical, High, Medium, Low).
3.  **Acknowledge & Set Expectation:** Send an automated or quick manual reply confirming receipt and estimated response time.
4.  **Investigate & Resolve:**
    *   For bugs: Replicate, check logs (Vercel, Supabase), debug.
    *   For how-to: Provide links to docs or clear instructions.
    *   For billing: Check Stripe dashboard, Supabase profile.
5.  **Communicate Solution/Update:** Inform the user of the resolution or next steps.
6.  **Escalation:** For complex technical issues, escalate to core development.
7.  **Knowledge Base Update:** If a new common issue arises, add it to the documentation/FAQ.
