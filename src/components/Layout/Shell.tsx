import { useState, type ReactNode } from "react";
import "./Shell.css";

interface ShellProps {
  header: ReactNode;
  map: ReactNode;
  panel?: ReactNode;
}

export default function Shell({ header, map, panel }: ShellProps) {
  const [panelSide, setPanelSide] = useState<"left" | "right">("right");

  return (
    <div className="shell">
      <header className="shell__header">{header}</header>
      <div className={`shell__body shell__body--panel-${panelSide}`}>
        <div className="shell__map">{map}</div>
        {panel && (
          <aside className="shell__panel">
            <button
              type="button"
              className="shell__panel-move"
              onClick={() => setPanelSide((s) => (s === "right" ? "left" : "right"))}
              title={panelSide === "right" ? "Sposta pannello a sinistra" : "Sposta pannello a destra"}
              aria-label={panelSide === "right" ? "Sposta pannello a sinistra" : "Sposta pannello a destra"}
            >
              {panelSide === "right" ? "⇤" : "⇥"}
            </button>
            {panel}
          </aside>
        )}
      </div>
    </div>
  );
}
