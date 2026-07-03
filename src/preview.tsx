import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { LiquidGauge } from "./LiquidGauge";
import type { Settings } from "./types";

const MOCK_SERIES = [
  {
    data: {
      cols: [{ name: "fill_rate", display_name: "Fill rate", base_type: "type/Float" }],
      rows: [[62]],
    },
  },
];

function App() {
  const [dark, setDark]   = useState(false);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [value, setValue] = useState(62);

  const series = [{
    data: {
      cols: [{ name: "fill_rate", display_name: "Fill rate", base_type: "type/Float" }],
      rows: [[value]],
    },
  }];

  const settings: Settings = { valueColumn: "fill_rate", minValue: 0, maxValue: 100 };
  const labelStyle = { color: dark ? "#ccc" : "#333", display: "flex", alignItems: "center", gap: 4 };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, background: dark ? "#111" : "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={labelStyle}>Width:&nbsp;<input type="number" value={width} onChange={e => setWidth(+e.target.value)} style={{ width: 70 }} /></label>
        <label style={labelStyle}>Height:&nbsp;<input type="number" value={height} onChange={e => setHeight(+e.target.value)} style={{ width: 70 }} /></label>
        <label style={labelStyle}>Value:&nbsp;<input type="range" value={value} onChange={e => setValue(+e.target.value)} min={0} max={100} /></label>
        <span style={{ color: dark ? "#ccc" : "#333", alignSelf: "center" }}>{value}%</span>
        <label style={labelStyle}><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />&nbsp;Dark</label>
      </div>
      <div style={{ width, height, border: `1px solid ${dark ? "#333" : "#ddd"}`, borderRadius: 8, overflow: "hidden" }}>
        <LiquidGauge
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          series={series as any}
          settings={settings}
          width={width}
          height={height}
          colorScheme={dark ? "dark" : "light"}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onClick={() => {}}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onHover={() => {}}
        />
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<StrictMode><App /></StrictMode>);
// suppress unused warning
void MOCK_SERIES;
