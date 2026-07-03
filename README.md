# Liquid Gauge — Metabase Custom Visualization

Display a single numeric value as an animated liquid-fill gauge — a circle filled with liquid up to the percentage level, with a wave animation on the surface.

## Requirements

- Metabase ≥ 1.62.0
- `@metabase/custom-viz` SDK

## Installation

1. Download the latest `.tgz` from the [Releases](https://github.com/ouquoi/metaviz-liquid-gauge/releases) page.
2. In Metabase → **Admin → Visualizations**, upload the `.tgz` file.
3. The **Liquid Gauge** visualization will appear in the chart picker.

## Usage

Your query must return at least one numeric column. The gauge maps the value to a fill level between **Min** and **Max** (default 0–100).

Example query:

```sql
SELECT fill_rate FROM parking_lots WHERE id = 42
```

### Settings

#### Data

| Setting | Description |
|---|---|
| **Value column** | Numeric column used as the fill level. Auto-detected from the first numeric column in the result. |

#### Appearance

| Setting | Description |
|---|---|
| **Fill color** | Color of the liquid and the border ring. Default: `#5F016F`. |
| **Min** | Value that corresponds to 0% fill. Default: `0`. |
| **Max** | Value that corresponds to 100% fill. Default: `100`. |

## Capabilities

- Animated liquid surface (sine-wave) with two layered waves for a 3D effect
- Percentage label centered inside the gauge
- Column name shown as a label below the circle
- Hover tooltip with the exact raw value
- Configurable color, min and max range
- Dark and light theme support
- Respects `prefers-reduced-motion` — static wave when the user has reduced motion enabled
- Responsive: adapts to any card size

## Data requirements

| Column | Required | Type | Notes |
|---|---|---|---|
| Value | Yes | Number | Mapped to fill level between Min and Max |

Values outside the Min–Max range are clamped (negative values show as empty, values above Max show as full). `null` values display as `—` with an empty gauge.

## Development

```bash
npm install
npm run build        # compile + generate .tgz
npm run preview:viz  # standalone preview on port 5178
```
