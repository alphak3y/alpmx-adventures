# AlpMX Adventures 🏍️

Modern website for [AlpMX Adventures](https://www.alpmxadventures.com/) — dirt bike rentals & off-road experiences in Southern Utah.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Google Fonts**: Space Grotesk (headings) + Inter (body)

## Getting Started

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Sandstone Black | `#1A1714` | Dark backgrounds, nav, footer |
| Red Rock | `#C4442A` | Primary CTA, accents, active states |
| Burnt Sienna | `#D4714E` | Secondary accent, hover states |
| Desert Bone | `#F5F0E8` | Light section backgrounds |
| Warm White | `#FAFAF7` | Card backgrounds |
| Trail Dust | `#E2D9CC` | Borders, dividers |
| Canyon Gray | `#6B6560` | Secondary text |
| Slate | `#3D3835` | Body text on light backgrounds |

### Typography

- **Headings**: Space Grotesk — uppercase, `letter-spacing: 0.02em`
- **Body**: Inter — 16-17px, `line-height: 1.6`
- **Buttons**: Space Grotesk — semibold, uppercase

### Spacing

8px base unit. All spacing is multiples of 8 (4, 8, 16, 24, 32, 48, 64, 96, 128).

## Homepage Sections

1. **Hero** — Full viewport (93vh) with dirt bike rider in red rock canyon, gradient overlays, dual CTAs
2. **Trust Bar** — Dark strip with credibility signals (5-star rated, 100+ bikes, locations, hours)
3. **Rental Categories** — 3 cards: Dirt Bikes, Trailers, Gear & Equipment
4. **Featured Bikes** — Filterable fleet (All / Beginner / Intermediate / Advanced) with tiered card layout
5. **How It Works** — 3-step timeline (Select → Date → Order)
6. **Video Feature** — YouTube facade pattern (thumbnail → iframe on click)
7. **Pickup Locations** — Southern Utah + Northern Utah cards
8. **Cabin Booking** — Cross-sell split layout (image + CTA)
9. **Testimonials** — 3 review cards, stacked on mobile
10. **CTA Banner** — Full-width Red Rock call to action
11. **Footer** — Logo, link columns, social icons, copyright

## Fleet / Products

| Bike | CC | Level | Price |
|------|----|-------|-------|
| Husqvarna TC250 | 250cc | Intermediate | $230/day |
| KTM 300SX | 300cc | Advanced | $240/day |
| Honda CRF 250F | 250cc | Beginner | $180/day |
| Honda CRF 125F | 125cc | Beginner | $140/day |
| GasGas EX250 | 250cc | Intermediate | Contact |

## Business Info

- **Location**: Apple Valley, UT 84737
- **Phone**: 385-236-8986
- **Email**: ride.alpmx@gmail.com
- **Hours**: Mon–Sat 8AM–7PM, Sunday closed
- **Pickup**: Southern Utah & Northern Utah

## Images

- **Hero**: Local (`/public/images/hero-red-rock.jpg`) — dirt bike rider in red rock canyon
- **Logo**: Local (`/public/images/logo.png`) — circular badge with gold glow treatment
- **Product photos**: Loaded from `alpmxadventures.com/media/`
- **Category/location photos**: Loaded from `alpmxadventures.com/media/`

## Responsive Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640–1024px | 2-column grids |
| Desktop | 1024–1280px | Full 3-column layout |
| Wide | 1280+ | 1200px max container |

## Notes

- YouTube video ID is a placeholder — replace in `src/components/VideoFeature.tsx`
- Testimonials are placeholder text — replace with real reviews
- `allowedDevOrigins` in `next.config.ts` includes the dev server IP for remote access
- Design direction doc: `../pixel-design-direction.md`
