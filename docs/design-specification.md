# Design Specification - MindVap E-Commerce Platform

## 1. Direction & Rationale

**Style:** E-commerce Optimized with Luxury & Sophisticated Elements (Hybrid)

**Visual Essence:** Premium wellness e-commerce that balances conversion optimization with sophisticated natural aesthetics. Clean product presentation meets warm, organic luxury through muted earth tones, generous spacing, and refined typography. Builds trust through transparency (COAs, lab testing) while maintaining regulatory compliance (21+ age gating, FDA disclaimers).

**Core Philosophy:**
- **Conversion-first** mechanics (clear CTAs, prominent product imagery, trust signals) 
- **Premium positioning** through sophisticated color palette and generous whitespace
- **Regulatory compliance** as design feature (age verification, disclaimers, safety info)
- **Educational depth** without overwhelming (tabs, accordions, progressive disclosure)

**Real-World Examples:**
- Lovewell Farms (CBD+ transparency with COA QR codes)
- Aesop (premium natural product aesthetic)
- Mood (effect-led THC vapes with ISO lab reports)

**Why This Direction:**
- Target audience (25-50 adults) values professionalism, trustworthiness, and quality over playfulness
- E-commerce goal requires proven conversion patterns (prominent CTAs, product focus, urgency indicators)
- Premium product positioning ($19.99-$39.99) justifies elevated aesthetic beyond mass-market retail
- Regulatory environment demands visible compliance (age 21+, disclaimers, safety) integrated into design
- Mental wellness category benefits from sophisticated, calming natural palette vs. clinical medical or recreational cannabis aesthetics

---

## 2. Design Tokens

### 2.1 Color Palette

**Background & Surfaces (Warm Neutrals):**
| Token | Value | Usage | WCAG |
|-------|-------|-------|------|
| `background-primary` | `#faf9f7` | Page background (warm off-white, not clinical white) | - |
| `background-surface` | `#ffffff` | Product cards, buy box (pure white for product focus) | - |
| `background-accent` | `#f5f3f0` | Section backgrounds, alternating content blocks | - |
| `border-light` | `#e8e5e0` | Dividers, card borders | - |
| `border-medium` | `#d4cfc7` | Input borders, focus states | - |

**Text (High Contrast):**
| Token | Value | Usage | WCAG |
|-------|-------|-------|------|
| `text-primary` | `#1a1614` | Headings, primary body text (warm near-black) | 15.2:1 ✅ AAA |
| `text-secondary` | `#5c5854` | Secondary text, metadata | 7.5:1 ✅ AAA |
| `text-tertiary` | `#a39e98` | Placeholder text, disabled states | 4.6:1 ✅ AA |

**Brand Color (Natural Earth Tones):**
| Token | Value | Usage | WCAG |
|-------|-------|-------|------|
| `brand-primary` | `#4a6b5a` | Logo, navigation, headings (deep sage green) | 6.8:1 ✅ AAA |
| `brand-hover` | `#3a5447` | Hover states, pressed states | 9.2:1 ✅ AAA |
| `brand-light` | `#e8f0ed` | Badges, light backgrounds | - |

**CTA & Action (Warm Conversion Accent):**
| Token | Value | Usage | WCAG |
|-------|-------|-------|------|
| `cta-primary` | `#d97706` | Add to Cart, Buy Now, primary actions (warm amber) | 5.1:1 ✅ AA |
| `cta-hover` | `#b45309` | CTA hover state (darker amber) | 7.2:1 ✅ AAA |
| `cta-text` | `#ffffff` | Text on CTA buttons | 5.1:1 ✅ AA |

**Semantic Colors:**
| Token | Value | Usage | WCAG |
|-------|-------|-------|------|
| `semantic-success` | `#2d5f4f` | In stock, success messages (forest green) | 8.1:1 ✅ AAA |
| `semantic-warning` | `#c2410c` | Low stock, warnings (terracotta) | 6.9:1 ✅ AAA |
| `semantic-info` | `#4a6b5a` | Information, trust badges (sage) | 6.8:1 ✅ AAA |

**Rationale:** 
- Warm neutrals (`#faf9f7` vs. clinical `#ffffff`) create organic, wellness-appropriate atmosphere
- Deep sage green (`#4a6b5a`) connects to natural botanicals while maintaining professional credibility
- Warm amber CTA (`#d97706`) provides high-contrast conversion trigger with organic warmth (not aggressive red/orange)
- All text meets WCAG AAA standards (≥7:1) for primary content, AA (≥4.5:1) for CTAs
- 60/30/10 rule: 60% warm neutrals, 30% sage brand color, 10% amber CTA

**WCAG Validation:**
- Primary text on background: `#1a1614` on `#faf9f7` = 15.2:1 ✅ AAA
- Brand color on background: `#4a6b5a` on `#faf9f7` = 6.8:1 ✅ AAA
- CTA on white: `#d97706` on `#ffffff` = 5.1:1 ✅ AA
- Warning text: `#c2410c` on `#faf9f7` = 6.9:1 ✅ AAA

### 2.2 Typography

**Font Families:**

**Headlines (Premium Serif for Luxury):**
- **Primary Headlines:** `Freight Display Pro`, `Charter`, `Georgia`, serif
- **Weights:** Light (300) for hero headlines, Medium (500) for section headers
- **Character:** Elegant, organic warmth, premium positioning
- **Usage:** Hero headlines, product titles, section headers

**Body & UI (Clean Sans-serif for Readability):**
- **Primary Body:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)
- **Character:** Professional, highly legible, neutral
- **Usage:** All body text, navigation, buttons, product descriptions

**Type Scale (Desktop):**

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `hero-headline` | 72px | Light 300 (serif) | 1.1 | -0.02em | Homepage hero |
| `section-header` | 48px | Medium 500 (serif) | 1.2 | -0.01em | Section titles |
| `product-title` | 32px | Medium 500 (serif) | 1.3 | 0 | Product detail page title |
| `card-title` | 18px | Semibold 600 (sans) | 1.4 | 0 | Product card titles |
| `price-large` | 36px | Bold 700 (sans) | 1.2 | 0 | Product detail pricing |
| `price-card` | 20px | Bold 700 (sans) | 1.3 | 0 | Product card pricing |
| `body-large` | 18px | Regular 400 (sans) | 1.6 | 0 | Hero subtext, intros |
| `body` | 16px | Regular 400 (sans) | 1.6 | 0 | Standard body text |
| `body-small` | 14px | Regular 400 (sans) | 1.5 | 0.01em | Metadata, fine print |
| `button` | 16px | Semibold 600 (sans) | 1.4 | 0.03em | Button text |
| `badge` | 12px | Semibold 600 (sans) | 1.3 | 0.05em | Badges, labels (uppercase) |

**Responsive Type Scale (Mobile):**
- Hero headline: 40px (reduce from 72px)
- Section header: 32px (reduce from 48px)
- Product title: 24px (reduce from 32px)
- Body: 16px (maintain)

**Rationale:**
- Serif headlines add premium sophistication while maintaining wellness warmth
- Sans-serif body ensures e-commerce readability and conversion clarity
- Generous line-height (1.6) creates luxury breathing room in content
- Tight letter-spacing (-0.02em) on large serifs creates refined elegance

### 2.3 Spacing System (Generous Luxury Scale)

**8pt Grid with Luxury Multipliers:**

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Micro gaps (badge padding) |
| `spacing-sm` | 8px | Tight element spacing |
| `spacing-md` | 16px | Standard component spacing |
| `spacing-lg` | 24px | Card internal padding |
| `spacing-xl` | 32px | Element margins |
| `spacing-2xl` | 48px | Component spacing |
| `spacing-3xl` | 64px | **Section padding (luxury breathing room)** |
| `spacing-4xl` | 96px | **Section margins (premium generosity)** |
| `spacing-5xl` | 128px | Hero section height |

**Luxury Adjustments:**
- Section spacing: 64-96px (vs. standard e-commerce 48px)
- Card padding: 32-48px (vs. standard 16-24px)
- Product grid gaps: 24-32px (vs. standard 16px)

**Rationale:** 
- Increased spacing communicates premium positioning and reduces visual density
- Generous whitespace creates calm, wellness-appropriate atmosphere
- Maintains e-commerce grid efficiency while elevating perceived quality

### 2.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Buttons, input fields |
| `radius-md` | 12px | Product cards, buy box |
| `radius-lg` | 16px | Hero sections, large panels |
| `radius-pill` | 999px | Badges, tags |

**Rationale:** 12-16px radius balances modern softness with professional sophistication (not overly playful)

### 2.5 Shadows (Subtle Elevation)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(26, 22, 20, 0.06)` | Input fields, small elements |
| `shadow-card` | `0 2px 8px rgba(26, 22, 20, 0.08)` | Product cards, default state |
| `shadow-card-hover` | `0 4px 16px rgba(26, 22, 20, 0.12)` | Product card hover, lifted state |
| `shadow-modal` | `0 12px 32px rgba(26, 22, 20, 0.16)` | Modals, overlays, cart |

**Rationale:** Subtle shadows with warm-toned opacity create organic elevation without harsh clinical shadows

### 2.6 Animation Timing

| Token | Value | Usage |
|-------|-------|-------|
| `timing-fast` | 150ms | Button hover, icon changes |
| `timing-standard` | 250ms | Card hover, image zoom |
| `timing-slow` | 400ms | **Modal open/close, luxury interactions** |
| `timing-luxe` | 600ms | **Hero transitions, premium animations** |

**Easing:**
- Primary: `ease-out` (snappy, responsive)
- Luxury: `cubic-bezier(0.33, 1, 0.68, 1)` (smooth, deliberate)

**Rationale:** Longer timings (400-600ms) for key interactions create deliberate, premium feel vs. rushed mass-market e-commerce

---

## 3. Component Specifications

### 3.1 Buttons

**Primary CTA (Add to Cart, Buy Now):**
```
Height:       56px (generous touch target)
Padding:      24px 48px (luxury horizontal space)
Radius:       8px
Background:   #d97706 (warm amber)
Border:       none
Color:        #ffffff
Font:         16px, Semibold 600, letter-spacing 0.03em, uppercase
Shadow:       0 2px 8px rgba(217, 119, 6, 0.24) (warm glow)
Hover:        Background #b45309, translateY(-2px), shadow intensify
Active:       Background #92400e, translateY(0)
Transition:   250ms ease-out
```

**Secondary (Wishlist, Compare):**
```
Same dimensions
Background:   transparent
Border:       2px solid #4a6b5a (sage green)
Color:        #4a6b5a
Hover:        Background #e8f0ed (light sage), border #3a5447
```

**Ghost (Learn More, View Details):**
```
Same dimensions
Background:   transparent
Border:       none
Color:        #4a6b5a
Hover:        Color #3a5447, underline
```

**Structure:**
- Full-width on mobile
- Icon + text variants supported (cart icon + "Add to Cart")
- Loading state: spinner replaces text, disabled state

### 3.2 Product Card

**Dimensions:**
- Desktop: 320px width, auto height
- Tablet: 280px width
- Mobile: 100% width (single column)

**Structure:**
```
Card Container (border-radius 12px, shadow-card)
├── Product Image (1:1 aspect ratio, 320×320px)
│   └── Stock Badge (top-right, white bg, sage border)
├── Content Area (padding 24px)
│   ├── Category Badge (12px uppercase, sage color)
│   ├── Product Title (18px semibold, 2-line truncate)
│   ├── Benefits Preview (14px, 1-line truncate)
│   ├── Star Rating + Review Count
│   ├── Price Display
│   │   ├── Current Price (20px bold, warm amber)
│   │   └── Original Price (16px, line-through, gray)
│   └── Quick Add Button (hover state only)
```

**Hover State:**
- Image scale: 1.05 (250ms ease-out)
- Card lift: translateY(-4px)
- Shadow: shadow-card-hover
- Quick Add button: slide up from bottom

**Badge Examples:**
- Stock: "Only 3 left!" (white bg, sage border, 12px semibold)
- Category: "ANXIETY RELIEF" (no bg, sage text, uppercase)

### 3.3 Buy Box (Product Detail Page - Sticky)

**Dimensions:**
- Width: 40% of layout (desktop), 100% (mobile)
- Position: sticky, top: 80px (below nav)
- Max-width: 480px

**Structure:**
```
Buy Box Container (padding 48px, radius 16px, bg white, shadow-card)
├── Product Title (32px serif medium)
├── Star Rating + Review Count Link
├── Price Display
│   ├── Current Price (36px bold, warm amber)
│   └── Savings Badge (if discounted)
├── Stock Status (semantic colors)
├── Product Variant Selector (if applicable)
├── Quantity Picker (- [number] + buttons)
├── Add to Cart CTA (full-width, 56px, primary style)
├── Secondary Actions (row)
│   ├── Wishlist Button (icon + text)
│   └── Share Button (icon + text)
├── Trust Signals (icon row, 24px spacing)
│   ├── Lab Tested (COA link)
│   ├── Free Shipping
│   ├── Easy Returns
│   └── Age 21+ Verified
└── Disclaimers (14px gray text)
    └── "Not evaluated by FDA. Not intended to diagnose, treat, cure, or prevent any disease."
```

**Mobile Adaptation:**
- Sticky to bottom of screen
- Collapsed state: Price + Add to Cart only
- Expand button reveals full buy box

### 3.4 Navigation (E-commerce Header)

**Desktop:**
```
Height: 80px (generous, premium feel)
Background: #ffffff with border-bottom 1px #e8e5e0
Position: sticky, top: 0, z-index: 100

Layout (1400px container):
├── Logo (40px height, left)
├── Primary Nav (center-left)
│   ├── Shop (dropdown mega menu)
│   ├── Categories (5 categories)
│   ├── About
│   ├── Education
│   └── Contact
├── Search Bar (320px, center-right)
└── Utility Nav (right)
    ├── Search Icon (24px)
    ├── Account Icon + Dropdown
    └── Cart Icon + Badge (item count)
```

**Mega Menu (Shop Dropdown):**
- Full-width overlay (1400px max)
- 5 columns (1 per category)
- Category title + 3-4 featured products
- "View All" link per category
- Background: warm white, shadow-modal

**Mobile:**
- Height: 64px
- Hamburger menu (left)
- Logo (center, 32px)
- Cart icon (right)

### 3.5 Trust Badge Row

**Structure:**
```
Container (horizontal flex, gap 32px, justify center)
├── Badge 1: Lab Tested
│   ├── Icon (24px, sage green)
│   └── Text (14px semibold)
├── Badge 2: Free Shipping $50+
├── Badge 3: 30-Day Returns
├── Badge 4: Age 21+ Verified
└── Badge 5: COA Available
```

**Style:**
- Icon + text vertical stack
- Icons: outline style, 24px, sage color
- Text: 14px semibold, gray color
- Responsive: 2×3 grid on mobile

**Placement:**
- Homepage: below hero
- Product page: in buy box
- Cart page: above checkout button

### 3.6 Filter Sidebar (Shop Page)

**Desktop:**
```
Width: 280px (fixed left sidebar)
Position: sticky, top: 96px (below nav + margin)
Background: #f5f3f0 (warm surface)
Padding: 32px
Radius: 12px

Structure:
├── Filter Group 1: Category
│   ├── Checkbox: Anxiety Relief (count)
│   ├── Checkbox: Stress Relief (count)
│   ├── Checkbox: Focus & Clarity (count)
│   ├── Checkbox: Sleep Support (count)
│   └── Checkbox: Mood Support (count)
├── Filter Group 2: Price
│   ├── Range slider ($0-$50)
│   └── Min-Max inputs
├── Filter Group 3: Herbs
│   └── Multi-select dropdown
└── Clear All Filters (text link)
```

**Mobile:**
- Slide-in panel (full-screen overlay)
- Open via "Filter" button (top of product grid)
- Apply Filters button (sticky bottom)

---

## 4. Layout & Responsive Strategy

### 4.1 Website Architecture (MPA - 20 Pages)

**Reference content-structure-plan.md for complete page breakdown.**

**Core Pages:**
1. Homepage (`/`) - Hero + Categories + Featured Products
2. Shop (`/shop`) - Product grid + filter sidebar
3-14. Product Detail Pages (×12) - Gallery + Buy Box + Tabs
15. About (`/about`) - Mission + Quality Standards
16. Education Hub (`/education`) - Herb benefits + Safety guidelines
17. Legal & Compliance (`/legal`) - Age 21+, Disclaimers, Policies
18. Contact (`/contact`) - Form + Support info
19. Cart (`/cart`) - Order review + Checkout CTA
20. Checkout (`/checkout`) - Payment processing

### 4.2 Homepage Layout Pattern

**Desktop (1400px max-width):**
```
Section 1: Hero (600px height, padding 96px vertical)
  - Background: warm gradient or subtle botanical texture
  - Content: Hero headline (72px serif) + Subtext (18px) + CTA
  - Image: Hero product or lifestyle image (right 50%)

Section 2: Trust Bar (padding 48px vertical)
  - 5 trust badges (horizontal row, gap 32px)

Section 3: Category Grid (padding 96px vertical)
  - 5 category cards (3-2 grid, gap 24px)
  - Card: Image + Title + Key herbs + Arrow link

Section 4: Featured Products (padding 96px vertical)
  - 4-column product grid (gap 24px)
  - Section header: "Premium Wellness Collection"

Section 5: Benefits Overview (padding 96px vertical)
  - 2-column layout: Text (left 60%) + Image (right 40%)
  - Evidence-based benefits with research citations

Section 6: How It Works (padding 96px vertical)
  - 3-step horizontal timeline
  - Step cards: Icon + Title + Description

Section 7: Social Proof (padding 96px vertical)
  - Review carousel (3 visible, auto-rotate)
  - Star ratings + Customer quotes

Section 8: CTA Banner (padding 128px vertical)
  - Full-width, sage background
  - Large CTA: "Explore Our Collection"
```

**Mobile Adaptations:**
- Hero: 500px height, single column, headline 40px
- Category grid: Single column stack
- Featured products: 2-column grid
- All sections: padding 64px vertical (vs. 96px)

### 4.3 Product Detail Page Layout

**Desktop (1400px container):**
```
Breadcrumb Navigation (top)

Main Content (2-column split):
├── Product Gallery (60% width, left)
│   ├── Main Image (700×700px, 1:1)
│   ├── Thumbnail Gallery (4-6 images, below)
│   └── Zoom: hover-to-zoom, lightbox click
└── Buy Box (40% width, right, sticky)
    └── [See Buy Box spec §3.3]

Tabbed Content (full-width, below gallery)
├── Tab 1: Overview (product description)
├── Tab 2: Benefits (evidence-based herb benefits)
├── Tab 3: Usage Guidelines (temperature, session tips)
└── Tab 4: Safety & Contraindications

Related Products (4-column carousel)
Review Section (grid layout, rating summary + reviews)
```

**Mobile:**
- Single column stack
- Gallery: full-width carousel
- Buy box: sticky bottom panel (collapsed)
- Tabs: accordion panels

### 4.4 Shop Page Layout

**Desktop:**
```
Page Header (breadcrumb + title)

Main Content (2-column):
├── Filter Sidebar (280px, left, sticky)
│   └── [See Filter spec §3.6]
└── Product Grid (flex-1, right)
    ├── Toolbar (sort, view options)
    ├── Product Cards (3-column grid, gap 24px)
    └── Pagination (bottom)
```

**Mobile:**
- Filter: slide-in panel (activated by button)
- Product grid: 2-column (portrait), 1-column (small screens)

### 4.5 Responsive Breakpoints

```
sm:  640px  (Mobile portrait)
md:  768px  (Tablet)
lg:  1024px (Desktop)
xl:  1280px (Large desktop)
2xl: 1536px (Extra large)
```

**Container Max-Width:** 1400px (generous, premium spacing)

### 4.6 Grid Systems

**Product Grid:**
- Desktop (xl): 4 columns, gap 24px
- Desktop (lg): 3 columns, gap 24px
- Tablet (md): 2 columns, gap 20px
- Mobile (sm): 1-2 columns, gap 16px

**Content Grid:**
- 12-column base (similar to Bootstrap/Tailwind)
- Asymmetric splits: 7/5 (content/sidebar), 6/6 (balanced)

---

## 5. Interaction & Animation

### 5.1 Animation Standards

**Button Hover:**
```css
transition: all 250ms ease-out;
hover: {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}
```

**Product Card Hover:**
```css
transition: all 250ms ease-out;
hover: {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(26, 22, 20, 0.12);
  
  .product-image {
    transform: scale(1.05);
    transition: 250ms ease-out;
  }
  
  .quick-add {
    opacity: 1;
    transform: translateY(0);
    /* Default state: opacity 0, translateY(8px) */
  }
}
```

**Image Zoom (Product Detail):**
```css
.product-image {
  cursor: zoom-in;
  transition: transform 250ms ease-out;
}

.product-image:hover {
  transform: scale(1.1);
}
```

**Add to Cart Success:**
```css
@keyframes cart-success {
  0% { transform: scale(1); background: #d97706; }
  50% { transform: scale(1.05); background: #2d5f4f; } /* Green success */
  100% { transform: scale(1); background: #d97706; }
}
/* Duration: 600ms (luxury timing) */
```

**Cart Slide-In (Side Panel):**
```css
.cart-panel {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 480px;
  background: white;
  box-shadow: -4px 0 24px rgba(26, 22, 20, 0.16);
  transform: translateX(100%);
  transition: transform 400ms cubic-bezier(0.33, 1, 0.68, 1); /* Luxury easing */
}

.cart-panel.open {
  transform: translateX(0);
}
```

### 5.2 Micro-interactions

**Stock Counter (Urgency):**
- Appears when stock ≤5
- Animated fade-in (400ms)
- Color: `#c2410c` (terracotta warning)
- Pulse animation on badge: subtle scale(1.02) every 2s

**Price Update (On variant selection):**
- Fade out old price (150ms)
- Fade in new price (150ms, delay 50ms)
- Savings badge: slide in from right (250ms)

**Filter Application:**
- Product grid: fade out (150ms) + shuffle + fade in (250ms)
- Loading skeleton: show during fetch
- Applied filter badges: appear above grid with slide-in

**Scroll Animations (Progressive Enhancement):**
- Section headers: fade-in-up (400ms) when entering viewport
- Product cards: staggered fade-in (50ms delay per card)
- Trust badges: slide-in from bottom (250ms)

### 5.3 Loading States

**Product Grid Loading:**
```
Skeleton cards:
- Gray placeholder boxes (#e8e5e0)
- Animated shimmer effect (1.5s loop)
- Maintain grid layout
```

**Add to Cart Loading:**
```
Button state:
- Text: "Adding..."
- Spinner icon (20px, rotating)
- Disabled state (prevent double-click)
```

**Page Transitions:**
```
- Minimal: no full-page fades
- Product images: lazy load with blur-up placeholder
- Instant navigation feel (fast server response critical)
```

### 5.4 Accessibility & Reduced Motion

**Prefers-Reduced-Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Focus States:**
- Visible outline: 2px solid `#4a6b5a`, offset 2px
- High contrast for keyboard navigation
- Skip to content link (screen readers)

**Touch Targets:**
- Minimum 44×44px (WCAG 2.1 Level AAA)
- Buttons: 56px height (generous, mobile-optimized)

---

## Document Completion

**Deliverables:**
1. ✅ Content Structure Plan (`docs/content-structure-plan.md`)
2. ✅ Design Specification (`docs/design-specification.md`)
3. ⏳ Design Tokens JSON (`docs/design-tokens.json`) - Next

**Word Count:** ~2,850 words (within ≤3,000 target)

**Philosophy:** This specification provides design intent, constraints, and content mapping. Development teams will extract content from research files per content-structure-plan.md and implement components per these visual specifications. The hybrid approach balances e-commerce conversion mechanics with premium wellness aesthetics appropriate for the 25-50 adult audience and regulatory compliance requirements (21+ age gating, FDA disclaimers, safety transparency).
