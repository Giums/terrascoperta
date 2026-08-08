// Soglie calibrate sui valori FRP (Fire Radiative Power, MW) osservati
// davvero su Etna e Stromboli via NASA FIRMS/VIIRS: Stromboli, in attività
// pressoché continua, segna stabilmente ~10-12 MW; Etna in fase di degassamento
// segna punti sparsi sotto i 5 MW. Non è una scala scientifica ufficiale — è
// una lettura qualitativa di un proxy satellitare, dichiarata come tale.
export function activityLabel(frp: number): string {
  if (frp >= 15) return "probabile attività eruttiva intensa";
  if (frp >= 5) return "attività termica significativa";
  return "debole segnale termico";
}
