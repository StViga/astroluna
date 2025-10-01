# AstroLuna - Visual Assets Specification

## 🎨 Style Anchor (Core Visual Language)

**Якорь стиля (встроен во все промпты):**
космическая акварель (nebula watercolor), тонкий объёмный дым (volumetric fog), микро-звёздная пыль (micro star dust), мягкие градиенты, лунное свечение, HDR, cinema lighting, без людей и текста, без логотипов, мягкая виньетка, много свободного пространства справа под заголовки, ultra-clean UX background

## ⚙️ Generation Parameters

### Midjourney v6 Defaults:
```
--ar 16:9 --stylize 150 --quality 1 --seed <из списка>
```

### SDXL Parameters:
```
CFG: 6.5
Steps: 30
Sampler: DPM++ 2M Karras
Hires: 1.3x (Latent)
Denoise: 0.35
Seed: <из списка>
```

### Negative Prompt (SDXL):
```
text, letters, logo, watermark, faces, people, animals, clutter, harsh contrast, posterization
```

## 🌙 Light/Dark Variants

**Dark Version:**
midnight blue base, silver highlights, stronger vignette, center luminance trimmed

**Light Version:**
polar dawn palette (pale blue/pearl), reduce vignette, +15% background luminance

## 📁 Asset Structure

```
AstroLuna/
  hero/
  sections/
    weekly/
    tarot/
    directory/
    auth/
    pricing/
    blog/
    empty/
    loop/
  signs/
    01_aries/ ... 12_pisces/
  icons/
```

## 🏠 Hero Section

**File:** `AstroLuna/hero/hero_bg_2560x1440_dark.png`
**Seed:** 12345 (Dark), 12346 (Light)

**Prompt:**
Moonlit astral vista over a calm cosmic sea, giant crescent moon on the left third, a faint glass-engraved zodiac wheel halo behind it, shimmering teal particles drifting, parallax-friendly layered depth, right side intentionally clean for headline — [ЯКОРЬ СТИЛЯ].

## 📑 Section Backgrounds

### Weekly Horoscope
**File:** `AstroLuna/sections/weekly/weekly_bg_1920x1080_dark.png`
**Seed:** 202409

**Prompt:**
Soft aurora ribbons sweeping diagonally across a starfield, thin crystalline zodiac constellations as subtle linework, gentle lunar glow in the top-left corner, center area kept clean for text, a barely visible 7-tick halo hinting at the week rhythm — [ЯКОРЬ СТИЛЯ].

### Tarot Reading
**File:** `AstroLuna/sections/tarot/tarot_bg_1920x1080_dark.png`
**Seed:** 777
**Additional Negative:** real tarot deck art, readable runes/text, known occult IP symbols

**Prompt:**
Velvet-dark cosmic cloth tabletop seen from above, dim crescent reflection, abstract non-IP arcane sigils around the edges only, three soft light pools arranged for card slots (left, center, right), mystical yet minimal, UI-friendly — [ЯКОРЬ СТИЛЯ].

### Directory/Reference
**File:** `AstroLuna/sections/directory/directory_bg_1920x1080_dark.png`
**Seed:** 31415

**Prompt:**
Library of stars: floating glass-panel "shelves" with constellations shimmering within, gentle teal highlights, a distant zodiac wheel barely visible in the far background, central corridor of negative space for headings, premium clean UI backdrop — [ЯКОРЬ СТИЛЯ].

### Authentication
**File:** `AstroLuna/sections/auth/auth_bg_3x2_dark.png`
**Seed:** 909
**MJ Parameters:** `--ar 3:2 --stylize 90`

**Prompt:**
Minimal lunar gradient with tiny constellation sparkles clustered at corners, a soft spotlight ellipse at center for the form, calming midnight-blue scheme, maximum readability — [ЯКОРЬ СТИЛЯ].

### Pricing
**File:** `AstroLuna/sections/pricing/pricing_bg_1920x1080_dark.png`
**Seed:** 555

**Prompt:**
Three subtle orbit rings suggesting tiers encircling a small glowing moon, elegant glass-morphism glints near the rings, center-right area empty for pricing cards, premium yet understated — [ЯКОРЬ СТИЛЯ].

### Blog/News
**File:** `AstroLuna/sections/blog/blog_bg_1920x1080_dark.png`
**Seed:** 8080

**Prompt:**
Cosmic paper aesthetic: layered translucent nebula "sheets" like pages, soft edge lighting, gentle diagonal flow left-to-right to guide reading, very quiet background texture for legibility — [ЯКОРЬ СТИЛЯ].

### Empty States (404)
**File:** `AstroLuna/sections/empty/404_bg_1920x1080_dark.png`
**Seed:** 404

**Prompt:**
A small wandering comet-lantern crossing a wide calm starfield, distant tiny silver crescent, emotive but serene, huge negative space for the message and CTA — [ЯКОРЬ СТИЛЯ].

### Loop Video
**File:** `AstroLuna/sections/loop/hero_loop_1080p.mp4`
**Seed:** 24680
**Requirements:** 1920×1080 @24fps, 6–8s, loop-safe, bitrate ≤ 4 Mbps

**Prompt:**
Seamless looping star-mist drift with slow parallax layers, occasional micro-twinkle, a faint lunar halo pulse every ~4 seconds, no camera shake, designed for readability — [ЯКОРЬ СТИЛЯ].

## ♈ Zodiac Signs (12 emblematic abstractions)

**General Rules:**
- Emblem/metaphor on left third, right side clean for text
- **Negative for all:** animals photoreal, faces, letters, zodiac glyphs as text

### ♈ Aries
**File:** `AstroLuna/signs/01_aries/bg_1920x1080_dark.png`
**Seed:** 1001
**Prompt:** Shimmering crimson nebula forming stylized ram-horn arcs, faint sparks, controlled glow — [ЯКОРЬ СТИЛЯ].

### ♉ Taurus  
**File:** `AstroLuna/signs/02_taurus/bg_1920x1080_dark.png`
**Seed:** 1003
**Prompt:** Emerald crystal silhouette suggesting a sturdy bull form, translucent facets, cool lunar highlights — [ЯКОРЬ СТИЛЯ].

### ♊ Gemini
**File:** `AstroLuna/signs/03_gemini/bg_1920x1080_dark.png`
**Seed:** 1007
**Prompt:** Twin mirrored comet trails curving toward each other, gentle symmetry, subtle interference glow — [ЯКОРЬ СТИЛЯ].

### ♋ Cancer
**File:** `AstroLuna/signs/04_cancer/bg_1920x1080_dark.png`
**Seed:** 1013
**Prompt:** Silver tide arc resembling a protective shell, pearly spray of particles, calm noctilucent sheen — [ЯКОРЬ СТИЛЯ].

### ♌ Leo
**File:** `AstroLuna/signs/05_leo/bg_1920x1080_dark.png`
**Seed:** 1019
**Prompt:** Solar-plasma crown radiating from a golden core, soft rays tapering into dark space — [ЯКОРЬ СТИЛЯ].

### ♍ Virgo
**File:** `AstroLuna/signs/06_virgo/bg_1920x1080_dark.png`
**Seed:** 1021
**Prompt:** Constellation woven from wheat-like luminous fibers, delicate and precise, pale gold-silver mix — [ЯКОРЬ СТИЛЯ].

### ♎ Libra
**File:** `AstroLuna/signs/07_libra/bg_1920x1080_dark.png`
**Seed:** 1031
**Prompt:** Thin glass-contour balance scales hovering, perfect equilibrium of light and shadow, minimal — [ЯКОРЬ СТИЛЯ].

### ♏ Scorpio
**File:** `AstroLuna/signs/08_scorpio/bg_1920x1080_dark.png`
**Seed:** 1033
**Prompt:** Sapphire stingtail constellation with sparking nodes along the curve, tense elegant arc — [ЯКОРЬ СТИЛЯ].

### ♐ Sagittarius
**File:** `AstroLuna/signs/09_sagittarius/bg_1920x1080_dark.png`
**Seed:** 1039
**Prompt:** Luminous arrow in flight with a graceful trajectory arc, faint star-dust wake — [ЯКОРЬ СТИЛЯ].

### ♑ Capricorn
**File:** `AstroLuna/signs/10_capricorn/bg_1920x1080_dark.png`
**Seed:** 1049
**Prompt:** Mountain ridge constellation glazed with lunar frost, ascendant diagonal silhouette — [ЯКОРЬ СТИЛЯ].

### ♒ Aquarius
**File:** `AstroLuna/signs/11_aquarius/bg_1920x1080_dark.png`
**Seed:** 1051
**Prompt:** Celestial cascade of particles like flowing water, layered ripples, cool teal emphasis — [ЯКОРЬ СТИЛЯ].

### ♓ Pisces
**File:** `AstroLuna/signs/12_pisces/bg_1920x1080_dark.png`
**Seed:** 1061
**Prompt:** Two luminous droplets creating intersecting circular ripples, soft harmonic meeting — [ЯКОРЬ СТИЛЯ].

## 📱 Mobile Versions

For each background, generate 9:16 version with additional prompt:
```
composition tuned for mobile 9:16, 220px safe top/bottom for UI, primary focus at upper-left third.
```

## 🎯 Export & Code Integration

### Export Formats:
- **PNG** for gradient backgrounds
- **WebP** (q=75–80) for compression
- **MP4** (H.264) for hero video: 6–8 sec, ≤ 4MB

### UI Overlays:
```css
backdrop-filter: blur(2px) + overlay:

Dark: rgba(10,12,24,0.35)
Light: rgba(240,245,255,0.25)

Default text: #F4F7FF with 30-40% shadow
```

## 🌙 Mini Icons

### Moon Icon
**File:** `AstroLuna/icons/moon_glass_512.png`
**Seed:** 6061
**Prompt:** Minimal glass-morphism moon icon on transparent, subtle inner glow, no text — [ЯКОРЬ СТИЛЯ].

### Tarot Suits (Abstract)
**Files:** `wands|cups|swords|coins_256.png`
**Seed:** 6073
**Prompt:** Abstract monochrome nebula silhouettes for tarot suits (no letters), clean vector-like edges, transparent background — [ЯКОРЬ СТИЛЯ].

## 📊 Current Implementation Status

### ✅ Currently Implemented:
- Hero background (dark version)
- AstroScope service background  
- TarotPath service background
- ZodiacTome service background
- Zodiac signs: Aries, Leo, Scorpio
- Moon glass-morphism icon

### 🚧 Ready to Generate:
- Light versions of all backgrounds
- Mobile (9:16) variants
- Remaining 9 zodiac signs
- Section backgrounds (weekly, auth, pricing, blog, empty states)
- Hero loop video
- Tarot suit icons

---

This specification ensures consistent visual identity across all AstroLuna assets using the cosmic watercolor aesthetic with precise technical parameters for reproducible results.