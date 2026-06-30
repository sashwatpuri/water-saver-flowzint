# AquaGuard AI – Design System & Theme Prompt

## Design Philosophy
**Not AI-Generated. Not Trendy. Professional Water Quality Monitoring.**

This is enterprise environmental software for municipalities, campuses, and industrial facilities. The UI should feel:
- **Authoritative** (users trust this for safety decisions)
- **Clear** (water quality is life-critical data)
- **Minimal** (no unnecessary animations or gradients)
- **Functional** (every visual element serves a purpose)

---

## Color Palette

### Primary (Water-Themed)
- **Ocean Deep** `#0F3B6F` – Header, primary CTAs, emphasis
- **Teal** `#1B9B8A` – Status "GOOD", positive indicators
- **Slate** `#2C3E50` – Body text, neutral elements
- **Light Gray** `#F5F7FA` – Cards, subtle backgrounds

### Status Colors (Semantic, not decorative)
- **Safe/Good** `#059669` – Green (aquatic life thriving)
- **Monitor/Fair** `#D97706` – Amber (caution, watch closely)
- **Risk/Poor** `#DC2626` – Red (action needed)

### Neutral
- **Text Primary** `#1F2937` – Black, high contrast
- **Text Secondary** `#6B7280` – Gray, supporting copy
- **Border** `#E5E7EB` – Hairline dividers
- **Background** `#FFFFFF` – Surfaces

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;
```

**Rationale:** System fonts are fast, familiar, trustworthy. No Google Fonts weight overhead.

### Sizing & Weight
- **H1** (Page title): 32px, 600 weight, leading 1.2
- **H2** (Section title): 24px, 600 weight, leading 1.3
- **H3** (Card title): 18px, 600 weight, leading 1.4
- **Body** (Default): 16px, 400 weight, leading 1.6
- **Small** (Labels, helpers): 14px, 400 weight, leading 1.5
- **Mono** (Values, code): `'Menlo', 'Monaco', 'Courier New', monospace – 14px, 500 weight

---

## Component Guidelines

### Cards
- Background: white (`#FFFFFF`)
- Border: 1px solid `#E5E7EB`
- Radius: 8px (subtle, not rounded)
- Padding: 20px (breathing room)
- Shadow: `0 1px 3px rgba(0,0,0,0.08)` (barely visible depth)

**Don't:** Use big rounded corners, gradients, or heavy shadows. This isn't a mobile app.

### Buttons
- Primary CTA: Ocean Deep bg, white text, 16px, 600 weight
- Secondary: Light Gray bg, Slate text, 16px, 600 weight
- Danger: Risk Red bg, white text (only for destructive actions)
- Padding: 12px 20px (comfortable click target)
- Radius: 6px (matches card subtlety)
- Hover: 10% darker background, no scale transform
- Cursor: Pointer always

**Don't:** Use bright gradients, outline styles, or animated transforms.

### Data Display
- **Metric Cards**: Large number (28px, 600 weight), small label above (12px, gray)
- **Tables**: Bordered rows, no alternating bg colors, 1px dividers
- **Charts**: Clean lines, minimal gridlines, no 3D effects
- **Alerts**: Color-coded left border (4px) + icon + text. No rounded corners.

### Spacing System
```
8px = xs (between adjacent elements)
12px = sm (component padding)
16px = md (section spacing)
20px = lg (card padding)
24px = xl (major section breaks)
```

Use this consistently. No random pixel values.

---

## Layout Principles

### Main Dashboard
```
┌─ Header (Ocean Deep bg, white text) ───────────────────────────┐
│ AquaGuard AI  │  Location: Monitoring Point A  │  Last Update: X │
├─────────────────────────────────────────────────────────────────┤
│ ┌─ Alert Banner (if risk) ─────────────────────────────────────┤
│ │ ⚠️  DO below safe threshold. Aeration recommended.            │
│ └─────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ Metrics Row (4 cards) ──────────────────────────────────────┤
│ │ [pH] [TDS] [DO] [Turbidity]                                  │
│ └─────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ Chart Section ──────────────────────────────────────────────┤
│ │ 24h Trend (Line chart, minimal gridlines)                    │
│ └─────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ Chat & Forecast ────────────────────────────────────────────┤
│ │ Left: Chat messages │ Right: 24h forecast table              │
│ └─────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
```

### Responsive
- **Desktop** (>1024px): Full layout as above
- **Tablet** (768–1024px): 2-column grid, stack forecast below
- **Mobile** (<768px): Single column, hide forecast, show chat only

---

## Visual Dos & Don'ts

### ✅ DO
- Use whitespace generously (breathing room)
- Make status clear with color + icon (not color alone)
- Use monospace font for numeric values (helps scan)
- Left-align body text
- Use semantic colors (green = safe, red = risk)
- Keep animations to hover states only
- Use hairline borders (1px)

### ❌ DON'T
- Add gradients (looks dated and is hard to scan)
- Use drop shadows (unnecessary depth)
- Make all numbers big and bold (hierarchy matters)
- Add animations on load/scroll (distracting)
- Use more than 3 colors in one component
- Round corners aggressively (>12px)
- Use ALL CAPS for body text
- Add decorative icons everywhere

---

## Example: Metric Card Component

```jsx
<div style={{
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center'
}}>
  <label style={{
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '400',
    display: 'block',
    marginBottom: '8px'
  }}>
    Dissolved Oxygen
  </label>
  
  <div style={{
    fontSize: '32px',
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Menlo, Monaco, monospace'
  }}>
    6.8 mg/L
  </div>
  
  <div style={{
    fontSize: '12px',
    color: '#059669',
    marginTop: '8px'
  }}>
    ✓ Safe (min 5.0)
  </div>
</div>
```

---

## Example: Alert Banner

```jsx
<div style={{
  background: '#FEF2F2',
  borderLeft: '4px solid #DC2626',
  padding: '16px',
  borderRadius: '0px',  // Only right corners
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start'
}}>
  <span style={{ fontSize: '20px' }}>⚠️</span>
  <div>
    <div style={{
      fontWeight: '600',
      color: '#DC2626'
    }}>
      Water quality at risk
    </div>
    <div style={{
      fontSize: '14px',
      color: '#6B7280',
      marginTop: '4px'
    }}>
      DO dropped to 4.8 mg/L (safe minimum: 5.0). Recommend aeration within 2 hours.
    </div>
  </div>
</div>
```

---

## Design System Code (CSS Variables)

```css
:root {
  /* Colors */
  --color-ocean-deep: #0F3B6F;
  --color-teal: #1B9B8A;
  --color-slate: #2C3E50;
  --color-light-gray: #F5F7FA;
  
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
  --color-bg: #FFFFFF;
  
  --color-safe: #059669;
  --color-monitor: #D97706;
  --color-risk: #DC2626;
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
  
  /* Spacing */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 20px;
  --space-xl: 24px;
  
  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## Implementation Checklist

- [ ] Use system fonts (no Google Fonts)
- [ ] All colors from palette above
- [ ] Spacing only in 8px multiples
- [ ] Border radius max 12px
- [ ] No gradients
- [ ] No animations (except hover states)
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] All text is black or dark gray (high contrast)
- [ ] Icons are minimal, semantic (not decorative)
- [ ] Tables/lists have clear row dividers
- [ ] Forms have clear labels + helper text
- [ ] Buttons have clear hover state (darker bg, never scale)
- [ ] Status is always color + text (not color alone)

---

## Why This Design Works for Water Quality

1. **Authority:** Ocean Deep + Slate + white = Government/Municipality
2. **Trust:** No playful colors or animations = serious safety data
3. **Clarity:** Monospace numbers = easy to read in meetings
4. **Speed:** Minimal cognitive load = faster decisions
5. **Accessibility:** High contrast (dark text on light), semantic colors
6. **Timeless:** Looks professional in 2026, 2030, 2035

This is what your users see in city halls, water treatment plants, and campus operations centers.
