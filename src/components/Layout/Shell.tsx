import type { ReactNode } from "react";
import "./Shell.css";

interface ShellProps {
  header: ReactNode;
  map: ReactNode;
  panel?: ReactNode;
}

export default function Shell({ header, map, panel }: ShellProps) {
  return (
    <div className="shell">
      <header className="shell__header">{header}</header>
      <div className="shell__body">
        <div className="shell__map">{map}</div>
        {panel && <aside className="shell__panel">{panel}</aside>}
      </div>
    </div>
  );
}
