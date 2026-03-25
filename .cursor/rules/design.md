---
globs:
alwaysApply: true
---

# Design System Document: Architectural Precision

## 1. Overview & Creative North Star
**Creative North Star: "The Blueprinted Horizon"**

This design system rejects the cluttered, "dashboard-heavy" aesthetic typical of legacy real estate software. Instead, it adopts the mindset of an architectural firm: precise, authoritative, and breathable. We move beyond "standard corporate" by utilizing **Architectural Asymmetry**—where large areas of whitespace are balanced against high-density data modules.

The goal is to create a "Digital Curator" experience. Information isn't just displayed; it is presented with editorial intent. By layering surfaces rather than boxing them in, we evoke a sense of structural depth and transparency, mirroring the trust and efficiency required in high-stakes project management.

---

## 2. Colors: Tonal Authority
Our palette is rooted in the depth of `primary` (#00030a) and the clinical precision of `on_tertiary_container` (#119589).

### The "No-Line" Rule
**Borders are forbidden for structural sectioning.** To separate a sidebar from a main content area, or a header from a body, use a background shift from `surface` (#f6fafe) to `surface_container_low` (#f0f4f8). This creates a seamless, high-end feel that communicates "systemic order" rather than "grid-based constraint."

### Surface Hierarchy & Nesting
Treat the UI as a physical model.
- **Base Layer:** `surface` (#f6fafe) for the overall application background.
- **Sectional Layer:** `surface_container` (#eaeef2) for large, grouped content areas.
- **Actionable Layer:** `surface_container_lowest` (#ffffff) for cards or data modules that require the user's immediate focus. This "pops" against the darker surface containers without needing a shadow.

### The "Glass & Gradient" Rule
For high-level project overviews or "Hero" stats, utilize **Glassmorphism**. Apply a backdrop-blur (12px–20px) to a container using `surface_variant` at 60% opacity. For primary CTAs, use a subtle linear gradient transitioning from `primary` (#00030a) to `primary_container` (#0a1d37) at a 135-degree angle to provide a "metallic" sheen that feels premium and solid.

---

## 3. Typography: The Editorial Edge
We use a dual-font strategy to balance corporate strength with technical readability.

* **Display & Headlines (Manrope):** The geometric nature of Manrope provides a modern, "drafted" look. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) with tighter letter-spacing (-0.02em) to command authority in project titles.
* **Body & Labels (Inter):** Inter is our workhorse for data. Use `body-md` (0.875rem) for all table content to ensure maximum information density without sacrificing legibility.
* **The Hierarchy of Trust:** Use `on_surface_variant` (#44474d) for secondary labels and `primary` (#00030a) for core data points. This high-contrast ratio ensures that critical project milestones are the first thing a user sees.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web-standard" for this system. We define depth through light and tone.

* **The Layering Principle:** To lift a property card, place a `surface_container_lowest` (#ffffff) card on top of a `surface_container_low` (#f0f4f8) background. The 4% difference in luminance is enough to signify elevation to the human eye.
* **Ambient Shadows:** If a floating element (like a Modal) is required, use an "Ambient Diffusion" shadow: `box-shadow: 0 20px 40px rgba(23, 28, 31, 0.06);`. Note the use of `on_surface` (#171c1f) for the shadow tint—never use pure black.
* **The "Ghost Border" Fallback:** In high-density data tables where rows must be distinct, use a "Ghost Border": `outline_variant` (#c5c6ce) at 15% opacity. It should be felt, not seen.

---

## 5. Components: The Precision Kit

### Buttons
* **Primary:** A gradient-filled container (`primary` to `primary_container`) with `on_primary` text. Use `rounded-md` (0.375rem).
* **Secondary:** An "Inverted Ghost" style. No background, but a 1px ghost border (15% opacity `outline_variant`).
* **Tertiary:** Bold `on_tertiary_container` (#119589) text with no container, used for "cancel" or "back" actions.

### Data Visualization & Tables
* **Forbid Divider Lines:** Separate table rows using a `2.5` (0.5rem) vertical spacing scale and a subtle hover state shift to `surface_container_high` (#e4e9ed).
* **The Teal Accent:** Use `tertiary_fixed` (#89f5e7) for progress bars and "On Track" status indicators. It provides a high-contrast "pop" against the navy and slate palette.

### Input Fields
* **Style:** Minimalist. No bottom border or full box. Use a `surface_container_highest` (#dfe3e7) background with `rounded-sm` (0.125rem).
* **Focus State:** A 2px solid `on_tertiary_container` (#119589) left-edge accent to indicate the active field, rather than a full outline.

### Status Chips
* **Active/Open:** `tertiary_container` background with `on_tertiary_fixed_variant` text.
* **Delayed:** `error_container` background with `on_error_container` text.
* **Planned:** `primary_fixed` background with `on_primary_fixed_variant` text.

---

## 6. Do’s and Don’ts

### Do:
* **Do** use asymmetrical spacing. A wider left margin (e.g., `16` / 3.5rem) vs a tighter right margin creates an editorial "magazine" feel.
* **Do** stack `surface_container` tiers to create hierarchy.
* **Do** use `letter-spacing: 0.05em` on `label-sm` to give small metadata an expensive, technical feel.

### Don’t:
* **Don’t** use 1px solid black or grey lines to separate content. It breaks the "Architectural" flow.
* **Don’t** use generic blue for links. Use the Teal `on_tertiary_container` (#119589) to maintain the signature real estate palette.
* **Don’t** use "Drop Shadows" on cards. Rely on color shifts between `surface_container_low` and `surface_container_lowest`.