# Content Structure Plan - MindVap E-Commerce Platform

## 1. Material Inventory

**Content Files:**
- `docs/herbs_benefits_research.md` (8,800 words, sections: Executive Summary, Herb-by-Herb Evidence, Safety Profiles, Usage Recommendations)
- `docs/safety_usage_guidelines.md` (7,000 words, sections: Regulatory Landscape, Device Safety, Herb-Specific Safety, Contraindications)
- `docs/product_catalog_strategy.md` (8,500 words, sections: 12 SKU details, Pricing tiers, Category mapping, Target audiences)
- `docs/legal_compliance_requirements.md` (compliance sections: Age gating 21+, Labeling, Disclaimers, Shipping restrictions)
- `docs/competitive_analysis.md` (5,000 words, sections: Market landscape, Competitor benchmarks, UX patterns, Customer feedback)

**Visual Assets:**
- `imgs/product_breathe_easy.png`
- `imgs/product_cbd_tranquil_relax.png`
- `imgs/product_dream_weaver.png`
- `imgs/product_emotion_balance.png`
- `imgs/product_focus_flow.png`
- `imgs/product_herbal_harmony.png`
- `imgs/product_luna_mist.png`
- `imgs/product_mental_clarity.png`
- `imgs/product_midnight_calm.png`
- `imgs/product_soothing_essence.png`
- `imgs/product_sunrise_energy.png`
- `imgs/product_zen_garden.png`

**Data Files:**
- None (product data embedded in product_catalog_strategy.md)

## 2. Website Structure

**Type:** Multi-Page Application (MPA)

**Reasoning:** 
- Product diversity: 12 distinct products across 5 categories requiring detailed individual pages
- Content volume: >20,000 words total across research, safety, legal, and product content
- Multiple personas: Different user needs (anxiety relief seekers vs. sleep support vs. focus enhancement)
- E-commerce complexity: Product catalog, filtering, cart, checkout, account management
- SEO requirements: Individual product pages for search optimization
- Educational depth: Extensive safety guidelines, herb benefits research, usage tips requiring dedicated pages

## 3. Page/Section Breakdown

### Page 1: Homepage (`/`)
**Purpose:** Convert visitors, establish trust, guide to product discovery

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Hero | E-commerce Hero with CTA | `docs/product_catalog_strategy.md` L1-50 | Brand positioning: "Premium vaping herbs focused on mental health benefits" | - |
| Trust Bar | Trust Badges Row | `docs/legal_compliance_requirements.md` | 21+ Age Verified, Lab Tested, COA Available, Free Shipping $50+ | - |
| Category Grid | 5-Category Navigation Cards | `docs/product_catalog_strategy.md` L113-121 | 5 categories with key herbs and temperature ranges | - |
| Featured Products | 4-Product Grid | `docs/product_catalog_strategy.md` L125-141 | Top 4 products (CBD+ Tranquil Relax, Herbal Harmony, Focus Flow, Dream Weaver) | Product images |
| Benefits Overview | 2-Column Feature Grid | `docs/herbs_benefits_research.md` L7-17 | Evidence-based benefits: Ashwagandha for stress, Chamomile for anxiety, etc. | - |
| How It Works | 3-Step Process | `docs/safety_usage_guidelines.md` L179-199 | Temperature zones, session practices, device recommendations | - |
| Social Proof | Review Carousel | `docs/competitive_analysis.md` L183-195 | Customer feedback patterns (fast heat-up, smooth vapor, easy maintenance) | - |
| CTA Section | Full-width CTA | - | "Explore Our Collection" button → Shop page | - |

**CRITICAL COMPLIANCE ELEMENTS:**
- Age gate (21+) - Modal on first visit, DOB verification
- Disclaimer footer: "Not evaluated by FDA. Not intended to diagnose, treat, cure, or prevent any disease."
- "Not for use by minors. Avoid during pregnancy or nursing."

---

### Page 2: Shop/Catalog (`/shop`)
**Purpose:** Product discovery, filtering by category/benefit, conversion to product pages

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Page Header | Breadcrumb + Title | - | "Shop All Products" | - |
| Filter Sidebar | Category Filter + Price Sorting | `docs/product_catalog_strategy.md` L113-141 | 5 categories, price tiers ($19.99-$39.99) | - |
| Product Grid | 3-4 Column Product Cards | `docs/product_catalog_strategy.md` L125-141 | All 12 products with names, prices, categories | Product images (all 12) |
| Trust Banner | Sticky Bottom Banner | `docs/legal_compliance_requirements.md` | "Free Shipping on Orders $50+" | - |

**Product Grid Cards (12 Products):**
1. CBD+ Tranquil Relax ($39.99, Anxiety Relief)
2. Herbal Harmony ($34.99, Mood Support)
3. Focus Flow ($34.99, Focus & Clarity)
4. Midnight Calm ($29.99, Sleep Support)
5. Zen Garden ($24.99, Anxiety Relief)
6. Luna Mist ($29.99, Sleep Support)
7. Mental Clarity ($29.99, Focus & Clarity)
8. Sunrise Energy ($34.99, Stress Relief)
9. Breathe Easy ($19.99, Stress Relief)
10. Dream Weaver ($39.99, Sleep Support)
11. Soothing Essence ($29.99, Anxiety Relief)
12. Emotion Balance ($34.99, Mood Support)

---

### Page 3-14: Individual Product Pages (`/product/[product-name]`)
**Purpose:** Detailed product information, benefits, safety, conversion (Add to Cart)

**Universal Product Page Structure:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Product Gallery | 60% Image Gallery (4-6 images) | - | Product image + detail shots + lifestyle | Product image (specific) |
| Buy Box (Sticky) | 40% Buy Box | `docs/product_catalog_strategy.md` | Product name, price, stock status, Add to Cart CTA | - |
| Product Description | Tabs: Overview / Benefits / Usage / Safety | Multiple sources below | See detailed mapping per tab | - |
| Related Products | 4-Product Carousel | `docs/product_catalog_strategy.md` | Same category products | Product images |
| Reviews Section | Review Grid + Rating Summary | `docs/competitive_analysis.md` L183-195 | Customer feedback patterns | - |

**Tab 1: Overview**
- Extract from: `docs/product_catalog_strategy.md` L167-203
- Content: Product description, key herbs, intended use
- Example: "Tranquil Chamomile Cloud: A soothing blend of chamomile and lavender balanced with a mullein base for gentle vapor and a honeyed floral aroma."

**Tab 2: Benefits**
- Extract from: `docs/herbs_benefits_research.md` (herb-specific sections)
- Content: Evidence-based benefits for herbs in product
- Example for CBD+ Tranquil Relax: Ashwagandha reduces stress (SMD -1.75), Chamomile for anxiety, Lavender for relaxation
- Map products to research sections:
  - Anxiety Relief products → `herbs_benefits_research.md` L122-165 (Chamomile, Lavender, Lemon Balm)
  - Stress Relief → L98-121 (Ashwagandha, Tulsi)
  - Sleep Support → L289-358 (Valerian, Passionflower, Chamomile)
  - Focus & Clarity → L167-273 (Peppermint, Rosemary, Ginger)
  - Mood Support → L232-253 (Curcumin)

**Tab 3: Usage Guidelines**
- Extract from: `docs/safety_usage_guidelines.md` L176-218
- Content: Temperature ranges, session practices, device recommendations
- Example: "Start at 160-177°C for flavor, step up to 177-204°C for balanced extraction. Avoid >221°C."

**Tab 4: Safety & Contraindications**
- Extract from: `docs/safety_usage_guidelines.md` L72-175
- Content: Herb-specific safety profiles, contraindications, drug interactions
- Example: "Chamomile: Generally safe. Caution with allergies to Asteraceae family. May interact with sedatives."

**Product-Specific Mapping (All 12):**

1. **CBD+ Tranquil Relax** - Herbs: Ashwagandha, Chamomile, Lavender
   - Benefits: `herbs_benefits_research.md` L98-165
   - Safety: `safety_usage_guidelines.md` L98-165
   - Image: `imgs/product_cbd_tranquil_relax.png`

2. **Herbal Harmony** - Herbs: Multiple mood-supporting blend
   - Benefits: `herbs_benefits_research.md` L232-253
   - Safety: `safety_usage_guidelines.md` L280-290
   - Image: `imgs/product_herbal_harmony.png`

3. **Focus Flow** - Herbs: Rosemary, Peppermint, Ginger
   - Benefits: `herbs_benefits_research.md` L167-230
   - Safety: `safety_usage_guidelines.md` L147-155
   - Image: `imgs/product_focus_flow.png`

4. **Midnight Calm** - Herbs: Chamomile, Lavender, Mullein
   - Benefits: `herbs_benefits_research.md` L122-165
   - Safety: `safety_usage_guidelines.md` L108-136
   - Image: `imgs/product_midnight_calm.png`

5. **Zen Garden** - Herbs: Lemon Balm, Chamomile
   - Benefits: `herbs_benefits_research.md` L296-314
   - Safety: `safety_usage_guidelines.md` L147-155
   - Image: `imgs/product_zen_garden.png`

6. **Luna Mist** - Herbs: Passionflower, Hops, Chamomile
   - Benefits: `herbs_benefits_research.md` L274-295
   - Safety: `safety_usage_guidelines.md` L115-129
   - Image: `imgs/product_luna_mist.png`

7. **Mental Clarity** - Herbs: Peppermint, Rosemary
   - Benefits: `herbs_benefits_research.md` L167-230
   - Safety: `safety_usage_guidelines.md` L147-155
   - Image: `imgs/product_mental_clarity.png`

8. **Sunrise Energy** - Herbs: Ginger, Peppermint
   - Benefits: `herbs_benefits_research.md` L210-230
   - Safety: `safety_usage_guidelines.md` L147-155
   - Image: `imgs/product_sunrise_energy.png`

9. **Breathe Easy** - Herbs: Peppermint, Mullein
   - Benefits: `herbs_benefits_research.md` L167-186
   - Safety: `safety_usage_guidelines.md` L147-155
   - Image: `imgs/product_breathe_easy.png`

10. **Dream Weaver** - Herbs: Valerian, Lavender, Hops
    - Benefits: `herbs_benefits_research.md` L315-358
    - Safety: `safety_usage_guidelines.md` L123-139
    - Image: `imgs/product_dream_weaver.png`

11. **Soothing Essence** - Herbs: Chamomile, Lavender, Lemon Balm
    - Benefits: `herbs_benefits_research.md` L122-165, L296-314
    - Safety: `safety_usage_guidelines.md` L108-155
    - Image: `imgs/product_soothing_essence.png`

12. **Emotion Balance** - Herbs: Damiana, Rose, Chamomile
    - Benefits: `herbs_benefits_research.md` L232-253
    - Safety: `safety_usage_guidelines.md` L280-290
    - Image: `imgs/product_emotion_balance.png`

---

### Page 15: About Us (`/about`)
**Purpose:** Build brand trust, explain mission, showcase quality standards

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Mission Statement | Hero Text Block | `docs/product_catalog_strategy.md` L1-31 | Brand vision: premium herbs for mental wellness | - |
| Quality Standards | 3-Column Feature Grid | `docs/product_catalog_strategy.md` L106-110, `docs/legal_compliance_requirements.md` | Additive-free, third-party lab verified, COA transparency | - |
| Our Approach | 2-Column Layout | `docs/herbs_benefits_research.md` L32-56 | Evidence-based formulation, clinical research backing | - |
| Compliance Commitment | Text Block | `docs/legal_compliance_requirements.md` L62-100 | Age verification 21+, FDA-style disclaimers, state compliance | - |

---

### Page 16: Education Hub (`/education`)
**Purpose:** Educate users on benefits, safety, proper usage

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Herb Benefits Guide | Accordion / Tab Interface | `docs/herbs_benefits_research.md` L94-471 | 12 herb profiles with RCT evidence, mechanisms, dosing | - |
| Safety Guidelines | Warning Cards | `docs/safety_usage_guidelines.md` L1-355 | Device safety, herb contraindications, populations to avoid | - |
| Usage Tips | Step-by-Step Guide | `docs/safety_usage_guidelines.md` L176-218 | Temperature zones, session practices, device maintenance | - |
| Temperature Guide | Interactive Table | `docs/safety_usage_guidelines.md` L353-363 | Temperature ranges by herb (°F and °C) | - |

---

### Page 17: Legal & Compliance (`/legal`)
**Purpose:** Transparent compliance information, disclaimers, policies

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Age Restriction | Warning Banner | `docs/legal_compliance_requirements.md` L76-80 | Federal age 21+ requirement, ID verification protocols | - |
| Disclaimers | Legal Text Block | `docs/legal_compliance_requirements.md` L98-100 | FDA disclaimer: "Not evaluated by FDA. Not intended to diagnose, treat, cure, or prevent disease." | - |
| Labeling Standards | Text + Example Image | `docs/legal_compliance_requirements.md` L98-100 | Ingredient lists, batch codes, COA QR links, contact info | - |
| Shipping Restrictions | State-by-State Table | `docs/legal_compliance_requirements.md` L68-72 | USPS restrictions, carrier policies, state-specific rules | - |
| Return Policy | Text Block | `docs/product_catalog_strategy.md` (implied best practices) | 30-day satisfaction guarantee, unopened products | - |

---

### Page 18: Contact (`/contact`)
**Purpose:** Customer support, inquiries, trust-building

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Contact Form | 2-Column Layout (Form + Info) | - | Name, Email, Subject, Message fields | - |
| Support Info | Info Cards | - | Email: support@mindvap.com, Hours: M-F 9am-6pm EST | - |
| FAQ Accordion | Expandable FAQ | `docs/competitive_analysis.md` L183-195 | Common questions (shipping, returns, product selection) | - |

---

### Page 19: Cart (`/cart`)
**Purpose:** Review order, apply promo codes, proceed to checkout

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Cart Items | Product List | - | Dynamic cart contents (image, title, price, quantity) | Product images |
| Order Summary | Sticky Summary Box | `docs/product_catalog_strategy.md` L226-231 | Subtotal, shipping (free $50+), tax, total | - |
| Promo Code Input | Input Field | `docs/product_catalog_strategy.md` L226-231 | Discount code entry, apply button | - |
| Trust Signals | Icon Row | `docs/legal_compliance_requirements.md` | Secure checkout, easy returns, discrete shipping | - |
| Checkout CTA | Large Button | - | "Proceed to Secure Checkout" → Checkout page | - |

---

### Page 20: Checkout (`/checkout`)
**Purpose:** Secure payment processing, order completion

**Content Mapping:**

| Section | Component Pattern | Data File Path | Content to Extract | Visual Asset |
|---------|------------------|----------------|--------------------|--------------------|
| Checkout Form | Single-Column Form | - | Shipping address, billing info, payment method | - |
| Order Review | Sidebar Summary | - | Cart items, totals, shipping method | Product images |
| Age Verification | Checkbox Required | `docs/legal_compliance_requirements.md` L76-80 | "I certify I am 21 years of age or older" | - |
| Payment Options | Icon Grid | `docs/competitive_analysis.md` L166-180 | Credit cards, PayPal, Apple Pay, Google Pay | - |
| Security Badges | Trust Icon Row | - | SSL secure, encrypted payment, privacy protected | - |

---

## 4. Content Analysis

**Information Density:** High

- **Reasoning:** 
  - Total content volume: >20,000 words across research, safety, legal, and product documentation
  - 12 distinct products requiring individual pages with detailed benefits, usage, and safety information
  - Extensive educational content (herb profiles, RCT evidence, safety contraindications)
  - Regulatory compliance content (age gating, disclaimers, labeling requirements)
  - E-commerce functionality (product filtering, cart, checkout)

**Content Balance:**
- Images: 12 product photos (8% of total content)
- Data/Charts: Minimal embedded (research references, temperature tables) (5%)
- Text: 20,000+ words across all pages (87%)
- **Content Type:** Mixed - Product-focused e-commerce with extensive educational and legal support

**Key Characteristics:**
- **Product-Centric:** 12 SKUs drive site structure (shop page + 12 product detail pages)
- **Educational Depth:** Evidence-based herb benefits (RCTs, meta-analyses), safety profiles, usage guidelines
- **Compliance-Heavy:** Age gating 21+, FDA disclaimers, labeling standards, shipping restrictions
- **Trust-Building:** Lab testing COAs, third-party verification, transparent ingredient lists
- **Conversion-Focused:** E-commerce patterns (filtering, cart, secure checkout, trust badges)

**Design Implications:**
- Need robust product detail page template (gallery + buy box + tabs for benefits/usage/safety)
- Educational content requires clean, readable layouts (accordions, tabs, tables)
- Legal/compliance content needs prominent placement (footer, dedicated legal page, product disclaimers)
- Trust elements must be visible throughout (COA links, age verification, security badges)
- Mobile optimization critical for e-commerce (70% of traffic per competitive analysis)
