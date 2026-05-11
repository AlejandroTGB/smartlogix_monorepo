# Design System Specification: The Architectural Flow

## 1. Overview & Creative North Star
**Creative North Star: "The Precision Navigator"**

In the world of B2B logistics, "Smart Logics" represents more than just data; it represents movement, reliability, and the invisible threads of global commerce. To move beyond a generic "SaaS Dashboard" look, this design system adopts the **Precision Navigator** ethos—an editorial-inspired aesthetic that prioritizes high-contrast typography and spatial hierarchy over traditional borders and boxes.

We break the "template" look by utilizing **Intentional Asymmetry**. Instead of a rigid, centered grid, we use expansive white space and weighted left-aligned typography to guide the eye. Surfaces are treated as physical layers of "Frosted Glass" and "Vellum," creating a sense of depth that feels architectural and premium rather than flat and digital.

---

## 2. Colors & Tonal Depth
The palette is rooted in the authority of deep navy and the clarity of crisp whites, punctuated by purposeful accents.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Boundaries must be defined solely through background color shifts.
- Use `surface-container-low` (#f2f4f6) for secondary zones.
- Use `surface-container-highest` (#e0e3e5) to define high-priority interaction areas.
- Physical separation is achieved through the **`8` (1.75rem)** spacing token, not a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets.
- **Base Layer:** `surface` (#f7f9fb)
- **Primary Layout Blocks:** `surface-container-lowest` (#ffffff)
- **Nested Detail Cards:** `surface-container-low` (#f2f4f6) sitting on the white primary block.

### Glass & Gradient Soul
To add a signature "Smart Logics" polish, use **Glassmorphism** for floating elements (like hover tooltips or mobile navigation).
- **Glass Token:** `surface-container-lowest` at 80% opacity with a `backdrop-filter: blur(12px)`.
- **Signature Gradient:** For primary CTAs, use a linear gradient from `primary` (#000000) to `primary_container` (#111c2d) at a 135-degree angle. This prevents buttons from looking "flat" and adds a subtle, metallic luster.

---

## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance character with functionality.

*   **Display & Headlines (Manrope):** Chosen for its geometric, modern structure. Used for data storytelling.
    *   `display-lg`: 3.5rem. Use sparingly for hero metrics (e.g., Total Shipments).
    *   `headline-sm`: 1.5rem. Used for section headers to provide an authoritative "Editorial" feel.
*   **Body & Labels (Inter):** Chosen for maximum legibility in dense data tables.
    *   `body-md`: 0.875rem. The workhorse for all table data.
    *   `label-sm`: 0.6875rem. Always uppercase with 0.05rem letter spacing for "Status" headers.

**Typography Strategy:** Use extreme scale contrast. A `display-lg` metric next to a `label-sm` caption creates a sophisticated, high-end hierarchy that signals "Professional Logic."

---

## 4. Elevation & Depth
Depth is a functional tool, not a decoration.

*   **The Layering Principle:** Avoid shadows on standard cards. If a card is on the `surface` background, its white fill (`surface-container-lowest`) is enough to define it.
*   **Ambient Shadows:** For elevated elements like modals or dropdowns, use:
    *   `box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.06);`
    *   Note the use of `on_surface` (#191c1e) as the shadow tint rather than pure black.
*   **The Ghost Border:** If a boundary is required for accessibility (e.g., in a high-contrast mode), use `outline_variant` at 15% opacity. Never use 100% opacity lines.

---

## 5. Components
### Buttons
- **Primary:** Gradient (`primary` to `primary_container`), `xl` (0.75rem) roundedness. Label is `on_primary`.
- **Secondary:** No fill. `ghost-border` (15% `outline`). Text is `primary`.
- **Tertiary:** No fill or border. `primary` text. Use for "Cancel" or "Back" actions.

### Metric Widgets
Forbid the "Boxed" look. A metric widget consists of a `display-sm` value and a `label-md` description. The background should be a subtle `surface-container-low` with a `lg` corner radius.

### Structured Data Tables
- **Header:** `surface-container-high` background, no borders.
- **Rows:** Use a background color shift on hover (`surface-container-lowest` to `surface-container-low`).
- **Dividers:** Forbidden. Use a **`4` (0.9rem)** vertical spacing gap between logical row groups if necessary.

### Chips (Status Indicators)
- **Delivered:** `secondary_container` (#6cf8bb) background with `on_secondary_container` (#00714d) text. 
- **Pending:** `tertiary_fixed` (#ffddb8) background with `on_tertiary_container` (#b87500) text.
- **Shape:** `full` (9999px) roundedness for a friendly, modern feel.

### Input Fields
- **Default State:** `surface-container-highest` background. No border.
- **Focus State:** 2px solid `primary`. This provides a sharp, tactile response.

---

## 6. Do’s and Don’ts

### Do
- **Do** use `20` (4.5rem) or `24` (5.5rem) spacing between major dashboard sections to allow the data to "breathe."
- **Do** use `secondary` (Emerald Green) for success states to reinforce the "delivered" brand promise.
- **Do** nest a `surface-container-highest` small element inside a `surface-container-lowest` card to highlight a specific detail.

### Don't
- **Don't** use 1px dividers to separate list items. Use white space.
- **Don't** use pure black (#000000) for body text. Use `on_surface` (#191c1e) for a softer, more premium reading experience.
- **Don't** use default browser shadows. Always use the Ambient Shadow specification with the `on_surface` tint.
- **Don't** use sharp corners. Every interaction point must follow the `md` (0.375rem) or `lg` (0.5rem) roundedness scale to feel modern and approachable.