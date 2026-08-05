import { estimatePVYieldGainPct } from "../../utils/dissipation-model";

interface SolarPanelNoteProps {
  green: number;
  albedo: number;
}

export default function SolarPanelNote({ green, albedo }: SolarPanelNoteProps) {
  const gain = estimatePVYieldGainPct(green, albedo);

  return (
    <div className="solar-panel-note">
      <p>
        Se hai già pannelli fotovoltaici: un tetto più chiaro/verde li fa rendere{" "}
        <strong>di più</strong>, non di meno. Le celle in silicio perdono circa lo 0.4% di potenza
        per ogni grado sopra i 25°C; un tetto scuro sotto i pannelli spinge la loro temperatura di
        esercizio più in alto, un tetto chiaro la abbassa. Con gli interventi scelti sopra, la
        resa stimata è <strong>+{gain.toFixed(1)}%</strong> rispetto a un tetto scuro — un ordine
        di grandezza, non un valore di progetto: dipende da montaggio, ventilazione e modulo.
      </p>
      <p>
        Un caso a parte sono i pannelli <strong>bifacciali</strong> (che captano luce anche sul
        retro): su una superficie molto riflettente possono guadagnare diversamente di più — la
        letteratura tecnica cita tipicamente un +5–20% di resa aggiuntiva a seconda di altezza e
        inclinazione del montaggio, un effetto distinto da quello termico stimato sopra.
      </p>
    </div>
  );
}
