import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { LiquidGauge } from "./LiquidGauge";
import type { Settings } from "./types";

function isNumericCol(c: { base_type?: string; effective_type?: string }): boolean {
  const t = c.base_type ?? c.effective_type ?? "";
  return /Integer|Float|Decimal|Number|BigInteger/i.test(t);
}

const createVisualization: CreateCustomVisualization<Settings> = ({ defineSetting }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = (def: any) => (defineSetting as any)(def);

  return defineConfig<Settings>({
    id: "liquid-gauge",
    getName: () => "Liquid Gauge",
    minSize: { width: 2, height: 2 },
    defaultSize: { width: 4, height: 4 },

    checkRenderable(series) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cols = (series?.[0]?.data?.cols ?? []) as any[];
      const numeric = cols.filter(isNumericCol);
      if (numeric.length === 0) {
        throw new Error("Liquid Gauge requires at least one numeric column (the value to display).");
      }
    },

    settings: {
      // ── Data ──────────────────────────────────────────────────────────
      valueColumn: defineSetting({
        id: "valueColumn",
        title: "Value column",
        widget: "select",
        getSection() { return "Data"; },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDefault(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          return (cols.find(isNumericCol) ?? cols[0])?.name ?? "";
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProps(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          return {
            options: cols
              .filter(isNumericCol)
              .map(c => ({ name: c.display_name || c.name, value: c.name })),
          };
        },
      }),

      // ── Appearance ────────────────────────────────────────────────────
      minValue: ds({
        id: "minValue",
        title: "Min",
        widget: "number",
        getSection() { return "Appearance"; },
        getDefault() { return 0; },
      }),

      maxValue: ds({
        id: "maxValue",
        title: "Max",
        widget: "number",
        getSection() { return "Appearance"; },
        getDefault() { return 100; },
      }),
    },

    VisualizationComponent: LiquidGauge,
  });
};

export default createVisualization;
